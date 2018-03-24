//REQUIRE ALL MODULES
const express = require("express");
const session = require("express-session");
const port = process.env.PORT || 56789;
const path = require("path");
const bodyParser = require("body-parser");
const pg = require("pg");
var multer  = require('multer');
var upload = multer({ dest: 'images/' })
var storage = multer.diskStorage({
	destination: function(req, file, callback) {
		callback(null, './images')
	},
	filename: function(req, file, callback) {
		console.log(file)
		callback(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname))
	}
})

//Regex
var nameRegex = /^[a-zA-Z ]{3,50}$/;
var emailRegex = /^[a-zA-Z0-9\._\-]{1,50}@[a-zA-Z0-9_\-]{1,50}(.[a-zA-Z0-9_\-])?.(ca|com|org|net|info|us|cn|co.uk|se)$/;
var passwordRegex = /^[^ \s]{4,15}$/;

function regExTest(regEx, input){
    if(regEx.test(input)){
        return true;
    }
    return false;
}

//bcrypt
var bcrypt = require("bcrypt");
const saltRounds = 10;

//Start server
var app = express();
const server = require("http").createServer(app);

//Setup Settings for DB, Server & Folders
var io = require("socket.io")(server);
var pF = path.resolve(__dirname, "public");
var sF = path.resolve(__dirname, "scripts");

//Nodemailer Module
var nodemailer = require('nodemailer');
var transporter = nodemailer.createTransport({
	service: 'hotmail',
    tls: {rejectUnauthorized: false},
	auth: {
		user: 'bcitsurvey999@hotmail.com',
		pass: 'acit3900drc2017'
	}
});

