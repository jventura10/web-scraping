require("dotenv").config();
var express = require("express");
var mongoose = require("mongoose");
var exphbs = require("express-handlebars");
var bodyParse = require("body-parser");
var passport = require("passport");
var flash = require("connect-flash");
var cookieParser = require("cookie-parser");
var session = require("express-session");

//Scraping tools
var axios = require("axios");
var cheerio = require("cheerio");

//Connect to MongoDB
var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/mongoHeadlines";
mongoose.connect(MONGODB_URI);

// Require all models
var db = require("./models");
//SET PORT
var PORT = process.env.PORT || 3000;
// Initialize Express
var app = express();

//Passport Config
require("./config/passport")(passport);

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
// Make public a static folder
app.use(express.static("public"));

// Handlebars
app.engine(
  "handlebars",
  exphbs({
    defaultLayout: "main"
  })
);
app.set("view engine", "handlebars");

app.use(session({
  key: 'key',
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    expires: 600000
  }
}));

app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

//ROUTES

//HOME PAGE
app.get("/", function (req, res) {
  if (req.isAuthenticated()) {
    res.render("index", req.session.passport.user);
  }
  else {
    res.render("index");
  }
});

//LOGIN PAGE
app.get("/login", function (req, res) {
  if (req.isAuthenticated()) {
    res.redirect("/");
  }
  else {
    res.render("login");
  }
});

//SIGNUP PAGE
app.get("/signup", function (req, res) {
  if (req.isAuthenticated()) {
    res.redirect("/");
  }
  else {
    res.render("signup");
  }
});

//FAVORITES PAGE
app.get("/favorites", function (req, res) {
  if (req.isAuthenticated()) {
    res.render("favorites", req.session.passport.user);
  }
  else {
    res.redirect("/login");
  }
});

//LOGOUT ROUTE
app.get('/logout', function (req, res) {
  req.session.destroy(function (err) {
    req.logout();
    res.clearCookie('user_sid');
    res.clearCookie('firstName');
    res.clearCookie('user_id');
    res.redirect('/');
  });
});

//ADD NEW ARTICLES TO DATABASE
function newArticles() {
  var results = [];

  axios.get("https://talksport.com/football/").then(function (response) {

    // Load the HTML into cheerio and save it to a variable
    // '$' becomes a shorthand for cheerio's selector commands, much like jQuery's '$'
    var $ = cheerio.load(response.data);

    // Select each element in the HTML body from which you want information.
    // NOTE: Cheerio selectors function similarly to jQuery's selectors,
    // but be sure to visit the package's npm page to see how it works
    $(".teaser-item").each(function (i, element) {

      var headline = $(element).children().find(".teaser__headline").text().trim();
      var summary = $(element).children().find(".teaser__subdeck").text().trim();
      var link = $(element).find("a").attr("href");


      // Save these results in an object that we'll push into the results array we defined earlier
      results.push({
        headline: headline,
        summary: summary,
        link: link,
      });
    });

    // Log the results once you've looped through each of the elements found with cheerio
    //console.log(results);
    for (var i = 0; i < results.length; i++) {
      db.Article.create({ "headline": results[i].headline, "summary": results[i].summary, "link": results[i].link }, function (err, resp) {
        if (err) {
          console.log(err);
        }
        //console.log(resp);
      });
    }

  });
}

//ARTICLE API
app.get("/api/articles", function (req, res) {
  newArticles();

  db.Article.find({}, function (err, resp) {
    if (err) {
      console.log(err);
    }
    res.send(resp);
  });

});

app.get("/api/favorites", function (req, res) {
  db.Article.find({
    "_id" : {"$in" : req.session.passport.user.favorites}
  }).then(function(dbResult){
    //console.log("RESULTS: "+dbResult);
    res.send(dbResult);
  });

});

//CHECK IF ALREADY EXISTS IN FAVORITES
function favExists(user,favID){
  let x = user.favorites.length;
  for(let i=0;i<x;i++){
    if(user.favorites[i]===favID){
      //console.log("THIS IS HAPPENING BECAUSE IT ALREADY EXISTS");
      return true;
    }
  }
  return false;
}

//ADD NEW FAVORITE ARTICLE TO FAVORITES ARRAY
app.put("/api/favorites/:id",function(req,res){
  if(req.isAuthenticated()){
    let alreadyExists=favExists(req.session.passport.user,req.params.id);
    if(alreadyExists===true){
      res.send(true);
    }
    else{
      db.User.update(
        { _id: req.session.passport.user._id},
        { $push: { favorites: req.params.id } }
      ).then(function(err,result){
        res.status(200);
        res.send(false);
      });
    }
  }
  else{
    res.redirect("/login");
  }
});

//DELETE ARTICLE FROM FAVORITES ARRAY
app.delete("/api/favorites/:id",function(req,res){
  if(req.isAuthenticated()){
    db.User.updateOne(
      { _id: req.session.passport.user._id },
      { $pull: { 'favorites': req.params.id} }
    ).then(function(dbResult){
      console.log(dbResult);
      if(dbResult.nModified===1){
        res.status(200);
        res.send(true);
      }
      else{
        res.send(false);
      }
    });
  }
  else{

  }
});

//SIGNUP NEW USER
app.post("/signup", function (req, res, next) {
  passport.authenticate('local-signup', function (err, usr, info) {
    console.log("info", info);
    if (err) {
      console.log("Passport Error: " + err);
      return next(err);
    }
    if (!usr) {
      console.log("user error " + usr);
      return res.send({ success: false, message: 'Authentication Failed' });
    }

    req.login(usr, loginErr => {
      if (loginErr) {
        console.log("Login Error " + loginErr);
        return next(loginErr);
      }
      console.log('redirecting....');
      res.cookie('first_name', usr.firstName);
      res.cookie('user_id', usr._id);
      res.status(200);
      res.send("Go Ahead");
    });
  })(req, res, next);

});

//LOGIN RETURNING USER
app.post('/login', function (req, res, next) {
  passport.authenticate('local-login', function (err, usr, info) {
    console.log("\n\n\n########userrrr", usr)
    if (err) {
      console.log("passport err", err);
      return next(err); // will generate a 500 error
    }
    if (!usr) {

      return res.send({ success: false, message: 'Authentication Failed' });
    }
    req.login(usr, loginErr => {
      if (loginErr) {
        console.log("loginerr", loginErr);
        return next(loginErr);
      }

      console.log('redirecting....');
      res.cookie('first_name', usr.firstName);
      res.cookie('user_id', usr._id);

      res.status(200);
      res.send("Go Ahead");
    });
  })(req, res, next);

});

//404 PAGE
app.get("*", function (req, res) {
  res.render("404");
});

//END OF ROUTES

// Starting the server, syncing our models ------------------------------------/
app.listen(PORT, function () {
  console.log(
    "==> 🌎  Listening on port %s. Visit http://localhost:%s/ in your browser.",
    PORT,
    PORT
  );
});


module.exports = app;
