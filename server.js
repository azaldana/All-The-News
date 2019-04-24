// // Dependencies
// var express = require("express");
// // var mongojs = require("mongojs");
// // Require axios and cheerio. This makes the scraping possible
// var axios = require("axios");
// var cheerio = require("cheerio");
// var logger = require("morgan");
// var mongoose = require('mongoose');
// var db = require('./models');

// // Initialize Express
// var app = express();

// // Use morgan logger for logging requests
// app.use(logger("dev"));
// // Parse request body as JSON
// app.use(express.urlencoded({ extended: true }));
// app.use(express.json());
// // Make public a static folder
// app.use(express.static("public"));

// // Connect to the Mongo DB
// mongoose.connect("mongodb://localhost/newsScraper", { useNewUrlParser: true });

// // Main route (simple Hello World Message)
// app.get("/", function(req, res) {
//   res.send(index.html);
// });

// // Retrieve data from the db
// app.get("/all", function(req, res) {
//   // Find all results from the scrapedData collection in the db
//   db.Article.find({}, function(error, found) {
//     // Throw any errors to the console
//     if (error) {
//       console.log(error);
//     }
//     // If there are no errors, send the data to the browser as json
//     else {
//       res.json(found);
//     }
//   });
// });

// // Scrape data from one site and place it into the mongodb db
// app.get("/scrape", function(req, res) {
//     var results = [];
//   // Make a request via axios for the news section of `ycombinator`
//   axios.get("https://www.complex.com/sports/").then(function(response) {
//     // Load the html body from axios into cheerio
//     var $ = cheerio.load(response.data);
//     // For each element with a "title" class
//     $(".feed-article").each(function(i, element) {
//       // Save the text and href of each link enclosed in the current element
//       // var title = $(element).text();
//       // var link = $(element).parent().attr("href");
//       // var image =  $(element).siblings('img').attr('src');

//       const title = $(element).find('.feed-article__title').text();
//       const link = $(element).find('.feed-article__info').attr('href');
//       const image = $(element).find('.grid-article__img').attr('src');

//       results.push({
//           title: title,
//           link: link,
//           image: image
//       })

//       console.log(results);

//       db.Article.findOne({
//         title: title
//       }).then(function(data){

//         if(data ===  null){
//           db.Article.create(results).then(function(dbArticle){
//             res.json(dbArticle);
//           })
//         }
//       }).catch(function(err){
//         res.json(err);
//       })

//       // db.Article.create({
//       //   title: title,
//       //   link: link,
//       //   // image: image

//       // })
//     });
//   });

//   // Send a "Scrape Complete" message to the browser
//   res.send("Scrape Complete");
// });

// app.get('/articles', function(req, res){

//   db.Article.find({}).sort({
//     artticleCreated:-1
//   }).then(function(dbArticle){
//     res.json(dbArticle)
//   })
//   .catch(function(err){
//     res.json(err);
//   })
// })

// app.get('articles/:id', function(req, res){

//   db.Article.findOne({_id: req.params.id}).populate('note')
//   .then(function(dbArticle){
//     res.json(dbArticle);
//   })
//   .catch(function(err){
//     res.json(err);
//   })
// })

// app.post('/articles/:id', function(req, res){

//   db.Note.create(req.body)
//   .then(function(dbNote){
//     return db.Article.findOneAndUpdate({
//       _id: req.params.id
//     }, {
//       note: dbNote._id
//     },  {
//       new: true
//     });
//   })
//   .then(function(dbArticle){
//     res.json(dbArticle)
//   })
//   .catch(function(err){
//     res.json(err);
//   })
// })

// app.put('/saved/:id', function(req, res){

//   db.Article.findByIdAndUpdate({
//     _id: req.params.id
//   }, { $set: {isSaved: true}

//   }).then(function(dbArticle){
//     res.json(dbArticle);
//   })
//   .catch(function(err){
//     res.json(err);
//   })
// })

