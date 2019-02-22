$(document).ready(function(){
    $("#findArt").on("click",function(){
        $.ajax({
            method: "GET",
            url: "/api/articles"
        }).then(function(result){
            $("#cardBody").empty();
            for(let i=0;i<result.length;i++){
                //console.log(result[i]);
                let newCard=$("<div>").addClass("card");
                let newHeader=$("<div>").addClass("card-header");
                let newBody=$("<div>").addClass("card-body");

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

    $('body').on("click",".favBtn",function(){
        let articleID=$(this).attr('data-artId');
        $.ajax({
            method: "PUT",
            url : "/api/favorites/"+articleID
        }).then(function(result){
            $("#confirmBody").empty();
            if(result===false){
                $("#confirmBody").append("<p>This article has been saved to your favorites!");
            }
            else{
                $("#confirmBody").append("<p>Unable to add to favorites. You might already have it saved.");
            }
            $("#confirmModal").modal('show');
        });
    });
});