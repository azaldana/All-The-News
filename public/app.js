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

// When you click the Note button
$(document).on("click", ".comment", function () {

  $(".modal-title").empty();
  $(".input").empty();
  $(".commentSection").empty();

  // Save the id from .btn-note
  var thisId = $(this).attr("data-id");
  console.log(thisId);

  $.ajax({
    method: "GET",
    url: "/articles/" + thisId
  })
    // With that done, add the note information to the page
    .done(function (data) {
      console.log(data);

      $(".modal-title").append("<h5>" + data.title + "</h5>");
    
      if (data.note) {
        $(".commentSection").append("<b>Previous Comments:</b><br><span id='note-span'>" + data.note.body + "<button data-id='" + data.note._id + "' id='deletenote' class='btn btn-outline-dark btn-sm' data-dismiss='modal'>X</button>" + "<br><hr></span>");
      }
      $(".input").append("<textarea id='bodyinput' name='body'></textarea>");
      $(".input").append("<button data-id='" + data._id + "' class='btn btn-secondary btn-sm' style='margin-top:20px;'data-dismiss='modal'>Close</button>");
      $(".input").append("<button data-id='" + data._id + "' id='savenote' class='btn btn-primary btn-sm' style='margin-top:20px;'data-dismiss='modal'>Save Comment</button><br><hr>");

    });
});

// When you click the Save Note button
$(document).on("click", "#savenote", function () {
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

    .done(function (data) {
      // Log the response
      console.log(data);
      // Empty the notes section
      // $("#bodyinput").empty();
    });

  // Remove the values entered in the input and textarea for note entry
  $("#bodyinput").val("");
});

// When you click the Delete Note button
$(document).on("click", "#deletenote", function () {
  // Grab the id associated with the article from the submit button
  var thisId = $(this).attr("data-id");
  console.log(thisId);

  // Run a POST request to change the note, using what's entered in the inputs
  $.ajax({
    method: "POST",
    url: "/delete/" + thisId,
    data: {
      // Value taken from note textarea
      body: $("#bodyinput").val()
    }
  })

    .done(function (data) {
      // Log the response
      console.log(data);
      // Empty the notes section
      // $("#bodyinput").empty();
    });

  // Remove the values entered in the input and textarea for note entry
  $("#bodyinput").val("");
});