//REQUIRE ALL MODULES
const express = require("express");
const session = require("express-session");
const port = process.env.PORT || 10000;
const path = require("path");
const bodyParser = require("body-parser");
const pg = require("pg");

//Start server
var app = express();
const server = require("http").createServer(app);

//Setup Settings for DB, Server & Folders
var io = require("socket.io")(server);
var pF = path.resolve(__dirname, "public");

//postgres
//database url
var pool = new pg.Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'survey_system',
    password: '1994Daniel',
    max: 20
});

//use body parser
app.use(bodyParser.urlencoded({
    extended: true
}));

//use sessions
app.use(session({
    secret: "survey_code",
    resave: true,
    saveUninitialized: true
}));

//redirect scripts to build folder
app.use("/scripts", express.static("build"));

app.use("/images", express.static("images"));

app.use("/styles", express.static("css"));

app.use("/html", express.static("html"));

//if logged in go to item.html, else go to login.html
app.get("/", function (req, resp) {
    if (req.session.name) {
        resp.sendFile(pF + "/main.html");
    } else {
        resp.sendFile(pF + "/login.html");
    }
});
app.get("/login",function(req,resp){
    if(req.session.name){
        resp.sendFile(pF+"/main.html");
    }else{
        resp.sendFile(pF+"/login.html");
    }
     
});
app.get("/create", function (req, resp) {
    resp.sendFile(pF + "/create.html");
});

app.get("/client", function (req, resp) {
    resp.sendFile(pF + "/client.html");
});

app.get("/questions", function (req, resp) {
    resp.sendFile(pF + "/questions.html");
});

app.get("/main", function(req,resp){
    if(req.session.name && req.session.email){
        resp.sendFile(pF + "/main.html");
    }else{
        resp.sendFile(pF + "/login.html");
    }
	   
});

app.get("/profile", function(req,resp){
	resp.sendFile(pF + "/profile.html")
});

app.get("/logout", function(req,resp){
	req.session.destroy();
	resp.redirect("/");
});

//login function
app.post("/login", function (req, resp) {
    var email = req.body.email;
    var password = req.body.password;

    pool.connect(function (err, client, done) {
        if (err) {
            console.log(err);
            resp.end("FAIL");
        }
        client.query("SELECT email, department_id, name FROM admin WHERE email = $1 AND password = $2", [email, password], function (err, result) {
            done();
            if (err) {
                console.log(err);
                resp.end("FAIL");
            }
            if (result.rows.length > 0) {
                req.session.email = result.rows[0].email;
                req.session.department = result.rows[0].department_id;
                req.session.name = result.rows[0].name
                var obj = {
                    status: "success",
                    user: req.session.name
                }
                resp.send(obj);
            } else {
                resp.end("FAIL");
            }
        });
    });
});

//logout
app.post("/logout", function (req, resp) {
    //deletes the session in the db
    req.session.destroy();
    resp.end("success");
});

// create survey
app.post("/createSurvey", function (req, resp) {
    var questions = req.body.questions;
    
    pool.connect(function(err,client,done){
        if (err) {
            console.log(err);
            resp.send("FAIL");
        }
        client.query("SELECT survey_name FROM survey WHERE department_id = $1 and survey_name = $2", [req.session.department, req.body.name],function(err,result){
            done();
            var survey_id; // store survey ID
            if(err) {
                console.log(err);
               return false;
           }
            // ** check if survey Exist in department **
            if(result.rows.length > 0){
                resp.send("survey name already exist in this department");
            }else{
                // ---- Insert survey data ---- //
                client.query("INSERT INTO survey (survey_name,department_id) VALUES ($1,$2) RETURNING id", [req.body.name,req.session.department], function (err, result) {
                    done();
                    if (err) {
                        console.log(err);
                        resp.send("FAIL insert survey");
                    }else{
                        console.log(result.rows[0].id);
                        survey_id = result.rows[0].id;
                        // ---- Insert question data ---- //
                        questions.forEach(function(Element){
                            var question_id; // store question ID
                            if(Element.type == 'ratingQuest'){

                            } else {
                                client.query("INSERT INTO question (question_type, question_text, survey_id) VALUES ($1,$2,$3) RETURNING id", [Element.type,Element.question,survey_id],function(err,result){
                                    done();
                                    if (err) {
                                        console.log(err);
                                        resp.send("FAIL insert question");
                                    }else{
                                        question_id = result.rows[0].id;
                                        // ---- Insert answer option data ---- //
                                        if(Element.answers != undefined){
                                            Element.answers.forEach(function(ans_element){
                                                client.query("INSERT INTO answer_option (answer_text,question_id) VALUES ($1,$2)",[ans_element,question_id],function(err,result){
                                                    if(err){
                                                        console.log(err);
                                                        resp.send('FAIL insert answer option');
                                                    }
                                                });
                                            });
                                        }
                                        
                                    }
                                });
                            }
                
                        });
                    }
                });
                var obj = {
                            survey_name:req.body.name,
                            status:'success'
                        }
                resp.send(obj);
            }
            
        });
        
            
    });
});