//postgres
//database url
var pool = new pg.Pool({
    user: 'admerase_daniel',
    host: 'localhost',
    password:'1994Daniel',
    database: 'admerase_survey_system',
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

function checkLogin(req,resp){
    if(!req.session.name || req.session==undefined){
        return false;
    }else{
        return true;
    }
}

function checkPermission(req,permission_level){
    if(req.session.permission == permission_level){
        return true;
    }else{
        return false;
    }
}

function getSurveyFromDB(req,resp,client){
    pool.connect(function (err, client, done) {
        if (err) {
            console.log(err);
            resp.end('FAIL');
        }else{
            // Variables
            var survey_obj = {}; // create survey obj
            survey_obj.questions = []; // array to store question
            var survey_q_id = []; // question id for select answer_option loop
            var survey_answers_id = [];
            var req_department_id = req.body.department_id; // var req_survey_id;
            var req_survey_id = req.session.clientSurveyId;
            
            console.log("2222",req_survey_id)

            // start getSurvey function
            getSurvey(err,client,done);
            
            
        }
        
        
        
        // Combine  question list and answer_option list into survey_obj and RESP        
        function combineData(survey_question_list, answer_option_list) {
            var i = 0;
            var ratingQ_stuck_num;
            var duplicate_ratingQ_list = [];
            for(var x= 0; x<survey_question_list.length;x++){
                var prev_question = survey_question_list[x-1];
                var current_question = survey_question_list[x];
                if(current_question.question_type == "ratingQuest"){
                    
                    if(prev_question != undefined && current_question.question == prev_question.question){
                        survey_question_list[ratingQ_stuck_num].question_column.push(current_question.question_column);
                        survey_question_list[ratingQ_stuck_num].id.push(current_question.id);
                        duplicate_ratingQ_list.push(x);
                        
                    }else{
                        ratingQ_stuck_num = x;
                        temp_question_column = current_question.question_column;
                        temp_question_id = current_question.id;
                        current_question.question_column = [];
                        current_question.question_column.push(temp_question_column)
                        current_question.id = []
                        current_question.id.push(temp_question_id)
                        current_question.answers = answer_option_list[i]
                    }
                }else{
                    survey_question_list[x].answers = answer_option_list[i];
                }
                i++
            }
            // remove duplicate rating question
            var h = 0
            for(var y=0;y<duplicate_ratingQ_list.length;y++){
                survey_question_list.splice(duplicate_ratingQ_list[y]-h,1);
                h++
            }
            survey_obj.questions = survey_question_list;
            
            // Send Response with survey_obj
            resp.send(survey_obj);
        }
        
        // --- SELECT Survey ---
        function getSurvey(err,client,done){            
            // if request survey obj from client
            if (req.body.client || req.session.name == undefined) {
                
                // get survey from db
                client.query("SELECT * FROM survey WHERE id = $1", [req_survey_id], function (err, result) {
                    done();
                    if (err) {
                        console.log(err);
                        resp.end('FAIL');
                    }
                    if (result.rows.length == 1) {
                        req_survey_id = result.rows[0].id;
                        survey_obj.survey_id = req_survey_id;
                        survey_obj.survey_name = result.rows[0].survey_name;
                        survey_obj.questions = [];
                        getQuestion();
                    } else if (result.rows.length > 1) {
                        resp.send("ERROR: multiple survey found");
                    } else {
                        resp.send("no such survey in this department");
                    }
                });

            // if request survey obj from logined user
            } else if(req.session.name){
                req_survey_id = req.body.survey_id;
                survey_obj.id = req_survey_id;
                req_department_id = req.session.department;
                // get survey from db
                client.query("SELECT * FROM survey WHERE id = $1 and department_id = $2 and isopen=false and been_published = false", [req_survey_id, req_department_id], function (err, result) {
                    done();
                    if (err) {
                        console.log(err);
                        resp.end('FAIL');
                    }
                    if (result.rows.length == 1) {
                        req_survey_id = result.rows[0].id;
                        survey_obj.survey_name = result.rows[0].survey_name;
                        survey_obj.survey_id = req_survey_id;
                        survey_obj.questions = [];
                        getQuestion();
                    } else if (result.rows.length > 1) {
                        resp.send("ERROR: multiple survey found");
                    } else {
                        resp.send({
                            status:false,
                            msg:"It is currently publishing, been published or no such survey in your department"});
                    }
                });
            }else{
                resp.send({
                    status:false,
                    msg:"Not logined and not a client"
                })
            }
        }
        
        // --- SELECT Question ---
        function getQuestion() {
            client.query("SELECT * FROM question WHERE survey_id = $1", [req_survey_id], function (err, result) {
                done();
                if (err) {
                    console.log(err);
                    resp.end('FAIL');
                }
                if (result.rows.length > 0) {
                    
                    // append selected questions
                    for (var i = 0; i < result.rows.length; i++) {
                        question_obj = {};
                        question_obj.id = result.rows[i].id
                        question_obj.question = result.rows[i].question_text;
                        question_obj.question_type = result.rows[i].question_type;
                        question_obj.questionImage = result.rows[i].question_image;
                        question_obj.answers = [];
                        question_obj.question_column = result.rows[i].question_column;
                        survey_obj.questions.push(question_obj);
                        
                        // push question id to survey_q_id array
                        survey_q_id.push(result.rows[i].id);
                        if (i == (result.rows.length - 1)) {
                            select_answer();
                        }
                    }
                } else {
                    combineData(survey_obj.questions, survey_answers_id);
                }

            });
        }
        
        // --- SELECT answer ---
        function select_answer() {
            var g = 0;
            for (var y = 0; y < survey_q_id.length; y++) {
                client.query("SELECT * FROM answer_option WHERE question_id = $1", [survey_q_id[y]], function (err, result) {
                    done();
                    if (err) {
                        console.log(err)
                        resp.end("FAIL");
                    }
                    var array = [];
                    if (result.rows.length > 0) {
                        var rows = result.rows;

                        for (var x = 0; x < rows.length; x++) {

                            array.push(rows[x].answer_option_text);
                        }
                    }
                    survey_answers_id.push(array);
                    g++
                    if (g == (survey_q_id.length)) {
                        combineData(survey_obj.questions, survey_answers_id);
                    }
                });
            }
        }
    });
}
//redirect scripts to build folder
app.use("/scripts", express.static("build"));

app.use("/images", express.static("images"));

app.use("/styles", express.static("css"));

app.use("/html", express.static("html"));

app.use("/lib", express.static("lib"));


app.use(function(req, res, next) {
  res.set('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
  next();
});

app.get("/", function (req, resp) {
    resp.sendFile(pF+"/client.html");
});
app.get("/login", function (req, resp) {
    if(checkLogin(req,resp)){
        resp.sendFile(pF + "/main.html");
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
    if(req.session.clientSurveyId){
        resp.sendFile(pF + "/questions.html");
    }else{
        resp.sendFile(pF + "/client.html");
    }
    
});

app.get("/main", function (req, resp) {
    if(checkLogin(req,resp)){
        resp.sendFile(pF+"/main.html")
    }else{
        resp.sendFile(pF+"/login.html");

    }
});

app.get("/admin", function(req,resp){
    if(req.session.permission=="W"){
	resp.sendFile(pF + "/admin.html")
    } else {
        resp.sendFile(pF + "/profile.html")
    }
});


app.get("/profile", function (req, resp) {
    if(checkLogin(req,resp)){
        resp.sendFile(pF + "/profile.html")
        
    }else{
	   resp.sendFile(pF+"/login.html")
    }
});

app.get("/reset-pass", function(req,resp){
	resp.sendFile(pF + "/pass-reset.html")
});

app.get("/logout", function (req, resp) {
    req.session.destroy();
    resp.redirect("/");
});

app.get("/view",function(req,resp){
    if(checkLogin(req,resp)){
        resp.sendFile(pF + "/view.html")
    }else{
	   resp.sendFile(pF+"/login.html")
    }
})

// convert time
function getTime(){
    
    var new_date = new Date()
    
    var dd = new_date.getDate();
    var mm = new_date.getMonth() + 1;
    var yyyy = new_date.getFullYear()

    var minutes = new_date.getMinutes();
    var hour = new_date.getHours();
    
    var date = yyyy + "-" + mm + "-" + dd + " " + hour +":" + minutes
    return date;
}

function updateSurveyStatus(req,resp){
    
    var current_time = getTime();
    
    console.log("CCCC",current_time);
    pool.connect(function(err,client,done){
        if(err){
            console.log(err);
            resp.end('FAIL');
        }
        
        client.query("UPDATE survey SET isopen=false WHERE end_date < $1",[current_time],function(err,result){
            done();
            client.query("UPDATE survey SET been_published=true,isopen=true WHERE start_date  < $1 and been_published = false",[current_time],function(err,result){
                done();
                if(err){
                    console.log(err);
                    resp.end('Fail');
                }

            });
        })
        
    });

}
app.post("/getClientSurveyId",function(req,resp){
    resp.send(req.session.clientSurveyId);
})
app.post("/client",function(req,resp){
    if(req.body.setsession){
        if(Number.isInteger(parseInt(req.body.survey_id))){
            req.session.clientSurveyId = req.body.survey_id;
        }
    }
    updateSurveyStatus(req,resp);
    getSurveyFromDB(req,resp);
});

//login function
app.post("/login", function (req, resp) {
    updateSurveyStatus();
    if(req.session.name){
        resp.sendFile(pF +"/main.html");
    }
    var email = req.body.email;
    var password = req.body.password;

    pool.connect(function (err, client, done) {
        if (err) {
            console.log(err);
            resp.end("FAIL");
        }
        
        client.query("select (select department_name from department where id = (select department_id from admin where email = $1)) as department_name,email,department_id,name,password,permission,avatar FROM admin where email=$1", [email.toLowerCase()], function (err, result) {
            done();
            if (err) {
                console.log(err);
                resp.end("FAIL");
            }
            console.log(result);
            if (result.rows.length > 0) {
                bcrypt.compare(password, result.rows[0].password, function(err, res) {
                    if(res){
                        req.session.email = result.rows[0].email;
                        req.session.department = result.rows[0].department_id;
                        req.session.department_name = result.rows[0].department_name;
                        req.session.name = result.rows[0].name;
                        req.session.permission  = result.rows[0].permission;
                        req.session.avatar = result.rows[0].avatar;
                        console.log(req.session.permission)
                        var obj = {
                            status: "success",
                            rights:req.session.permission,
                            avatar:req.session.avatar,
                            user: req.session.name,
                        }
                        resp.send(obj);
                        }
                    else {
                        resp.end("Incorrect password");
                    }
                })                
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

//sends RNG password of 5 char to user email
app.post("/pass-reset", function(req, resp){
	var email = req.body.email
	pool.connect(function(err,client,done){
		if(err){
			console.log(err);
			resp.end("FAIL");
		}
		client.query("SELECT email FROM admin where email = $1", [email.toLowerCase()], function(err, result){
			if(err){
				console.log(err);
				resp.end("FAIL")
			}
			console.log(result);
			if(result.rows.length > 0){
				var passCode = Math.random().toString(36).substr(2,5);
				client.query("INSERT INTO passRes (email, passcode) values ($1, $2)",[email.toLowerCase(), passCode], function (err, result){
					if(err){
						console.log(err);
						resp.end("FAIL");
					}
					else {
						var mailOptions = {
							from:"bcitsurvey999@hotmail.com",
							to:email,
							subject:"Recover your password",
							html:"<div>Your passcode for recovery is:<br><br><b><h1>" + passCode + "</h1></b><br>Enter it on the website to be prompted to enter a new password</div>"
						}
						transporter.sendMail(mailOptions,function (error, info){
							if (error) {
                                console.log("shits brokex   ")
								console.log(error)
								resp.end("FAIL");
							}
							else {
								console.log("email sent")
								var obj = {
									status:"success"
								}
								resp.send(obj);
							}
						})
					}
				})
			}
			else {
				client.release();
				resp.end("FAIL");
			}
		})
	})
})

//pass recovery

app.post("/pass_recovery_url", function(req, resp){
	var passcode = req.body.passcode;
	var email = req.body.email;
	var password = req.body.password;
	console.log(req.body);
	pool.connect(function(err,client,done) {
		if(err){
			console.log(err);
			resp.end("FAIL");
		}
		client.query("select * from passRes where email = $1 and passcode = $2 and date = now()",[email.toLowerCase(),passcode],function(err,result){
			console.log(result.rows)
			if(result.rows.length > 0){
                bcrypt.hash(password,saltRounds,function(err,hash){
                    if(err) {
                        client.release();
						console.log(err);
						resp.end("FAIL");
					}
                    client.query("update admin set password = $1 where email = $2",[hash,email.toLowerCase()], function(err,result){
                        if(err) {
                            client.release();
                            console.log(err);
                            resp.end("FAIL");
                        }
                        else {
                            client.release();
                            var obj = {status:"success"}
                            resp.send(obj)
                        }
				    })
			 })
            }
			else {
				client.release();
				resp.end("FAIL");
			}
		})
	})
})

app.post("/getSession", function (req, resp) {
    if (!req.session.name) {
        console.log("no session get")
        resp.sendFile(pF + "/login.html");
    }else{
        var obj = {
            status:"success",
            name: req.session.name,
            department_name: req.session.department_name
        };
        resp.send(obj);
    }
    
});

app.post("/getSurveyList",function(req,resp){
    pool.connect(function(err,client,done){
        if(err){
            console.log(err);
            resp.end("FAIL")
        }
        client.query("Select * From survey where isopen = true",[],function(err,result){
            done();
            if(err){
                console.log(err);
                resp.end("Fail");
            }else{
                if(result.rows.length == 0){
                    resp.send("no survey live");
                }else if(result.rows.length >=0){
                    resp.send(result.rows);
                }else{
                    resp.send("error")
                }
            }
        })
    })
})

// --------- SURVEY MODIFY ACTION -----------//
// create survey
app.post("/createSurvey", function (req, resp) {
    checkLogin(req,resp);
    var questions = req.body.questions;
    
    // check JSON format
    function validateSurveyTitle(survey_title){
        var survey_title = survey_title.replace(/\s\s+/g, ' ');;
        survey_title= survey_title.trim();
        return survey_title;
    }
    // TODO check image url
    function validateImageURL(image_url){
        
    }
    // TODO check all input value and length of question and answer_option array
    var survey_title = validateSurveyTitle(req.body.name);
    
    pool.connect(function (err, client, done) {
        if (err) {
            console.log(err);
            resp.send("FAIL");
        }
        // ** check if survey Exist in department **
        client.query("SELECT survey_name FROM survey WHERE department_id = $1 and survey_name = $2", [req.session.department, survey_title], function (err, result) {
            done();
            var survey_id; // store survey ID
            if (err) {
                console.log(err);
                return false;
            }
            if (result.rows.length > 0) {
                resp.send("survey name already exist in this department");
            } else {
                // ---- Insert survey data ---- //
                client.query("INSERT INTO survey (survey_name,department_id,creator) VALUES ($1,$2,$3) RETURNING id", [survey_title, req.session.department,req.session.name], function (err, result) {
                    done();
                    if (err) {
                        console.log(err);
                        resp.send("FAIL insert survey");
                    } else {
                        survey_id = result.rows[0].id;
                        // ---- Insert question data ---- //
                        questions.forEach(function (Element) {
                            var question_id; // store question ID
                            // TODO ratingQ
                            if (Element.type == 'ratingQuest') {
                                for(var i=0; i< Element.answers[0].length;i++){
                                    client.query("INSERT INTO question (question_type, question_text, survey_id, question_image,question_column) VALUES ($1,$2,$3,$4,$5) RETURNING id", [Element.type, Element.question, survey_id, Element.questionImage,Element.answers[0][i]], function (err, result) {
                                        done();
                                        if (err) {
                                            console.log(err);
                                            resp.send("FAIL insert question");
                                        } else {
                                            question_id = result.rows[0].id;
                                            // ---- Insert answer option data ---- //
                                            if (Element.answers != undefined) {
                                                Element.answers[1].forEach(function (ans_element) {
                                                    client.query("INSERT INTO answer_option (answer_option_text,question_id) VALUES ($1,$2)", [ans_element, question_id], function (err, result) {
                                                        done();
                                                        if (err) {
                                                            console.log(err);
                                                            resp.send('FAIL insert answer option');
                                                        }
                                                    });
                                                });
                                            }

                                        }
                                    });
                                }
                                
                            } else {
                                client.query("INSERT INTO question (question_type, question_text, survey_id, question_image) VALUES ($1,$2,$3,$4) RETURNING id", [Element.type, Element.question, survey_id, Element.questionImage], function (err, result) {
                                    done();
                                    if (err) {
                                        console.log(err);
                                        resp.send("FAIL insert question");
                                    } else {
                                        question_id = result.rows[0].id;
                                        // ---- Insert answer option data ---- //
                                        if (Element.answers != undefined) {
                                            Element.answers.forEach(function (ans_element) {
                                                client.query("INSERT INTO answer_option (answer_option_text,question_id) VALUES ($1,$2)", [ans_element, question_id], function (err, result) {
                                                    done();
                                                    if (err) {
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
                    survey_name: survey_title,
                    status: 'success'
                }
                resp.send(obj);
            }

        });
    });
});

// update DB with modified survey
app.post("/modifySurvey", function (req, resp) {
    checkLogin(req,resp);
    var questions = req.body.questions;
    pool.connect(function (err, client, done) {
        if (err) {
            console.log(err);
            resp.send("FAIL");
        }
        // ** check if survey Exist in department **
        client.query("SELECT * FROM survey WHERE department_id = $1 and survey_name = $2 and been_published = false", [req.session.department, req.body.name], function (err, result) {
            done();
            var survey_id; // store survey ID
            if (err) {
                console.log(err);
                return false;
            }
            if (result.rows.length > 0) {
                // ---- Update survey's time stamp ----//
                client.query("UPDATE survey SET updated = now() WHERE id = $1 RETURNING id", [result.rows[0].id], function (err, result) {
                    done();
                    if (err) {
                        console.log(err);
                        resp.send("FAIL to update survey");
                    } else {
                        survey_id = result.rows[0].id;
                        // ---- Delete question ---- //
                        client.query("DELETE FROM question WHERE survey_id = $1", [survey_id], function (err, result) {
                            done();
                            if (err) {
                                console.log(err);
                                resp.send("FAIL to update survey WHEN deleting question");
                            }
                            // ---- Insert question data ---- //
                            questions.forEach(function (Element) {
                                console.log("EE",Element);
                                var question_id; // store question ID
                                // TODO ratingQ
                                if (Element.type == 'ratingQuest') {
                                    for(var i=0; i< Element.answers[0].length;i++){
                                        client.query("INSERT INTO question (question_type, question_text, survey_id, question_image,question_column) VALUES ($1,$2,$3,$4,$5) RETURNING id", [Element.type, Element.question, survey_id, Element.questionImage,Element.answers[0][i]], function (err, result) {
                                            done();
                                            if (err) {
                                                console.log(err);
                                                resp.send("FAIL insert question");
                                            } else {
                                                question_id = result.rows[0].id;
                                                // ---- Insert answer option data ---- //
                                                if (Element.answers != undefined) {
                                                    Element.answers[1].forEach(function (ans_element) {
                                                        client.query("INSERT INTO answer_option (answer_option_text,question_id) VALUES ($1,$2)", [ans_element, question_id], function (err, result) {
                                                            done();
                                                            if (err) {
                                                                console.log(err);
                                                                resp.send('FAIL insert answer option');
                                                            }
                                                        });
                                                    });
                                                }

                                            }
                                        });
                                    }

                                } else {
                                    client.query("INSERT INTO question (question_type, question_text, survey_id, question_image) VALUES ($1,$2,$3,$4) RETURNING id", [Element.type, Element.question, survey_id, Element.questionImage], function (err, result) {
                                        done();
                                        if (err) {
                                            console.log(err);
                                            resp.send("FAIL insert question");
                                        } else {
                                            question_id = result.rows[0].id;
                                            // ---- Insert answer option data ---- //
                                            if (Element.answers != undefined) {
                                                Element.answers.forEach(function (ans_element) {
                                                    client.query("INSERT INTO answer_option (answer_option_text,question_id) VALUES ($1,$2)", [ans_element, question_id], function (err, result) {
                                                        done();
                                                        if (err) {
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
                        });

                    }
                    var obj = {
                        survey_name: req.body.name,
                        status: 'success'
                    }
                    resp.send(obj);
                });
            } else {
                resp.send("No survey in your department");
            }
        });
    });
});

// get view from DB
app.post("/viewSurvey",function(req,resp){
    checkLogin(req,resp);
    var resp_obj = {}
    pool.connect(function(err,client,done){
       if(err){
           console.log(err);
           resp.end('FAIL');
       }else{
           client.query("SELECT *,(SELECT COUNT(*) FROM answer WHERE answer.answer_id = answer_option.id) as count FROM question LEFT JOIN answer_option ON question.id = answer_option.question_id WHERE survey_id = (SELECT id FROM survey WHERE id = $1 and department_id = $2)",[req.body.survey_id,req.session.department],function(err,result){
               done();
               if(result.rows.length>0){
                   for(var i=0; i<result.rows.length;i++){
                       var question_text = result.rows[i].question_text;
                       if(typeof resp_obj[question_text] == 'undefined'){
                           resp_obj[question_text] = [];
                       }
                       var answer_option_text = result.rows[i].answer_option_text;
                       var answer_count = parseInt(result.rows[i].count);
                        var tmp_array = []
                        tmp_array.push(answer_option_text);
                        tmp_array.push(answer_count);
                       resp_obj[question_text].push(tmp_array);
                   }
                   resp.send(resp_obj);
               }else{
                   resp.send("no result");
               }
           });
       }
    });
})

app.post("/getSurveyData",function(req,resp){
   checkLogin(req,resp);
    var response_array = [];
    var answer_array = [];
    pool.connect(function(err,client,done){
       if(err){
           console.log(err);
           resp.end('FAIL');
       }else{
           client.query("SELECT * FROM response WHERE survey_id = (SELECT id FROM survey WHERE id = $1 and department_id = $2)",[req.body.survey_id,req.session.department],function(err,result){
               done();
               if(err){
                   console.log(err);
                   resp.end("FAIL");
               }
               if(result.rows.length>0){
                   for(var i=0; i<result.rows.length;i++){
                       var total_response = result.rows.length;
                       var response_id = result.rows[i].id;
                       var new_obj = {}
                       new_obj.response_id = result.rows[i].id;
                       new_obj.response_time = result.rows[i].response_time;
                       new_obj.response_result = []
                       response_array.push(new_obj);
                       if(i == result.rows.length-1){
                           console.log("arry",response_array);
                           getAnswers();
                       }
                   }
               }else{
                   resp.send("no result");
               }
           });
           function getAnswers(){
               console.log("RESPPP AA",response_array)
               var g= 0;
               for(var k=0; k<response_array.length;k++){
                   var select_answer_query;
                   
                   client.query("SELECT (select question_text from question where question.id = answer.question_id) as question_text,(select question_column from question where question.id = answer.question_id) as question_column, (select answer_option_text from answer_option where answer_option.id = answer.answer_id) as answer_option_text,answer_text FROM answer WHERE response_id = $1",[response_array[k].response_id],function(err,result){
                       done();
                       if(err){
                           console.log(err);
                           resp.end("FAIL");
                       }
                       console.log("RESULT",result)
                       if(result.rows.length>0){
                           var array = [];
                           for(var x=0; x<result.rows.length;x++){
                               var new_obj_2 = {} 
                               new_obj_2.question_text = result.rows[x].question_text;
                               new_obj_2.question_column = result.rows[x].question_column;
                               new_obj_2.answer_option_text = result.rows[x].answer_option_text;
                               new_obj_2.short_answer_text = result.rows[x].answer_text;
                               array.push(new_obj_2);
                           }
                           answer_array.push(array);
                       }
                       g++
                       if(g == response_array.length){
                           console.log("sent ANSWER",answer_array.length,response_array.length);
                           combineTwoArray(answer_array,response_array);
                       }
                   })
               }
               
           }
           
           function combineTwoArray(answer_array,response_array){
               for(var i=0;i<response_array.length;i++){
                   response_array[i].response_result = answer_array[i];
               }
               resp.send(response_array);
           }
       }
    });
});

app.post("/insertSurveyResult",function(req,resp){
    var questions = req.body.result.questions;
    var survey_id = req.body.result.survey_id;
    var department_id = parseInt(req.body.department_id);
    
    function checkNull(variable){
        if(variable == "" || variable == null || survey_id ==undefined){
            return false;
        }else{
            return true;
        }
    }
    function answerValidCheck(result_obj){
        var questions = result_obj.questions;
        var survey_id = parseInt(result_obj.survey_id);
        // check survey ID
        if(!checkNull(survey_id) || !Number.isInteger(survey_id)){
            console.log("survey_id fail",!checkNull(survey_id),!Number.isInteger(survey_id))
            return false;
        }
        // check department ID
        if(!checkNull(department_id) || !Number.isInteger(department_id)){
            console.log("insert response input department_id fail",!checkNull(department_id),!Number.isInteger(department_id))
            return false;
        }
        // check questions array
        if(questions.length == 0 || questions.length == null || questions == null || !(questions instanceof Array)){
            console.log("question array fail")
            return false;
        }
        // check each question 
        for(var i=0; i<questions.length; i++){
            //TODO rating question check
            if(questions[i].question_type =="ratingQuest"){
                
            }else{
                // check question id
                if(!checkNull(questions[i].id) || !Number.isInteger(parseInt(questions[i].id))){
                    console.log("questionID fail")
                    return false
                }
            }
        }
        return true;
    }
    
    // if valide check true
    if(answerValidCheck(req.body.result)){
           pool.connect(function(err,client,done){
               client.query("INSERT INTO response (survey_id,department_id) VALUES ((SELECT id FROM survey WHERE id = $1),$2) RETURNING id,survey_id",[req.body.result.survey_id,req.body.department_id],function(err,result){
                   done();
                   if(err){
                       console.log(err);
                       resp.end('FAIL');
                   }
                   if(result.rowCount == 1){
                       
                       var response_id = result.rows[0].id;
                       var s_id = result.rows[0].survey_id;
                       for(var i=0; i<questions.length;i++){
                           var question_id = parseInt(questions[i].id);
                            var answer_id = parseInt(questions[i].result);
                           var answer_option;
                           if(questions[i].question_type == "shortAns"){
                               answer_option = questions[i].result
                           }else{
                               answer_option = String(questions[i].answers[answer_id]);
                           }
                            
                            console.log("QQQQQ",questions[i]  ,questions[i].question_type == "shortAns")
                            // TODO rating insert
                            if(questions[i].question_type == "ratingQuest"){

                            }else if(questions[i].question_type == "shortAns"){
                            // shorAns insert    
                                client.query("INSERT INTO answer (question_id,answer_text,response_id) VALUES ((SELECT id FROM question WHERE id= $1 and survey_id = $4),$2,$3)",[question_id,answer_option,response_id,s_id],function(err,result){
                                   done();
                                   if(err){
                                       console.log(err);
                                       resp.end('FAIL');
                                   }
                                   if(i == questions.length-1){
                                       resp.send("done insert");
                                   }
                               })
                            }else{
                            // multChoice and truefalse insert
                               client.query("INSERT INTO answer (question_id,answer_id,response_id) VALUES ((SELECT id FROM question WHERE id= $1 and survey_id = $4),(SELECT id from answer_option WHERE question_id = $1 and answer_option_text = $2),$3)",[question_id,answer_option,response_id,s_id],function(err,result){
                                   done();
                                   if(err){
                                       console.log(err);
                                       resp.end('FAIL');
                                   }
                                   if(i == questions.length-1){
                                       resp.send("done insert");
                                   }
                               })
                           }
                       }

                   }else{
                       
                   }
               })
           })
    }else{
        resp.send({
            status:"fail",
            msg:"invalid input"
        })
    }
    
    
});

// -------------- SURVEY MODIFY ACTION END -------------- //


// -------------- ADMIN PAGE GET DATA ---------------- //
var req_survey_id;
app.post("/adminPanel", function (req, resp) {
    updateSurveyStatus();
    checkLogin(req,resp);
    // *** VIEW *** //
    if (req.body.type == 'view') {
        pool.connect(function (err, client, done) {
            if (err) {
                console.log(err);
                resp.end("FAIL");
            }
            client.query("SELECT * FROM survey WHERE department_id = $1 ORDER BY id DESC", [req.session.department], function (err, result) {
                done();
                if (err) {
                    console.log(err);
                    resp.end("FAIL");
                }
                if (result.rows.length > 0) {
                    resp.send(result.rows);
                } else {
                    resp.send({
                        message: "No survey in your department",
                        status: "No survey"
                    });
                }
            });
        });
    }
    
    // *** VIEW STATUS *** //
    if(req.body.type == 'view_status'){
        pool.connect(function(err,client,done){
            if(err){
                console.log(err);
                resp.end('FAIL');
            }
            client.query("SELECT survey.*,(SELECT COUNT(*) FROM response WHERE response.survey_id = survey.id) AS count FROM survey WHERE department_id = $1 ORDER BY id DESC",[req.session.department],function(err,result){
                done();
                if(err){
                    console.log(err);
                    resp.end('FAIL')
                }
                if(result.rows.length>0){
                    resp.send(result.rows);
                }else{
                    var obj = {
                        survey_result: "no result"
                    }
                    resp.send(obj)
                }
            });
        });
    }
    
    // *** SCHEDULE PUBLISH ***//
    if(req.body.type == 'schedule_publish'){
        
        // validation for time and date
        function datetimeValid(str){
            var datetime_regex = /[0-9]{4}-(0[1-9]|1[0-2])-(0[1-9]|[1-2][0-9]|3[0-1]) (2[0-3]|[01][0-9]):[0-5][0-9]/g
        
            return datetime_regex.test(str)
        }

        // valid date and time
        if(datetimeValid(req.body.start_date) && datetimeValid(req.body.end_date)){
            pool.connect(function(err,client,done){
                if(err){
                    console.log(err);
                    resp.end('FAIL')
                }
                client.query("UPDATE survey SET start_date=$3 , end_date=$4 WHERE id = $1 and department_id= $2 and been_published = false",[req.body.survey_id, req.session.department,req.body.start_date,req.body.end_date],function(err,result){
                    done();
                    if(err){
                        console.log(err);
                        resp.end('FAIL');
                    }
                    console.log(result)
                    if(result.rowCount == 0){
                        resp.send({
                            status: false,
                            msg:"Survey cannot publish twice"
                        })
                    }else if(result.rowCount > 0){
                        resp.send({
                            status: true,
                            msg:"Successfully schedule survey for publish"
                        })
                    }
                })
            })
        }else{
            resp.send({
                status: false,
                msg:"Date invalid"
            })
        }
        
        
    }
    
    // *** PUBLISH ***//
    if(req.body.type == 'publish'){
        pool.connect(function(err,client,done){
            if(err){
                console.log(err);
                resp.end('FAIL');
            }
            client.query("UPDATE survey SET been_published=true WHERE id = $1 and department_id= $2 and been_published = false",[req.body.survey_id, req.session.department],function(err,result){
                done();
                if(err){
                    console.log(err);
                    resp.end('Fail');
                }
                if(result.rowCount == 0){
                    resp.send({
                        status: false,
                        msg:"survey cannot publish twice"
                    })
                }else if(result.rowCount > 0){
                    client.query("UPDATE survey SET isopen=false WHERE department_id = $1 ",[req.session.department],function(err,result){
                       done();
                        if(err){
                            console.log(err);
                            resp.end('Fail');
                        }
                        client.query("UPDATE survey SET isopen=true, been_published = true WHERE id = $1 and department_id = $2 RETURNING survey_name",[req.body.survey_id,req.session.department],function(err,result){
                            done();
                            if(err){
                                console.log(err);
                                resp.end('FAIL');
                            }else{
                                resp.send(result.rows[0]);
                            }
                        })
                    });
               }
            });
            
        })
    }
    
    // *** MODIFY *** //
    if (req.body.type == 'modify') {
        getSurveyFromDB(req,resp);
    }
    
    // *** VIEW RESPONSE FROM RECENT DAYS *** //
    if(req.body.type == "view_status_with_date"){
        console.log(req.body.before_date)
        var regex = /^\d{4}\-(0?[1-9]|1[012])\-(0?[1-9]|[12][0-9]|3[01])$/g
        
        if(regex.test(req.body.before_date)){
            pool.connect(function(err,client,done){
                if(err){
                    console.log(err);
                    resp.end('FAIL');
                }
                client.query("SELECT survey_id,(SELECT survey_name FROM survey WHERE survey.id = response.survey_id) as survey_name, response_time FROM RESPONSE WHERE response_time > $2 AND department_id = $1 ORDER BY response_time DESC",[req.session.department,req.body.before_date],function(err,result){
                    done();
                    if(err){
                        console.log(err);
                        resp.end('FAIL')
                    }
                    if(result.rows.length>0){
                        resp.send(result.rows);
                        console.log(result.rows);
                    }else{
                        var obj = {
                            response_result: "no result"
                        }
                        resp.send(obj)
                    }
                });
            });
        }else{
            resp.send("invalid input");
        }
    }
    
    // *** DELETE *** //
    if(req.body.type == 'delete'){
        pool.connect(function(err,client,done){
            if(err){
                console.log(err)
                resp.end("FAIL")
            }
            client.query("DELETE FROM survey WHERE id = $1 and department_id = $2 and isopen = false RETURNING survey_name",[req.body.survey_id,req.session.department],function(err,result){
                done();
                if(err){
                    console.log(err);
                    resp.end('FAIL');
                }else{
                    if(result.rows.length > 0){
                        resp.send({
                            status:"success",
                            survey_name:result.rows[0].survey_name
                        })
                    }else{
                        resp.send({
                            status:"FAIL"
                        })
                    }
                    
                }
            })
        });
    }
});

// ----- ADMIN PAGES ----- //
app.post("/adminPage",function(req,resp){
    if(!checkLogin(req,resp)){

    }else{

        if(req.body.type == 'modify'){
            resp.sendFile(pF + "/modify.html")
        }

        if (req.body.type == "create") {
            resp.sendFile(pF + "/halfEditor.html");
        }

        if(req.body.type == "view"){
            resp.sendFile(pF + "/view.html");
        }
    }
});
// changing employees stuff

app.post("/get-employees", function(req,resp){
	pool.connect(function (err, client, done) {
		if (err) {
			console.log(err);
			resp.end('FAIL');
		}
		client.query("SELECT name FROM admin",function(err,result){
		client.release();
		if (result.rows.length < 0) {
			resp.end('FAIL')
		}
		else {
			var obj = {
				names:result.rows,
				status:"success"
				}
				resp.send(obj);
			}
		})
	})
})

app.post("/add-employee", function(req,resp){
	bcrypt.hash(req.body.password,saltRounds,function(err,hash){
		console.log(hash)
		pool.connect(function(err,client,done) {
		if (err) {
			console.log(err);
			resp.end("FAIL")
		}
			console.log(hash);
		client.query('INSERT INTO admin (name, email, password, department_id) VALUES ($1, $2, $3, $4)',[req.body.name, req.body.email.toLowerCase(), hash, req.body.departmentId], function(err,result){
			client.release();
			if(err){
				console.log(err);
				resp.end("FAIL")
			}
			else {
				var obj = {status:'success'}
				resp.send(obj);
			}
		})
	})
	})
})

app.post("/remove-employee", function(req,resp){
	pool.connect(function(err,client,done){
		if (err) {
			console.log(err);
			resp.end("FAIL")
		}
		client.query('DELETE FROM admin WHERE name = $1',[req.body.name],function(err,result){
			client.release();
			if (err) {
				console.log(err);
				resp.end("FAIL")
			}
			else {
				var obj = {status:'success'}
				resp.send(obj);
			}
		})
	})
})

app.post("/edit-employee", function(req,resp){
	pool.connect(function(err,client,done){
		if(req.body.type == 'select'){
			client.query('SELECT name, email, department_id FROM admin WHERE name = $1',[req.body.employee_name],function(err,result){
				client.release();
				if (err) {
					console.log(err);
					resp.end("FAIL")
				}
				if (result.rows.length >0){
					var obj = {
						status:'success',
						user: result.rows[0]
					}
					resp.send(obj)
				}
				else {
					resp.end('FAIL')
				}
			})
		}
		else if ( req.body.type =='edit'){
            
			client.query('UPDATE admin SET name = $1, email = $2, department_id = $3 where name = $1',[req.body.employee_name,req.body.employee_Email.toLowerCase(),req.body.emp_dep],function(err,result){
				client.release();
				if (err) {
					console.log(err);
					resp.end("FAIL")
				} else {
					var obj = {
						status:'success'
					}
					resp.send(obj)
				}
			})
		}
        else if ( req.body.type =='editP'){
            console.log(req.body.pass)
            bcrypt.hash(req.body.pass,saltRounds,function(err,hash){
                console.log(hash)
                client.query('UPDATE admin SET name = $1, email = $2, department_id = $3, password = $4 where name = $1',[req.body.employee_name,req.body.employee_Email.toLowerCase(),req.body.emp_dep,hash],function(err,result){
                    client.release();
                    if (err) {
                        console.log(err);
                        resp.end("FAIL")
                    } else {
                        var obj = {
                            status:'success'
                        }
                        resp.send(obj)
                    }
                })
            })
		}
	})
})

app.post('/add-department',function(req,resp){
    if(regExTest(nameRegex,req.body.department)){
        pool.connect(function(err,client,done){
            if (err){
                console.log(err)
                resp.end("FAIL")
            }
            client.query("INSERT INTO department (department_name) VALUES ($1)",[req.body.department],function(err,result){
                if (err) {
					console.log(err);
					resp.end("FAIL")
				}
                client.query("SELECT * from department",function(err,result){
                    if (err) {
					console.log(err);
					resp.end("FAIL")
				    }
                    console.log(result)
                    var obj = {
                        status:"success",
                        departments:result.rows
                    }
                    resp.send(obj);
                })
            })
        })
    }
})

//Profile page code

app.post("/getUser", function(req,resp){
    var obj = {
        status:"success",
        username:req.session.name,
        email:req.session.email
    }
    resp.send(obj)
})

app.post("/updateUserP", function(req,resp){
    if(regExTest(emailRegex,req.body.email) && regExTest(passwordRegex,req.body.pass)){
        pool.connect(function(err,client,done){
            if (err){
                console.log(err)
                resp.end("FAIL")
            }
            bcrypt.hash(req.body.pass,saltRounds,function(err,hash){
            client.query("UPDATE admin SET password = $1, email=$2 where name=$3",[hash,req.body.email,req.session.name],function(err,result){
                client.release();
                if(err) {
                    console.log(err)
                    resp.end("FAIL")
                } else {
                    req.session.email = req.body.email
                    var obj = {
                        status:'success'
                    }
                    resp.send(obj)
                }
            })
            })
        })
    }
    else {
            resp.end("FAIL")
        }
})

app.post("/getDepList",function(req,resp){
    pool.connect(function(err,client,done){
        client.query("select * from department",function(err,result){
            if(err) {
                    console.log(err)
                    resp.end("FAILnow")
                }
            client.release();
            var obj = {
                status:'success',
                departments:result.rows
            }
            resp.send(obj);
        })
    })
})

app.post("/updateUser", function(req,resp){
    if(regExTest(emailRegex,req.body.email)){
        pool.connect(function(err,client,done){
            if (err){
                console.log(err)
                resp.end("FAIL")
            }
            client.query("UPDATE admin SET email=$1 where name=$2",[req.body.email,req.session.name],function(err,result){
                client.release();
                if(err) {
                    console.log(err)
                    resp.end("FAILnow")
                } else {
                    req.session.email = req.body.email
                    var obj = {
                        status:'success'
                    }
                    resp.send(obj)
                }
            })
        })
    }
    else {
            resp.end("FAIL")
        }
})

var  fs = require('fs');
var upload = multer({ storage : storage}).single('userPhoto');
// ...
app.post('/api/file', function(req, res) {
	upload(req,res,function(err) {
        if(err) {
            console.log(err)
            return res.send("Error uploading file.");
        }
        else{
            pool.connect(function(err,client,done){
                if (err){
                    console.log(err)
                    res.end("FAIL")
                }
                client.query("SELECT avatar FROM admin WHERE name=$1",[req.session.name],function(err,result){
                    if(result.rows.length > 0){
                        fs.unlink("./images/" + result.rows[0].avatar, (err) => {
                          if (err) throw err;
                          console.log('successfully deleted old avatar');
                        });
                    }
                })
                client.query("UPDATE admin SET avatar=$1 where name=$2",[req.file.filename,req.session.name],function(err,result){
                    client.release();
                if(err) {
                    console.log(err)
                    res.end("FAILnow")
                } else {
                    req.session.avatar = req.session.filename
                    res.end("Your new picture has been uploaded please go back to the previous page tocontinue")
                }
                })
            })
        }
    });
})

// server listen
server.listen(port, function (err) {
    if (err) {
        console.log(err);
        return false;
    }
    console.log(port + " is running");
});