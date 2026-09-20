const form = document.getElementById("loginForm");

form.addEventListener("submit", function(event) {

    event.preventDefault();

    let username = document.getElementById("username").value;
    let password = document.getElementById("password").value;
    let role = document.getElementById("role").value;

    let message = document.getElementById("loginMessage");

    if (username == "" || password == "" || role == "") {

        message.innerHTML = "Please fill all the fields.";
        message.style.color = "red";

    } else {

        message.innerHTML = "Login successful.";
        message.style.color = "green";

        setTimeout(function() {
            window.location.href = "pages/dashboard.html";
        }, 800);
    }
});