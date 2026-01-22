const API_URL = "src/Class/api.php";
const BASE_PATH = "/ArchivioYep";

const elements = {
  yearList: document.getElementById("yearList"),
  yearFilterCard: document.getElementById("yearFilterCard"),
  categoryFilterCard: document.getElementById("categoryFilterCard"),
  categoryList: document.getElementById("categoryList"),
  subjectTitle: document.getElementById("subjectTitle"),
  subjectSubtitle: document.getElementById("subjectSubtitle"),
  searchInput: document.getElementById("searchInput"),
  docList: document.getElementById("docList"),
  emptyState: document.getElementById("emptyState"),
  modal: document.getElementById("modal"),
  modalTitle: document.getElementById("modalTitle"),
  modalDescription: document.getElementById("modalDescription"),
  modalMeta: document.getElementById("modalMeta"),
  modalTags: document.getElementById("modalTags")
};

const state = {
  level: "hs",
  subject: null,
  years: [],
  categories: [],
  documents: [],
  yearId: "all",
  categoryId: "all",
  search: "",
  modalDoc: null
};

function normalize(value) {
  return value.toLowerCase();
}

function matchesQuery(text, query) {
  return normalize(text).includes(query);
}

function docMatches(doc, query) {
  if (!query) {
    return true;
  }
  return (
    matchesQuery(doc.title, query) ||
    matchesQuery(doc.type, query) ||
    doc.tags.some((tag) => matchesQuery(tag, query))
  );
}

function getQueryParams() {
  const params = new URLSearchParams(window.location.search);
  return {
    level: params.get("level") || "hs",
    subjectId: params.get("subject")
  };
}

async function fetchSubject(level, subjectId) {
  const response = await fetch(`${API_URL}?action=documents&level=${level}&subject=${subjectId}`, {
    cache: "no-store"
  });
  const text = await response.text();
  if (text.trim().startsWith("<")) {
    throw new Error("Risposta non JSON: verifica che PHP sia attivo e stai usando http://localhost/...");
  }
  const data = JSON.parse(text);
  if (!data.success) {
    throw new Error(data.message || "Materia non trovata.");
  }
  return data;
}

async function fetchSubjectsSummary() {
  const response = await fetch(`${API_URL}?action=subjects`, { cache: "no-store" });
  const text = await response.text();
  if (text.trim().startsWith("<")) {
    throw new Error("Risposta non JSON: verifica che PHP sia attivo e stai usando http://localhost/...");
  }
  const data = JSON.parse(text);
  if (!data.success) {
    throw new Error(data.message || "Errore nel caricamento.");
  }
  return data.levels;
}

async function resolveSubject() {
  const { level, subjectId } = getQueryParams();
  state.level = level || "hs";

  if (!subjectId) {
    const levels = await fetchSubjectsSummary();
    const levelData = levels[state.level] || levels.hs;
    if (!levelData || !levelData.subjects || levelData.subjects.length === 0) {
      state.subject = null;
      return;
    }
    state.level = levelData.id || state.level;
    const fallbackSubject = levelData.subjects[0];
    const data = await fetchSubject(state.level, fallbackSubject.id);
    state.subject = data.subject;
    if (state.level === "hs") {
      state.years = [];
      for (let year = 1; year <= 5; year += 1) {
        state.years.push({ id: String(year), name: `${year} anno` });
      }
    } else {
      state.years = [];
    }
    state.documents = data.documents || [];
    return;
  }

  const data = await fetchSubject(state.level, subjectId);
  state.subject = data.subject;
  if (state.level === "hs") {
    state.years = data.years || [];
    state.categories = [];
  } else {
    state.years = [];
    state.categories = data.categories || [];
  }
  state.documents = data.documents || [];
}

function renderYears() {
  if (!state.subject) {
    elements.yearList.innerHTML = "";
    return;
  }
  const items = [{ id: "all", name: "Tutti gli anni" }];
  if (state.level === "hs") {
    items.push(...state.years);
    elements.yearFilterCard.style.display = "block";
    if (elements.categoryFilterCard) {
      elements.categoryFilterCard.style.display = "none";
    }
  } else {
    if (elements.yearFilterCard) {
      elements.yearFilterCard.style.display = "none";
    }
    if (elements.categoryFilterCard) {
      elements.categoryFilterCard.style.display = "block";
    }
  }
  elements.yearList.innerHTML = items
    .map((year) => {
      const isActive = state.yearId === year.id;
      return `
        <li>
          <button class="chip ${isActive ? "active" : ""}" data-year-id="${year.id}">
            ${year.name}
          </button>
        </li>
      `;
    })
    .join("");
}

function renderHeader() {
  if (!state.subject) {
    elements.subjectTitle.textContent = "Materia non trovata";
    elements.subjectSubtitle.textContent = "Torna alla pagina principale per selezionare una materia.";
    return;
  }
  elements.subjectTitle.textContent = state.subject.name;
  elements.subjectSubtitle.textContent = state.subject.topics || "";
}

