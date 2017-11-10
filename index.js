//REQUIRE ALL MODULES
const express = require("express");
const session = require("express-session");
const port = process.env.PORT || 10000;
const path = require("path");
const bodyParser = require("body-parser");
const pg  = require("pg");

//Start server
var app = express();
const server = require("http").createServer(app);

//Setup Settings for DB, Server & Folders
var io = require("socket.io")(server);
var pF = path.resolve(__dirname,"public");

//postgres
//database url
var pool = new pg.Pool ({
	user: 'postgres',
	host1: 'localhost',
	database: 'survey_system',
	password: 'password',
	max: 20
});

//use body parser
app.use(bodyParser.urlencoded({
    extended:true
}));

//use sessions
app.use(session({
    secret:"survey_code",
    resave:true,
    saveUninitialized:true
}));

//redirect scripts to build folder
app.use("/scripts",express.static("build"));

app.use("/images", express.static("images"));

app.use("/styles", express.static("css"));

//if logged in go to item.html, else go to login.html
app.get("/", function(req, resp){
    if(req.session.user){
        resp.sendFile(pF + "/admin.html");
    }else{
        resp.sendFile(pF + "/login.html");
    }
});

app.get("/create", function(req, resp){
    resp.sendFile(pF + "/create.html");
});

app.get("/client", function(req, resp){
    resp.sendFile(pF + "/client.html");
});

app.get("/questions", function(req, resp){
    resp.sendFile(pF + "/questions.html");
});

//login function
app.post("/login",function(req,resp){
    var email = req.body.email;
    var password = req.body.password;
    
    pool.connect(function(err, client, done){
        if(err){
            console.log(err);
            resp.end("FAIL");
        }
        client.query("SELECT username, id FROM users WHERE email = $1 AND password = $2", [email, password], function(err, result){
			client.release()
            if(err){
                console.log(err);
                resp.end("FAIL");
            }
            if(result.rows.length >0){
                req.session.user = result.rows[0];
                var obj = {
                    status:"success",
                    user:req.session.user
                }
                resp.send(obj);
            }else{
                resp.end("FAIL");
            }
        });
    });
});

var allAnswers = [];

//app.post("/questions",function(req,resp){
//    pool.connect(function(err, client, done){
//        
//        if(err){
//            console.log(err);
//            resp.send("*Connection to the database failed*");
//        }
//        
//        client.query("SELECT * FROM questions;", [], function(err, result) {
//            
//            if(err) {
//                console.log(err);
//                resp.send("*Connection to the database failed*");
//            }
//            
//            if(result.rows.length > 0) {
//                
//                req.session.qPack = result.rows;
//                
//                for (var i=0; i < req.session.qPack.length; i++) {
//                    client.query("SELECT * FROM " + result.rows[i].a_id + ";", [], function(err, result2) {
//                        if(err) {
//                            console.log(err);
//                            resp.send("*Connection to the database failed*");
//                        }
//                        if(result2.rows.length > 0) {
//                            allAnswers.push(result2.rows);
//                        } else {
//                            resp.send("*Connection to the database failed*");
//                        }
//                    });
//                }
//                client.release();
//                var obj = {
//                    status: "success",
//                    qPack: req.session.qPack,
//                    aArr: allAnswers
//                }
//                allAnswers = [];
//                resp.send(obj);
//                
//            } else {
//                resp.send("*Connection to the database failed*");
//            }
//            
//        });
//    });
//});

//logout
app.post("/logout",function(req, resp){
    //deletes the session in the db
    req.session.destroy();
    resp.end("success");
});


// server listen
server.listen(port, function(err){
    if(err){
        console.log(err);
        return false;
    }
    
    console.log(port+" is running");
});