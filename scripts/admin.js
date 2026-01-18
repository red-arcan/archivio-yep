const API_URL = "src/Class/api.php";

const adminStatus = document.getElementById("adminStatus");
const logoutButton = document.getElementById("logoutButton");
const uploadForm = document.getElementById("uploadForm");
const deleteForm = document.getElementById("deleteForm");

const uploadLevel = document.getElementById("uploadLevel");
const uploadSubject = document.getElementById("uploadSubject");
const uploadYear = document.getElementById("uploadYear");
const uploadCategoryField = document.getElementById("uploadCategoryField");
const uploadCategory = document.getElementById("uploadCategory");
const deleteLevel = document.getElementById("deleteLevel");
const deleteSubject = document.getElementById("deleteSubject");
const deleteYear = document.getElementById("deleteYear");

const SUBJECTS = {
  hs: ["matematica", "fisica", "chimica", "italiano", "storia", "inglese", "informatica", "scienze", "letteratura"],
  uni: ["analisi1", "analisi2", "fisica1", "fisica2", "algebra-lineare", "chimica"]
};

function setStatus(message, isError = false) {
  adminStatus.textContent = message;
  adminStatus.style.color = isError ? "#b42318" : "";
}

async function requireLogin() {
  const response = await fetch(`${API_URL}?action=status`, { credentials: "same-origin" });
  const data = await response.json();
  if (!data.loggedIn) {
    window.location.href = "login.html";
  }
}

async function handleLogout() {
  const formData = new FormData();
  formData.append("action", "logout");

  await fetch(API_URL, {
    method: "POST",
    body: formData,
    credentials: "same-origin"
  });

  window.location.href = "login.html";
}

function populateLevelOptions(select) {
  select.innerHTML = `
    <option value="hs">Scuole Superiori</option>
    <option value="uni">Università</option>
  `;
}

function populateYearOptions(select) {
  const options = ['<option value="">-</option>'];
  for (let year = 1; year <= 5; year += 1) {
    options.push(`<option value="${year}">${year}</option>`);
  }
  select.innerHTML = options.join("");
}

function populateSubjectOptions(level, select) {
  const subjects = SUBJECTS[level] || [];
  select.innerHTML = subjects.map((subject) => `<option value="${subject}">${subject}</option>`).join("");
}

function handleLevelChange(levelSelect, subjectSelect, yearSelect, categoryField, categorySelect) {
  const level = levelSelect.value;
  populateSubjectOptions(level, subjectSelect);
  if (level === "hs") {
    yearSelect.disabled = false;
    yearSelect.required = true;
    if (categoryField) {
      categoryField.style.display = "none";
      if (categorySelect) categorySelect.value = "";
    }
  } else {
    yearSelect.value = "";
    yearSelect.disabled = true;
    yearSelect.required = false;
    if (categoryField) {
      categoryField.style.display = "block";
      if (categorySelect) categorySelect.required = false;
    }
  }
}

async function handleUpload(event) {
  event.preventDefault();
  setStatus("");

  const formData = new FormData(uploadForm);

  const response = await fetch("src/Class/upload_file.php", {
    method: "POST",
    body: formData,
    credentials: "same-origin"
  });
  const data = await response.json();

  if (!data.ok) {
    setStatus(data.error || "Errore durante l'upload.", true);
    return;
  }

  setStatus("Upload completato.");
  uploadForm.reset();
  handleLevelChange(uploadLevel, uploadSubject, uploadYear, uploadCategoryField, uploadCategory);
}

async function handleDelete(event) {
  event.preventDefault();
  setStatus("");

  const formData = new FormData(deleteForm);

  const response = await fetch("src/Class/delete_file.php", {
    method: "POST",
    body: formData,
    credentials: "same-origin"
  });
  const data = await response.json();

  if (!data.ok) {
    setStatus(data.error || "Errore durante l'eliminazione.", true);
    return;
  }

  setStatus("Documento eliminato.");
  deleteForm.reset();
  handleLevelChange(deleteLevel, deleteSubject, deleteYear);
}

requireLogin();
populateLevelOptions(uploadLevel);
populateLevelOptions(deleteLevel);
populateYearOptions(uploadYear);
populateYearOptions(deleteYear);
handleLevelChange(uploadLevel, uploadSubject, uploadYear, uploadCategoryField, uploadCategory);
handleLevelChange(deleteLevel, deleteSubject, deleteYear, null, null);

logoutButton.addEventListener("click", handleLogout);
uploadForm.addEventListener("submit", handleUpload);
deleteForm.addEventListener("submit", handleDelete);
uploadLevel.addEventListener("change", () =>
  handleLevelChange(uploadLevel, uploadSubject, uploadYear, uploadCategoryField, uploadCategory)
);
deleteLevel.addEventListener("change", () =>
  handleLevelChange(deleteLevel, deleteSubject, deleteYear)
);
