var express = require('express'),
    session = require('express-session'),
    bodyParser = require('body-parser'),
    env = require('dotenv').load(),
    secret = require("./app/config/secrets"),
    path = require("path"),
    webpack = require("webpack");

var config = require("./webpack.config");

var app = express(),
    PORT = process.env.PORT || 8080;

var compiler = webpack(config);

app.use(require('webpack-dev-middleware')(compiler, {
    publicPath: "/app/public/bundle.js/",
    lazy: false,
    index:'/app/public/index.html'
}));

app.use(require('webpack-hot-middleware')(compiler));


// Static directory
app.use(express.static(path.join(__dirname + "/app/public")));

//For BodyParser
app.use(bodyParser({ defer: true }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

//Models
var db = require("./app/models");

// Routes for students and secure routes for students
var authenticateStudent = require("./app/controllers/securestudent");
app.use("/api", authenticateStudent);

var student = require("./app/controllers/studentcredentials");
app.use("/", student);

// Routes for Recruiters and secure routes
var authenticateRecruiter = require("./app/controllers/securerecruiter");
app.use("/rsecure", authenticateRecruiter);

var recruiter = require("./app/controllers/recruitercredentials");
app.use("/recruiter", recruiter);

var server;

//Sync Database
db.sequelize.sync({ force: true }).then(function() {
    console.log('Nice! Database looks fine');

    server = app.listen(PORT, function(err) {

        if (!err)
            console.log("Site is live");
        else console.log(err)

    });

}).catch(function(err) {
    console.log(err, "Something went wrong with the Database Update!");
});


module.exports =  server;
