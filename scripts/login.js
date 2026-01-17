const API_URL = "src/Class/api.php";

const loginForm = document.getElementById("loginForm");
const loginStatus = document.getElementById("loginStatus");

function setStatus(message, isError = false) {
  loginStatus.textContent = message;
  loginStatus.style.color = isError ? "#b42318" : "";
}

async function handleLogin(event) {
  event.preventDefault();
  setStatus("");

  const formData = new FormData(loginForm);
  formData.append("action", "login");

  const response = await fetch(API_URL, {
    method: "POST",
    body: formData,
    credentials: "same-origin"
  });

  const data = await response.json();
  if (!data.success) {
    setStatus(data.message || "Login non riuscito.", true);
    return;
  }

  window.location.href = "admin.html";
}

loginForm.addEventListener("submit", handleLogin);
