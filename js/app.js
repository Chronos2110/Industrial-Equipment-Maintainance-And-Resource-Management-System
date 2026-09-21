// ==========================================================================
// IEMRS - Login JavaScript (js/app.js)
// Simple, direct validation suitable for college lab viva explanation
// ==========================================================================

const loginForm = document.getElementById("loginForm");

loginForm.addEventListener("submit", function (event) {
    event.preventDefault();

    let username = document.getElementById("username").value.trim();
    let password = document.getElementById("password").value.trim();
    let role = document.getElementById("role").value;
    let message = document.getElementById("loginMessage");

    // Validation
    if (username === "" || password === "" || role === "") {
        message.innerHTML = "Please enter username, password, and select a role.";
        message.style.color = "#dc2626";
        return;
    }

    // Successful login simulation
    message.innerHTML = "Authorization confirmed. Redirecting to control center...";
    message.style.color = "#16a34a";

    // Save selected role in sessionStorage for dashboard and topbars
    sessionStorage.setItem("iemrs_role", role);

    // Redirect to dashboard
    setTimeout(function () {
        window.location.href = "pages/dashboard.html";
    }, 600);
});