var db = require("../models");
var passport = require("passport");
//Scraping tools
var axios = require("axios");
var cheerio = require("cheerio");


module.exports = function (app) {
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

    //GET ALL FAVORITES
    app.get("/api/favorites", function (req, res) {
        db.Article.find({
            "_id": { "$in": req.session.passport.user.favorites }
        }).then(function (dbResult) {
            //console.log("RESULTS: "+dbResult);
            res.send(dbResult);
        });

    });

    //CHECK IF ALREADY EXISTS IN FAVORITES
    function favExists(user, favID) {
        let x = user.favorites.length;
        for (let i = 0; i < x; i++) {
            if (user.favorites[i] === favID) {
                //console.log("THIS IS HAPPENING BECAUSE IT ALREADY EXISTS");
                return true;
            }
        }
        return false;
    }

    //ADD NEW FAVORITE ARTICLE TO FAVORITES ARRAY
    app.put("/api/favorites/:id", function (req, res) {
        if (req.isAuthenticated()) {
            let alreadyExists = favExists(req.session.passport.user, req.params.id);
            if (alreadyExists === true) {
                res.send(true);
            }
            else {
                req.session.passport.user.favorites.push(req.params.id);
                db.User.updateOne(
                    { _id: req.session.passport.user._id },
                    { $push: { favorites: req.params.id } }
                ).then(function (err, result) {
                    res.status(200);
                    res.send(false);
                });
            }
        }
        else {
            res.redirect("/login");
        }
    });

    //UPDATE A NEW NOTE 
    app.post("/api/notes/:id", function (req, res) {
        if (req.isAuthenticated()) {
            db.Article.updateOne(
                { _id: req.params.id },
                { $push: { notes: req.body.newComment } }
            ).then(function (dbResult) {
                if (dbResult.nModified === 1) {
                    res.status(200);
                }
            });
        }
        else {
            res.redirect("/");
        }
    });

    //DELETE ARTICLE FROM FAVORITES ARRAY
    app.delete("/api/favorites/:id", function (req, res) {
        if (req.isAuthenticated()) {
            let indexID = req.session.passport.user.favorites.indexOf(req.params.id);
            console.log("INDEX OF DELETED ARTICLE: " + indexID);
            if (indexID >= 0) {
                req.session.passport.user.favorites.splice(indexID, 1);
            }
            db.User.updateOne(
                { _id: req.session.passport.user._id },
                { $pull: { 'favorites': req.params.id } }
            ).then(function (dbResult) {
                console.log(dbResult);
                if (dbResult.nModified === 1) {
                    res.status(200);
                    res.send(true);
                }
                else {
                    res.send(false);
                }
            });
        }
        else {
            res.redirect("/login");
        }
    });
};