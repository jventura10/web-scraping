$(document).ready(function(){
    $("#findArt").on("click",function(){
        $.ajax({
            method: "GET",
            url: "/api/articles"
        }).then(function(result){
            $("#cardBody").empty();
            for(var i=0;i<result.length;i++){
                //console.log(result[i]);
                var newCard=$("<div>").addClass("card");
                var newHeader=$("<div>").addClass("card-header");
                var newBody=$("<div>").addClass("card-body");

                newHeader.append("<p><strong>"+result[i].headline+"</strong></p>");
                newBody.append("<p>"+result[i].summary+"</p>");
                newBody.append("<small>Original Link: <a href='"+result[i].link+"'>Go There Now!</a></small><br><br>");
                newBody.append("<button class='btn btn-outline-success favBtn' data-artId='"+result[i]._id+"'>Add to Favorites</button>");
                newCard.append(newHeader);
                newCard.append(newBody);
                $("#cardBody").append(newCard);
                $("#cardBody").append("<br>");
            }
        });
    });
});