app.post("/adminPanel",function(req,resp){
    // TODO check session permission
    
    // *** CREATE ***//
    if(req.body.type == "create"){
        console.log("create");
        resp.sendFile(pF + "/halfEditor.html");
    }
    
    // *** VIEW *** //
    if(req.body.type == 'view') {
       pool.connect(function(err,client,done){
           if (err) {
            console.log(err);
            resp.end("FAIL");
        }
        client.query("SELECT * FROM survey WHERE department_id = $1", [req.session.department], function (err, result) {
            done();
            if (err) {
                console.log(err);
                resp.end("FAIL");
            }
            if (result.rows.length > 0) {
                resp.send(result.rows);
            } else {
                resp.send({
                    message:"No survey in your deparment",
                    status:"No survey"
                });
            }
        });
       });
    }
    // *** MODIFY *** //
    if(req.body.type == 'modify'){
        pool.connect(function(err,client,done){
            if(err){
                console.log(err);
                resp.end('FAIL');
            }
            // --- select survey ---
            var survey_obj = {}; // create survey obj
            survey_obj.questions = [];
            var survey_q_id = [];
            
            client.query("SELECT * FROM survey WHERE id = $1 and department_id = $2",[req.body.survey_id,req.session.department],function(err,result){
                done();
                if(err){
                    console.log(err);
                    resp.end('FAIL');
                }
                if(result.rows.length == 1){
                    survey_obj.name = result.rows[0].survey_name;
                    survey_obj.questions = [];
                }
                else if(result.rows.length > 1){
                    resp.send("ERROR: multiple survey found");
                }else{
                    resp.send("no such survey in this department");
                }
            });
            
            // --- select questions by survey_id --- 
            client.query("SELECT * FROM question WHERE survey_id = $1",[req.body.survey_id],function(err,result){
                done();
                if(err){
                    console.log(err);
                    resp.end('FAIL');
                }
                if(result.rows.length > 0){
                    for (var i=0; i<result.rows.length;i++){
                        //console.log("i",i);
                        question_obj = {};
                        question_obj.question = result.rows[i].question_text;
                        question_obj.question_type = result.rows[i].question_type;
                        question_obj.question_variable = result.rows[i].question_variable;
                        question_obj.answers = [];
                        survey_obj.questions.push(question_obj);
                        survey_q_id.push(result.rows[i].id);
                        if(i == (result.rows.length-1)){
                            select_answer();
                        }
                        
                    }
                    
                }
                
            });
            
            function combineData(survey_question_list, answer_option_list){
                var i = 0;
                survey_question_list.forEach(function(Element){
                    //console.log("IIIII",i);
                    Element.answers = answer_option_list[i];
                    i++
                });
                //console.log(survey_question_list);
                survey_obj.questions = survey_question_list;
                //console.log('SSSSD',survey_obj);
                // !------END POINT ------! //
                resp.send(survey_obj);
            }
            
            // -- select answer option
            var survey_answers_id = [];
            var g = 0;
            function select_answer(){
                for (var y=0;y<survey_q_id.length;y++){
                    client.query("SELECT * FROM answer_option WHERE question_id = $1",[survey_q_id[y]],function(err,result){
                        done();
                        if(err){
                            console.log(err)
                            resp.end("FAIL");
                        }
                        var array = [];
                        if(result.rows.length > 0){
                            var rows = result.rows;
                            
                            for(var x=0; x<rows.length; x++){
                                
                                array.push(rows[x].answer_text);
                            }
                        }
                        survey_answers_id.push(array);
                        //console.log(survey_answers_id);
                        g++
                        if( g == (survey_q_id.length)){
                            //console.log('QQ',survey_obj.questions,'AA',survey_answers_id,"///"); 
                            combineData(survey_obj.questions,survey_answers_id);
                        }
                    });
                    
                }
            }
        });
    }
});

// server listen
server.listen(port, function (err) {
    if (err) {
        console.log(err);
        return false;
    }

    console.log(port + " is running");
});
