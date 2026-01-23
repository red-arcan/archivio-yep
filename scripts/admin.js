const API_URL = "src/Class/api.php";

const adminStatus = document.getElementById("adminStatus");
const logoutButton = document.getElementById("logoutButton");
const uploadForm = document.getElementById("uploadForm");
const deleteForm = document.getElementById("deleteForm");
const deleteByIdForm = document.getElementById("deleteByIdForm");

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
const deleteDocId = document.getElementById("deleteDocId");
const uploadTitle = uploadForm.querySelector('input[name="title"]');
const uploadFile = uploadForm.querySelector('input[name="file"]');
const uploadSubmit = uploadForm.querySelector('button[type="submit"]');
const deleteSubmit = deleteForm.querySelector('button[type="submit"]');
const deleteByIdSubmit = deleteByIdForm.querySelector('button[type="submit"]');

let levelsData = null;

function isFilled(value) {
  return Boolean(value && value.trim());
}

function updateUploadSubmitState() {
  const level = uploadLevel.value;
  const subject = uploadSubject.value;
  const titleOk = isFilled(uploadTitle.value);
  const fileOk = uploadFile.files && uploadFile.files.length > 0;
  let locationOk = isFilled(level) && isFilled(subject);

  if (level === "hs") {
    locationOk = locationOk && isFilled(uploadYear.value);
  } else if (level === "uni") {
    locationOk = locationOk && isFilled(uploadCategory.value);
  }

  uploadSubmit.disabled = !(titleOk && fileOk && locationOk);
}

function updateDeleteSubmitState() {
  deleteSubmit.disabled = !isFilled(deleteDocument.value);
}

function updateDeleteByIdSubmitState() {
  deleteByIdSubmit.disabled = !isFilled(deleteDocId.value);
}

function setStatus(message, isError = false) {
  adminStatus.textContent = message;
  if (isError) {
    adminStatus.style.color = "#b42318";
    adminStatus.style.backgroundColor = "#fee4e2";
    adminStatus.style.border = "1px solid #b42318";
    adminStatus.style.padding = "var(--space-3) var(--space-4)";
    adminStatus.style.borderRadius = "0";
  } else if (message) {
    adminStatus.style.color = "#00a887";
    adminStatus.style.backgroundColor = "#e0f7f4";
    adminStatus.style.border = "1px solid #00a887";
    adminStatus.style.padding = "var(--space-3) var(--space-4)";
    adminStatus.style.borderRadius = "0";
  } else {
    adminStatus.style.color = "";
    adminStatus.style.backgroundColor = "";
    adminStatus.style.border = "";
    adminStatus.style.padding = "";
  }

  if (message) {
    if (!adminStatus.hasAttribute("tabindex")) {
      adminStatus.setAttribute("tabindex", "-1");
    }
    adminStatus.scrollIntoView({ behavior: "smooth", block: "start" });
    adminStatus.focus({ preventScroll: true });
  }
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

  updateUploadSubmitState();
  updateDeleteSubmitState();
  updateDeleteByIdSubmitState();
}

async function handleUpload(event) {
  event.preventDefault();
  setStatus("");

  const submitButton = uploadForm.querySelector('button[type="submit"]');
  const originalButtonText = submitButton.textContent;
  const formData = new FormData(uploadForm);

  // Disabilita il bottone e mostra loading
  submitButton.disabled = true;
  submitButton.innerHTML = '<span class="spinner"></span> Caricamento...';

  try {
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

    setStatus("Upload completato con successo!");
    uploadForm.reset();
    handleLevelChange(uploadLevel, uploadSubject, uploadYear, uploadYearField, uploadCategoryField, uploadCategory);
    updateUploadSubmitState();
  } catch (error) {
    setStatus("Errore di connessione durante l'upload.", true);
  } finally {
    // Riabilita il bottone
    submitButton.textContent = originalButtonText;
    updateUploadSubmitState();
  }
}

