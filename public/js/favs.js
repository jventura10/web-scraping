$(document).ready(function () {
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
                    newBody.append("<button class='btn btn-outline-danger removeFavBtn' data-artID='" + result[i]._id + "'>Remove From Favorites</button>");
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
            $("#deleteBody").empty();
            if (result === true) {
                $("#deleteBody").append("<p>This article has been deleted from to your favorites!");
            }
            else {
                $("#deleteBody").append("<p>Unable to delete from favorites.Try again later.");
            }
            $("#deleteModal").modal('show');

        });
    });
});