// When you click the Fetch button
$(document).on("click", ".btn-fetch", function () {
  alert('Articles up-to-date!');

  $.ajax({
    method: "GET",
    url: "/scrape"
  })
    .done(function (data) {
      setTimeout(function () {
        location.reload();
      }, 3000);
    });
});

// Grab the articles as a json
$.getJSON("/articles", function (data) {
  // For each one
  for (var i = 0; i < data.length; i++) {
    // Display the apropos information on the page
    // $(".card-title").append("<p data-id='" + data[i]._id + "'>" + data[i].title + "<br />" + data[i].link + "</p>");

    $(".articles").append(`
    <div class="col-4">
      <div class="card">
        <div class="card-body">
          <h5 class='card-title'>${data[i].title}<br></h5>
          <p class="card-text">${data[i].summary}</p>
          <hr>
          <a href="https://www.si.com${data[i].link}" target="_blank" class="card-link save">View Article</a>
          <a href="#" class="card-link comment" data-id="${data[i]._id}" data-toggle='modal' data-target='#myModal'>Comment</a>
        </div>
      </div>
    </div>
    `);
  }
});

$(document).on("click", ".comment", function() {
  
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
      $(".input").append("<textarea id='bodyinput' name='body'></textarea><br>");
      $(".input").append("<button data-id='" + data._id + "' class='btn btn-secondary btn-sm' style='margin-top:20px;'data-dismiss='modal'>Close</button>");
      $(".input").append("<button data-id='" + data._id + "' id='savenote' class='btn btn-primary btn-sm' style='margin-top:20px;'data-dismiss='modal'>Save Comment</button>");

      // If there's a note in the article
      if (data.note) {
        // Place the body of the note in the body textarea
        $(".modal-body").val(data.note.body);

        console.log(data.note);
      }
    });
});

// When you click the Save Note button
$(document).on("click", "#savenote", function() {
  // Grab the id associated with the article from the submit button
  var thisId = $(this).attr("data-id");

  // Run a POST request to change the note, using what's entered in the inputs
  $.ajax({
    method: "POST",
    url: "/articles/" + thisId,
    data: {
      // Value taken from note textarea
      body: $('#bodyinput').val()
    }
  })
  
    .done(function(data) {
      // Log the response
      console.log("This is the data", data);
    
      var $div = $('<div class="comments">');
      var $span = $('<span data-id="' + data._id + 'id="note-id">' + data.body + '<button id="delete">x</button></span>');
      // $span.append('#bodyinput');
      $div.append($span);
      $('.modal-body').prepend($div);

    });

  // Remove the values entered in the input and textarea for note entry
  $("#bodyinput").val("");
});