async function loadDocuments(level, subjectId, year, category, documentSelect) {
  if (!level || !subjectId) {
    documentSelect.innerHTML = '<option value="">Seleziona un documento...</option>';
    updateDeleteSubmitState();
    return;
  }

  if (level === "hs" && !year) {
    documentSelect.innerHTML = '<option value="">Seleziona un documento...</option>';
    updateDeleteSubmitState();
    return;
  }

  if (level === "uni" && !category) {
    documentSelect.innerHTML = '<option value="">Seleziona un documento...</option>';
    updateDeleteSubmitState();
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
      updateDeleteSubmitState();
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
      updateDeleteSubmitState();
      return;
    }

    documentSelect.innerHTML = '<option value="">Seleziona un documento...</option>' +
      filteredDocs.map(doc => 
        `<option value="${doc.id}" data-title="${(doc.title || '').replace(/"/g, '&quot;')}" data-tags="${(doc.tags || []).join(',')}" data-description="${(doc.description || '').replace(/"/g, '&quot;')}">${doc.title || doc.id}</option>`
      ).join("");
    updateDeleteSubmitState();
  } catch (error) {
    setStatus("Errore nel caricamento dei documenti.", true);
    documentSelect.innerHTML = '<option value="">Errore nel caricamento</option>';
    updateDeleteSubmitState();
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

  const submitButton = deleteForm.querySelector('button[type="submit"]');
  const originalButtonText = submitButton.textContent;

  // Disabilita il bottone e mostra loading
  submitButton.disabled = true;
  submitButton.innerHTML = '<span class="spinner"></span> Eliminazione...';

  const formData = new FormData();
  formData.append("action", "remove");
  formData.append("level", level);
  formData.append("subjectId", subjectId);
  formData.append("docId", docId);

  try {
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

    setStatus("Documento eliminato con successo!");
    deleteForm.reset();
    handleLevelChange(deleteLevel, deleteSubject, deleteYear, deleteYearField, deleteCategoryField, deleteCategory);
    deleteDocument.innerHTML = '<option value="">Seleziona un documento...</option>';
    await loadDocumentsForDelete();
    updateDeleteSubmitState();
  } catch (error) {
    setStatus("Errore di connessione durante l'eliminazione.", true);
  } finally {
    // Riabilita il bottone
    submitButton.textContent = originalButtonText;
    updateDeleteSubmitState();
  }
}

async function handleDeleteById(event) {
  event.preventDefault();
  setStatus("");

  const docId = deleteDocId.value.trim();
  if (!docId) {
    setStatus("Inserisci un ID documento valido.", true);
    return;
  }

  if (!confirm("Sei sicuro di voler eliminare questo documento?")) {
    return;
  }

  const submitButton = deleteByIdForm.querySelector('button[type="submit"]');
  const originalButtonText = submitButton.textContent;

  submitButton.disabled = true;
  submitButton.innerHTML = '<span class="spinner"></span> Eliminazione...';

  const formData = new FormData();
  formData.append("action", "removeById");
  formData.append("docId", docId);

  try {
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

    setStatus("Documento eliminato con successo!");
    deleteByIdForm.reset();
    updateDeleteByIdSubmitState();
    await loadDocumentsForDelete();
  } catch (error) {
    setStatus("Errore di connessione durante l'eliminazione.", true);
  } finally {
    submitButton.disabled = false;
    submitButton.textContent = originalButtonText;
    updateDeleteByIdSubmitState();
  }
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
  updateUploadSubmitState();
  updateDeleteSubmitState();
  updateDeleteByIdSubmitState();
}

initAdmin();

logoutButton.addEventListener("click", handleLogout);
uploadForm.addEventListener("submit", handleUpload);
deleteForm.addEventListener("submit", handleDelete);
deleteByIdForm.addEventListener("submit", handleDeleteById);
uploadLevel.addEventListener("change", () =>
  handleLevelChange(uploadLevel, uploadSubject, uploadYear, uploadYearField, uploadCategoryField, uploadCategory)
);
uploadSubject.addEventListener("change", updateUploadSubmitState);
uploadYear.addEventListener("change", updateUploadSubmitState);
uploadCategory.addEventListener("change", updateUploadSubmitState);
uploadTitle.addEventListener("input", updateUploadSubmitState);
uploadFile.addEventListener("change", updateUploadSubmitState);
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
deleteDocument.addEventListener("change", updateDeleteSubmitState);
deleteDocId.addEventListener("input", updateDeleteByIdSubmitState);
