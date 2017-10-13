//set everything up
const express = require("express");
const port = process.env.PORT || 10000;
const path = require("path");
const bodyParser = require("body-parser");
const session = require("express-session");
const pg  = require("pg");
var pF = path.resolve(__dirname,"public");
var app = express();

//create a new server for socket, but combine it with express functions
const server = require("http").createServer(app);

//create a socket server with the new server
var io = require("socket.io")(server);

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

app.use("/scripts",express.static("build"));

//root folder
app.get("/", function(req, resp){
    resp.sendFile(pF+"/index.html");
});


// server listen
server.listen(port, function(err){
    if(err){
        console.log(err);
        return false;
    }
    
    console.log(port+" is running");
});