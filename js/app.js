// ==========================================================================
// FORGE - Login JavaScript (js/app.js)
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
        message.style.color = "#e74c3c";
        return;
    }

    // Successful login simulation
    message.innerHTML = "Login successful. Redirecting to dashboard...";
    message.style.color = "#27ae60";

    // Save selected role in sessionStorage for dashboard and topbars
    sessionStorage.setItem("iemrs_role", role);

    // Redirect to dashboard
    setTimeout(function () {
        window.location.href = "pages/dashboard.html";
    }, 500);
});