// app.get("/saved", function(req, res) {

//   db.Article
//     .find({ isSaved: true })
//     .then(function(dbArticle) {
//       res.json(dbArticle);
//     })
//     .catch(function(err) {
//       res.json(err);
//     });
// });

// // Route for deleting/updating saved article
// app.put("/delete/:id", function(req, res) {

//   db.Article
//     .findByIdAndUpdate({ _id: req.params.id }, { $set: { isSaved: false }})
//     .then(function(dbArticle) {
//       res.json(dbArticle);
//     })
//     .catch(function(err) {
//       res.json(err);
//     });
// });

// // Listen on port 3000
// app.listen(3000, function() {
//   console.log("App running on port 3000!");
// });

var express = require("express");
var logger = require("morgan");
var mongoose = require("mongoose");

// Our scraping tools
// Axios is a promised-based http library, similar to jQuery's Ajax method
// It works on the client and on the server
var axios = require("axios");
var cheerio = require("cheerio");

// Require all models
var db = require("./models");

var PORT = 3000;

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
mongoose.connect("mongodb://localhost/newsScraper", { useNewUrlParser: true });

// Routes

// A GET route for scraping the echoJS website
app.get("/scrape", function(req, res) {
    var results = [];
  // First, we grab the body of the html with axios
  axios.get("https://www.complex.com/sports/").then(function(response) {
    // Then, we load that into cheerio and save it to $ for a shorthand selector
    var $ = cheerio.load(response.data);

    // Now, we grab every h2 within an article tag, and do the following:
    $('.feed-article').each(function(i, element) {
        // Save the text and href of each link enclosed in the current element
        const title = $(element).find('.feed-article__title').text();
        const link = $(element).find('.feed-article__info').attr("href");
        // const image = $(element).find('.grid-article__img').attr('src');
  
        results.push({
            title: title,
            link: link,
            // image: image
        })
  
        console.log(results);
  
        db.Article.create({
          title: title,
          link: link,
          // image: image
  
        })
    })
})
    res.send('Scrape Complete');
})

app.get("/articles", function(req, res) {
  // Grab every document in the Articles collection
  db.Article.find({})
    .then(function(dbArticle) {
      // If we were able to successfully find Articles, send them back to the client
      res.json(dbArticle);
    })
    .catch(function(err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});

// // Route for grabbing a specific Article by id, populate it with it's note
// app.get("/articles/:id", function(req, res) {
//   // Using the id passed in the id parameter, prepare a query that finds the matching one in our db...
//   db.Article.findOne({ _id: req.params.id })
//     // ..and populate all of the notes associated with it
//     .populate("note")
//     .then(function(dbArticle) {
//       // If we were able to successfully find an Article with the given id, send it back to the client
//       res.json(dbArticle);
//     })
//     .catch(function(err) {
//       // If an error occurred, send it to the client
//       res.json(err);
//     });
// });

// // Route for saving/updating an Article's associated Note
// app.post("/articles/:id", function(req, res) {
//   // Create a new note and pass the req.body to the entry
//   db.Note.create(req.body)
//     .then(function(dbNote) {
//       // If a Note was created successfully, find one Article with an `_id` equal to `req.params.id`. Update the Article to be associated with the new Note
//       // { new: true } tells the query that we want it to return the updated User -- it returns the original by default
//       // Since our mongoose query returns a promise, we can chain another `.then` which receives the result of the query
//       return db.Article.findOneAndUpdate({ _id: req.params.id }, { note: dbNote._id }, { new: true });
//     })
//     .then(function(dbArticle) {
//       // If we were able to successfully update an Article, send it back to the client
//       res.json(dbArticle);
//     })
//     .catch(function(err) {
//       // If an error occurred, send it to the client
//       res.json(err);
//     });
// });

// Start the server
app.listen(PORT, function() {
  console.log("App running on port " + PORT + "!");
});