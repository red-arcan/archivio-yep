const API_URL = "src/Class/api.php";

const subjectGridHs = document.getElementById("subjectGridHs");
const subjectGridUni = document.getElementById("subjectGridUni");

const iconMap = {
  grid: `
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect x="4" y="4" width="6" height="6" rx="1"></rect>
      <rect x="14" y="4" width="6" height="6" rx="1"></rect>
      <rect x="4" y="14" width="6" height="6" rx="1"></rect>
      <rect x="14" y="14" width="6" height="6" rx="1"></rect>
    </svg>
  `,
  atom: `
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="2.5"></circle>
      <ellipse cx="12" cy="12" rx="9" ry="4.5"></ellipse>
      <ellipse cx="12" cy="12" rx="4.5" ry="9" transform="rotate(60 12 12)"></ellipse>
      <ellipse cx="12" cy="12" rx="4.5" ry="9" transform="rotate(-60 12 12)"></ellipse>
    </svg>
  `,
  beaker: `
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M9 3h6v2h-1v4.3l4.4 7.4a3 3 0 0 1-2.6 4.3H8.2a3 3 0 0 1-2.6-4.3L10 9.3V5H9z"></path>
    </svg>
  `,
  timeline: `
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M5 4h2v4H5zM5 16h2v4H5zM5 10h2v4H5z"></path>
      <path d="M11 6h8v2h-8zM11 12h8v2h-8zM11 18h8v2h-8z"></path>
    </svg>
  `,
  code: `
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M8 8l-4 4 4 4"></path>
      <path d="M16 8l4 4-4 4"></path>
      <path d="M10 20l4-16"></path>
    </svg>
  `,
  book: `
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 5h11a3 3 0 0 1 3 3v11H7a3 3 0 0 0-3 3z"></path>
      <path d="M7 5v14"></path>
    </svg>
  `
};

async function fetchSubjects() {
  const response = await fetch(`${API_URL}?action=subjects`, {
    credentials: "same-origin",
    cache: "no-store"
  });
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

function renderCard(subject, level) {
  const icon = iconMap[subject.icon] || iconMap.grid;
  return `
    <a class="subject-card" href="archive.html?level=${level}&subject=${subject.id}">
      <div class="subject-icon">${icon}</div>
      <div class="subject-body">
        <h3>${subject.name}</h3>
        <p class="subject-topics">${subject.topics || ""}</p>
        <div class="subject-meta">
          <span>${subject.resourceCount} Risorse</span>
        </div>
      </div>
    </a>
  `;
}

function renderSubjectsForGrid(level, grid, levels) {
  if (!grid) {
    return;
  }
  const subjects = levels[level]?.subjects || [];
  grid.innerHTML = subjects.map((subject) => renderCard(subject, level)).join("");
}

async function loadSubjects() {
  try {
    const levels = await fetchSubjects();
    renderSubjectsForGrid("hs", subjectGridHs, levels);
    renderSubjectsForGrid("uni", subjectGridUni, levels);
  } catch (error) {
    console.error(error);
  }
}

loadSubjects();
