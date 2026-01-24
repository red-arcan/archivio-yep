const API_URL = "src/Class/api.php";

const loginForm = document.getElementById("loginForm");
const loginStatus = document.getElementById("loginStatus");

function isFilled(value) {
  return Boolean(value && value.trim());
}

function isFieldValid(field) {
  if (!field.required || field.disabled) {
    return true;
  }
  return isFilled(field.value || "");
}

function updateFieldError(field) {
  const wrapper = field.closest(".form-field");
  if (!wrapper) {
    return;
  }
  if (isFieldValid(field)) {
    wrapper.classList.remove("field-error");
  } else {
    wrapper.classList.add("field-error");
  }
}

function markRequiredErrors(form) {
  let hasError = false;
  form.querySelectorAll("input, select, textarea").forEach((field) => {
    if (!isFieldValid(field)) {
      updateFieldError(field);
      hasError = true;
    } else {
      updateFieldError(field);
    }
  });
  return hasError;
}

function setStatus(message, isError = false) {
  loginStatus.textContent = message;
  loginStatus.style.color = isError ? "#b42318" : "";
}

async function handleLogin(event) {
  event.preventDefault();
  setStatus("");
  if (markRequiredErrors(loginForm)) {
    setStatus("Compila tutti i campi obbligatori.", true);
    return;
  }

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
loginForm.querySelectorAll("input, select, textarea").forEach((field) => {
  field.addEventListener("input", () => updateFieldError(field));
  field.addEventListener("change", () => updateFieldError(field));
});
