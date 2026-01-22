const API_URL = "src/Class/api.php";

const adminStatus = document.getElementById("adminStatus");
const logoutButton = document.getElementById("logoutButton");
const uploadForm = document.getElementById("uploadForm");
const deleteForm = document.getElementById("deleteForm");

const uploadLevel = document.getElementById("uploadLevel");
const uploadSubject = document.getElementById("uploadSubject");
const uploadYear = document.getElementById("uploadYear");
const uploadYearField = document.getElementById("uploadYearField");
const uploadCategoryField = document.getElementById("uploadCategoryField");
const uploadCategory = document.getElementById("uploadCategory");
const deleteLevel = document.getElementById("deleteLevel");
const deleteSubject = document.getElementById("deleteSubject");
const deleteYear = document.getElementById("deleteYear");
const deleteYearField = document.getElementById("deleteYearField");
const deleteCategoryField = document.getElementById("deleteCategoryField");
const deleteCategory = document.getElementById("deleteCategory");
const deleteDocument = document.getElementById("deleteDocument");

let levelsData = null;

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

async function loadLevels() {
  const response = await fetch(`${API_URL}?action=subjects`, {
    cache: "no-store",
    credentials: "same-origin"
  });
  const data = await response.json();
  if (!data.success) {
    setStatus("Impossibile caricare le materie.", true);
    return;
  }
  levelsData = data.levels || {};
}

function populateLevelOptions(select) {
  select.innerHTML = `
    <option value="hs">Scuole Superiori</option>
    <option value="uni">Universita</option>
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
  const subjects = levelsData?.[level]?.subjects || [];
  if (subjects.length === 0) {
    select.innerHTML = '<option value="">Nessuna materia</option>';
    return;
  }
  select.innerHTML = subjects
    .map((subject) => `<option value="${subject.id}">${subject.name}</option>`)
    .join("");
}

function handleLevelChange(levelSelect, subjectSelect, yearSelect, yearField, categoryField, categorySelect) {
  const level = levelSelect.value;
  populateSubjectOptions(level, subjectSelect);
  if (level === "hs") {
    yearSelect.disabled = false;
    yearSelect.required = true;
    if (yearField) {
      yearField.style.display = "";
    }
    if (categoryField) {
      categoryField.style.display = "none";
      if (categorySelect) categorySelect.value = "";
    }
  } else {
    yearSelect.value = "";
    yearSelect.disabled = true;
    yearSelect.required = false;
    if (yearField) {
      yearField.style.display = "none";
    }
    if (categoryField) {
      categoryField.style.display = "block";
      if (categorySelect) categorySelect.required = true;
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
  handleLevelChange(uploadLevel, uploadSubject, uploadYear, uploadYearField, uploadCategoryField, uploadCategory);
}

async function loadDocuments(level, subjectId, year, category, documentSelect) {
  if (!level || !subjectId) {
    documentSelect.innerHTML = '<option value="">Seleziona un documento...</option>';
    return;
  }

  if (level === "hs" && !year) {
    documentSelect.innerHTML = '<option value="">Seleziona un documento...</option>';
    return;
  }

  if (level === "uni" && !category) {
    documentSelect.innerHTML = '<option value="">Seleziona un documento...</option>';
    return;
  }

  try {
    const response = await fetch(`${API_URL}?action=documents&level=${level}&subject=${subjectId}`, {
      cache: "no-store",
      credentials: "same-origin"
    });
    const data = await response.json();

    if (!data.success || !data.documents) {
      documentSelect.innerHTML = '<option value="">Nessun documento trovato</option>';
      return;
    }

    let filteredDocs = data.documents;
    if (level === "hs") {
      filteredDocs = filteredDocs.filter(doc => doc.yearId === year);
    } else {
      filteredDocs = filteredDocs.filter(doc => doc.yearId === category);
    }

    if (filteredDocs.length === 0) {
      documentSelect.innerHTML = '<option value="">Nessun documento trovato</option>';
      return;
    }

    documentSelect.innerHTML = '<option value="">Seleziona un documento...</option>' +
      filteredDocs.map(doc => 
        `<option value="${doc.id}" data-title="${(doc.title || '').replace(/"/g, '&quot;')}" data-tags="${(doc.tags || []).join(';')}" data-description="${(doc.description || '').replace(/"/g, '&quot;')}">${doc.title || doc.id}</option>`
      ).join("");
  } catch (error) {
    setStatus("Errore nel caricamento dei documenti.", true);
    documentSelect.innerHTML = '<option value="">Errore nel caricamento</option>';
  }
}

async function loadDocumentsForDelete() {
  await loadDocuments(deleteLevel.value, deleteSubject.value, deleteYear.value, deleteCategory.value, deleteDocument);
}

async function handleDelete(event) {
  event.preventDefault();
  setStatus("");

  const level = deleteLevel.value;
  const subjectId = deleteSubject.value;
  const docId = deleteDocument.value;

  if (!level || !subjectId || !docId) {
    setStatus("Seleziona un documento da eliminare.", true);
    return;
  }

  if (!confirm("Sei sicuro di voler eliminare questo documento?")) {
    return;
  }

  const formData = new FormData();
  formData.append("action", "remove");
  formData.append("level", level);
  formData.append("subjectId", subjectId);
  formData.append("docId", docId);

  const response = await fetch(API_URL, {
    method: "POST",
    body: formData,
    credentials: "same-origin"
  });
  const data = await response.json();

  if (!data.success) {
    setStatus(data.message || "Errore durante l'eliminazione.", true);
    return;
  }

  setStatus("Documento eliminato con successo.");
  deleteForm.reset();
  handleLevelChange(deleteLevel, deleteSubject, deleteYear, deleteYearField, deleteCategoryField, deleteCategory);
  deleteDocument.innerHTML = '<option value="">Seleziona un documento...</option>';
  await loadDocumentsForDelete();
}

async function initAdmin() {
  await requireLogin();
  await loadLevels();
  populateLevelOptions(uploadLevel);
  populateLevelOptions(deleteLevel);
  populateYearOptions(uploadYear);
  populateYearOptions(deleteYear);
  handleLevelChange(uploadLevel, uploadSubject, uploadYear, uploadYearField, uploadCategoryField, uploadCategory);
  handleLevelChange(deleteLevel, deleteSubject, deleteYear, deleteYearField, deleteCategoryField, deleteCategory);
}

initAdmin();

logoutButton.addEventListener("click", handleLogout);
uploadForm.addEventListener("submit", handleUpload);
deleteForm.addEventListener("submit", handleDelete);
uploadLevel.addEventListener("change", () =>
  handleLevelChange(uploadLevel, uploadSubject, uploadYear, uploadYearField, uploadCategoryField, uploadCategory)
);
deleteLevel.addEventListener("change", () => {
  handleLevelChange(deleteLevel, deleteSubject, deleteYear, deleteYearField, deleteCategoryField, deleteCategory);
  loadDocumentsForDelete();
});
deleteSubject.addEventListener("change", () => {
  loadDocumentsForDelete();
});
deleteYear.addEventListener("change", () => {
  loadDocumentsForDelete();
});
deleteCategory.addEventListener("change", () => {
  loadDocumentsForDelete();
});
