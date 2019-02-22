$(document).ready(function () {
    var noteID;
    function getFavorites() {
        $.ajax({
            method: "GET",
            url: "/api/favorites"
        }).then(function (result) {
            $("#favSpace").empty();
            if (result.length > 0) {
                for (let i = 0; i < result.length; i++) {
                    //console.log(result[i]);
                    let newCard = $("<div>").addClass("card");
                    let newHeader = $("<div>").addClass("card-header");
                    let newBody = $("<div>").addClass("card-body");

                    newHeader.append("<p><strong>" + result[i].headline + "</strong></p>");
                    newBody.append("<p>" + result[i].summary + "</p>");
                    newBody.append("<small>Original Link: <a href='" + result[i].link + "'>Go There Now!</a></small><br><br>");
                    newBody.append("<p>Notes about the Article: ");
                    newBody.append("<hr class='my-4'>");
                    if(result[i].notes.length>0){
                        for(let j=0;j<result[i].notes.length;j++){
                            newBody.append("<p>"+result[i].notes[j]+"</p>");
                        }
                    }
                    else{
                        newBody.append("<p>Be the first to add a note on this article!</p>");
                    }
                    newBody.append("<button class='btn btn-outline-danger removeFavBtn' data-artID='" + result[i]._id+"'>Remove From Favorites</button>");
                    newBody.append("<button class='btn btn-outline-success noteFavBtn' data-artID='"+result[i]._id+"'>Add A Note</button>");
                    newCard.append(newHeader);
                    newCard.append(newBody);
                    $("#favSpace").append(newCard);
                    $("#favSpace").append("<br>");
                }
            }
            else {
                $("#favSpace").append("<p>Looks like you haven't favorited any articles yet.</p>");
                //console.log("NO FAVORITES YET!");
            }
        });
    }

    getFavorites();

    $('body').on("click", '.removeFavBtn', function () {
        let articleID = $(this).attr("data-artID");
        $.ajax({
            method: "DELETE",
            url: "/api/favorites/" + articleID
        }).then(function (result) {
            location.reload();
        });
    });

    $('body').on("click",'.noteFavBtn',function(){
        noteID=$(this).attr("data-artID");

        $("#notesModal").modal('show');

    });

    $("#noteSubmitBtn").on('click',function(){
        let newNote={
            newComment: $("#noteInput").val().trim()
        };

        $.post("/api/notes/"+noteID,newNote).then(function(result){
            $("#noteInput").val("");
            location.reload();
        });
    });
});