// Grab the articles as a json
$.getJSON("/articles", function(data) {
    // For each one
    for (var i = 0; i < data.length; i++) {
      // Display the apropos information on the page
      $("#articles").append(
        "<div class='col-4'><div class='card'><div class='card-body'><h5 class='card-title'>" + data[i].title + "</h5><p class='card-text'>" + data[i].link + "</p><a href='#' class='card-link'>Save</a><a href='#' class='card-link'>Comment</a></div></div></div>"
        );
    }
    
      console.log(data);
    });
    
    
    // When you click the Fetch button
    $(document).on("click", ".btn-fetch", function() {
      alert('Articles up-to-date!');
    
      $.ajax({
        method: "GET",
        url: "/scrape"
      })
        .done(function(data) {
          location.reload();
        });
    });
    
    
    
    // When you click the Note button
    $(document).on("click", ".btn-note", function() {
      
      $(".modal-title").empty();
      $(".input").empty();
    
      // Save the id from .btn-note
      var thisId = $(this).attr("data-id");
      console.log(thisId);
    
      $.ajax({
        method: "GET",
        url: "/articles/" + thisId
      })
        // With that done, add the note information to the page
        .done(function(data) {
          console.log(data);
    
          $(".modal-title").append("<h5>" + data.title + "</h5>");
          $(".input").append("<textarea id='bodyinput' name='body'></textarea>");
          $(".input").append("<button data-id='" + data._id + "' id='savenote' class='btn btn-primary btn-sm' style='margin-top:20px;'data-dismiss='modal'>Save Note</button>");
    
          // If there's a note in the article
          if (data.note) {
            // Place the body of the note in the body textarea
            $("#bodyinput").val(data.note.body);
          }
        });
    });
    
    
    
    // When you click the Save Note button
    $(document).on("click", "#savenote", function() {
      // Grab the id associated with the article from the submit button
      var thisId = $(this).attr("data-id");
      console.log(thisId);
    
      // Run a POST request to change the note, using what's entered in the inputs
      $.ajax({
        method: "POST",
        url: "/articles/" + thisId,
        data: {
          // Value taken from note textarea
          body: $("#bodyinput").val()
        }
      })
      
        .done(function(data) {
          // Log the response
          console.log(data);
          // Empty the notes section
          // $("#bodyinput").empty();
        });
    
      // Remove the values entered in the input and textarea for note entry
      $("#bodyinput").val("");
    });
    
    
    
    // When you click the Save Article button
    $(document).on("click", "#btn-save", function() {
      $(this).addClass("disabled");
      var thisId = $(this).attr("data-id");
      console.log(thisId);
    
      $.ajax({
        method: "PUT",
        url: "/saved/" + thisId,
       
      })
      
      .done(function(data) {
          console.log(data);
      });
    });
    
    
    
      );
    }
  });
  
  
  // Whenever someone clicks a p tag
  $(document).on("click", "p", function() {
    // Empty the notes from the note section
    $("#notes").empty();
    // Save the id from the p tag
    var thisId = $(this).attr("data-id");
  
    // Now make an ajax call for the Article
    $.ajax({
      method: "GET",
      url: "/articles/" + thisId
    })
      // With that done, add the note information to the page
      .then(function(data) {
        console.log(data);
        // The title of the article
        $("#notes").append("<h2>" + data.title + "</h2>");
        // An input to enter a new title
        $("#notes").append("<input id='titleinput' name='title' >");
        // A textarea to add a new note body
        $("#notes").append("<textarea id='bodyinput' name='body'></textarea>");
        // A button to submit a new note, with the id of the article saved to it
        $("#notes").append("<button data-id='" + data._id + "' id='savenote'>Save Note</button>");
  
        // If there's a note in the article
        if (data.note) {
          // Place the title of the note in the title input
          $("#titleinput").val(data.note.title);
          // Place the body of the note in the body textarea
          $("#bodyinput").val(data.note.body);
        }
      });
  });
  
  // When you click the savenote button
  $(document).on("click", "#savenote", function() {
    // Grab the id associated with the article from the submit button
    var thisId = $(this).attr("data-id");
  
    // Run a POST request to change the note, using what's entered in the inputs
    $.ajax({
      method: "POST",
      url: "/articles/" + thisId,
      data: {
        // Value taken from title input
        title: $("#titleinput").val(),
        // Value taken from note textarea
        body: $("#bodyinput").val()
      }
    })
      // With that done
      .then(function(data) {
        // Log the response
        console.log(data);
        // Empty the notes section
        $("#notes").empty();
      });
  
    // Also, remove the values entered in the input and textarea for note entry
    $("#titleinput").val("");
    $("#bodyinput").val("");
  });