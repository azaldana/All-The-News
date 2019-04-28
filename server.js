var express = require("express");
var logger = require("morgan");
var mongoose = require("mongoose");
var moment = require("moment");

// Our scraping tools
// Axios is a promised-based http library, similar to jQuery's Ajax method
// It works on the client and on the server
var axios = require("axios");
var cheerio = require("cheerio");

// Require all models
var db = require("./models/Index");
console.log(db);

var PORT = process.env.PORT || 3000;

// Initialize Express
var app = express();

// Configure middleware

// Use morgan logger for logging requests
app.use(logger("dev"));
// Parse request body as JSON
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
// Make public a static folder
app.use(express.static("public"));

// Connect to the Mongo DB
// mongoose.connect("mongodb://localhost/newsScraper", { useNewUrlParser: true });

// If deployed, use the deployed database. Otherwise use the local mongoHeadlines database
var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/mongoHeadlines";

mongoose.connect(MONGODB_URI);


// Routes

// A GET route for scraping the echoJS website
app.get("/scrape", function(req, res) {

    db.Article.deleteMany({}, function(err) {
      console.log("Remove Error", err);
    });
  // First, we grab the body of the html with axios
  axios.get("https://www.si.com/").then(function(response) {
    // Then, we load that into cheerio and save it to $ for a shorthand selector
    var $ = cheerio.load(response.data);

    // Now, we grab every h2 within an article tag, and do the following:
    $('.type-article').each(function(i, element) {
        // Save the text and href of each link enclosed in the current element
        const title = $(element).find('.media-heading').children('a').text();
        const link = $(element).find('.media-heading').children('a').attr("href");
        const articleCreated = moment().format("YYYY MM DD hh:mm:ss");
        const image = $(element).find('.inner-container').children('img').attr('src');
        const summary = $(element).find('.summary').text().trim();
  
        const result = {
          image: image,
          title: title,
          link: link,
          summary: summary,
          articleCreated: articleCreated
        }

        db.Article.findOne({
          title: title
        }).then(function(data){
          console.log(data);

          if (data === null)  {
            db.Article.create(result).then(function(dbArticle){
              console.log(dbArticle);
            })
          }
        }).catch(function(err){
          //res.json(err);
        })
    })
})
    res.send('Scrape Complete');
})

app.get("/articles", function(req, res) {
  // Grab every document in the Articles collection
  db.Article.find({}).sort({
    articleCreated:-1
  }).then(function(dbArticle) {
      // If we were able to successfully find Articles, send them back to the client
      res.json(dbArticle);
    })
    .catch(function(err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});

// // Route for grabbing a specific Article by id, populate it with it's note
app.get("/articles/:id", function(req, res) {
  // Using the id passed in the id parameter, prepare a query that finds the matching one in our db...
  db.Article.findOne({ _id: req.params.id })
    // ..and populate all of the notes associated with it
    .populate("note")
    .then(function(dbArticle) {
      // If we were able to successfully find an Article with the given id, send it back to the client
      res.json(dbArticle);
    })
    .catch(function(err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});

// Route for saving a new Note to the db and associating it with a User
app.post("/submit", function(req, res) {
  // Create a new Note in the db
  db.Note.create(req.body)
    .then(function(dbNote) {
      // If a Note was created successfully, find one User (there's only one) and push the new Note's _id to the User's `notes` array
      // { new: true } tells the query that we want it to return the updated User -- it returns the original by default
      // Since our mongoose query returns a promise, we can chain another `.then` which receives the result of the query
      return db.Article.findOneAndUpdate({}, { $push: { notes: dbNote._id } }, { new: true });
    })
    .then(function(dbArticle) {
      // If the Article was updated successfully, send it back to the client
      res.json(dbArticle);
    })
    .catch(function(err) {
      // If an error occurs, send it back to the client
      res.json(err);
    });
});



// Start the server
app.listen(PORT, function() {
  console.log("App running on port " + PORT + "!");
});