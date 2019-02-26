var db = require("../models");
var passport = require('passport');

module.exports = function (app) {
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
};