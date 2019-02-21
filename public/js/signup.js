$(document).ready(function () {
    $("#submitBtn").on("click", function (event) {
        event.preventDefault();

        var newUsr = {
            "firstName": $("#fNameInput").val().trim(),
            "lastName": $("#lNameInput").val().trim(),
            "username": $("#usernameInput").val().trim(),
            "email": $("#emailInput").val().trim(),
            "password": $("#passwordInput").val().trim()
        };

        $.post("/signup", newUsr, function (data, status, xhr) {
            //console.log(data);
            //console.log(status);
            console.log(xhr);

            switch (xhr.status) {
                case 200: {
                    window.location.href = "/";
                    break;
                }
                case 401: {
                    window.location.href = "/signup";
                    break;
                }
                case 404: {
                    window.location.href = "*";
                    break;
                }
                case 500: {
                    alert("Refresh Page!");
                    break;
                }
            }

        });

    });
});