function getDocsForState() {
  if (!state.subject) {
    return [];
  }
  let docs = state.documents;
  
  if (state.level === "hs") {
    if (state.yearId !== "all") {
      docs = docs.filter((doc) => doc.yearId === state.yearId);
    }
  } else {
    if (state.categoryId !== "all") {
      docs = docs.filter((doc) => doc.yearId === state.categoryId);
    }
  }
  
  return docs;
}

function renderDocs() {
  const query = normalize(state.search.trim());
  const docs = getDocsForState().filter((doc) => docMatches(doc, query));

  elements.docList.innerHTML = docs
    .map((doc) => {
      const tags = doc.tags.map((tag) => `<span class="tag">${tag}</span>`).join("");
      const yearLabel = doc.yearName ? `<span class="meta-chip">${doc.yearName}</span>` : "";
      const fileUrl = BASE_PATH + doc.fileUrl;
      const solutionUrl = doc.solutionUrl ? BASE_PATH + doc.solutionUrl : null;
      const solution = solutionUrl
        ? `<a class="btn ghost" href="${solutionUrl}" target="_blank" rel="noopener">Soluzione</a>`
        : `<button class="btn ghost disabled" type="button" disabled>Nessuna soluzione</button>`;
      return `
        <article class="doc-card">
          <div class="doc-header">
            <div>
              <div class="doc-title">${doc.title}</div>
              <div class="doc-meta">
                <span>${doc.type}</span>
                <span>${doc.date}</span>
                ${yearLabel}
              </div>
            </div>
            <div class="actions">
              <a class="btn primary" href="${fileUrl}" target="_blank" rel="noopener">Apri</a>
              <a class="btn ghost" href="${fileUrl}" download>Scarica</a>
              ${solution}
              <button class="btn ghost" data-action="details" data-doc-id="${doc.id}">Dettagli</button>
            </div>
          </div>
          <div class="tags">${tags}</div>
        </article>
      `;
    })
    .join("");

  elements.emptyState.hidden = docs.length !== 0;
}

function findDocById(docId) {
  return state.documents.find((doc) => doc.id === docId) || null;
}

function renderModal() {
  if (!state.modalDoc) {
    elements.modal.classList.remove("open");
    elements.modal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("no-scroll");
    return;
  }

  const doc = state.modalDoc;
  const label = state.level === "uni" ? "Categoria" : "Anno";
  elements.modalTitle.textContent = doc.title;
  elements.modalMeta.innerHTML = `
    <div>Tipo: ${doc.type}</div>
    <div>Data: ${doc.date}</div>
    <div>${label}: ${doc.yearName || ""}</div>
  `;
  elements.modalTags.innerHTML = doc.tags.map((tag) => `<span class="tag">${tag}</span>`).join("");
  elements.modalDescription.textContent = doc.description || "Nessuna descrizione disponibile.";

  elements.modal.classList.add("open");
  elements.modal.setAttribute("aria-hidden", "false");
  document.body.classList.add("no-scroll");
}

function handleYearClick(event) {
  const target = event.target.closest("[data-year-id]");
  if (!target) {
    return;
  }
  state.yearId = target.dataset.yearId;
  renderYears();
  renderDocs();
}

function handleCategoryClick(event) {
  const target = event.target.closest("[data-category-id]");
  if (!target) {
    return;
  }
  state.categoryId = target.dataset.categoryId;
  
  // Update active state
  if (elements.categoryList) {
    elements.categoryList.querySelectorAll(".chip").forEach((chip) => {
      chip.classList.remove("active");
    });
    target.classList.add("active");
  }
  
  renderDocs();
}

function handleSearch(event) {
  state.search = event.target.value;
  renderDocs();
}

function handleDetails(event) {
  const target = event.target.closest("[data-doc-id]");
  if (!target) {
    return;
  }
  const doc = findDocById(target.dataset.docId);
  if (!doc) {
    return;
  }
  state.modalDoc = doc;
  renderModal();
}

function handleModalClose(event) {
  if (!event.target.closest("[data-modal-close]")) {
    return;
  }
  state.modalDoc = null;
  renderModal();
}

function handleEscape(event) {
  if (event.key !== "Escape") {
    return;
  }
  state.modalDoc = null;
  renderModal();
}

async function init() {
  try {
    await resolveSubject();
  } catch (error) {
    console.error(error);
  }
  renderHeader();
  renderYears();
  renderDocs();

  elements.yearList.addEventListener("click", handleYearClick);
  if (elements.categoryList) {
    elements.categoryList.addEventListener("click", handleCategoryClick);
  }
  elements.searchInput.addEventListener("input", handleSearch);
  document.addEventListener("click", (event) => {
    if (event.target.closest("[data-doc-id]")) {
      handleDetails(event);
      return;
    }
    handleModalClose(event);
  });
  document.addEventListener("keydown", handleEscape);
}

init();
