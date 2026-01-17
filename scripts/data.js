export const data = {
  levels: {
    hs: {
      id: "hs",
      name: "Scuole Superiori",
      subjects: [
        {
          id: "matematica",
          name: "Matematica",
          topics: "Algebra, Calcolo, Geometria",
          icon: "grid",
          years: [
            {
              id: "primo-anno",
              name: "Primo anno",
              documents: [
                {
                  id: "doc-mat-1-001",
                  title: "Numeri razionali e operazioni",
                  type: "Appunti",
                  date: "2024-09-10",
                  tags: ["numeri", "frazioni", "basi"],
                  description: "Riepilogo di frazioni, decimali e operazioni fondamentali.",
                  fileUrl: "#",
                  solutionUrl: null
                },
                {
                  id: "doc-mat-1-002",
                  title: "Esercizi su equazioni di primo grado",
                  type: "Verifica",
                  date: "2024-10-01",
                  tags: ["equazioni", "esercizi"],
                  description: "Scheda di allenamento con soluzioni guidate.",
                  fileUrl: "#",
                  solutionUrl: "#"
                },
                {
                  id: "doc-mat-1-003",
                  title: "Geometria piana: perimetri e aree",
                  type: "Slide",
                  date: "2024-10-20",
                  tags: ["geometria", "aree"],
                  description: "Slide introduttive su poligoni e formule principali.",
                  fileUrl: "#",
                  solutionUrl: null
                }
              ]
            },
            {
              id: "secondo-anno",
              name: "Secondo anno",
              documents: [
                {
                  id: "doc-mat-2-001",
                  title: "Funzioni e grafici essenziali",
                  type: "Appunti",
                  date: "2024-09-18",
                  tags: ["funzioni", "grafici"],
                  description: "Panoramica su funzioni lineari e loro rappresentazione.",
                  fileUrl: "#",
                  solutionUrl: null
                },
                {
                  id: "doc-mat-2-002",
                  title: "Verifica su sistemi lineari",
                  type: "Verifica",
                  date: "2024-10-08",
                  tags: ["sistemi", "lineare"],
                  description: "Test con esercizi di sostituzione e confronto.",
                  fileUrl: "#",
                  solutionUrl: "#"
                },
                {
                  id: "doc-mat-2-003",
                  title: "Introduzione alle parabole",
                  type: "Slide",
                  date: "2024-10-26",
                  tags: ["parabola", "funzioni"],
                  description: "Slide con esempi e grafici commentati.",
                  fileUrl: "#",
                  solutionUrl: null
                }
              ]
            }
          ]
        },
        {
          id: "fisica",
          name: "Fisica",
          topics: "Meccanica, Termodinamica, Onde",
          icon: "atom",
          years: [
            {
              id: "primo-anno",
              name: "Primo anno",
              documents: [
                {
                  id: "doc-fis-1-001",
                  title: "Grandezze fisiche e unita di misura",
                  type: "Appunti",
                  date: "2024-09-12",
                  tags: ["misure", "grandezze"],
                  description: "Definizioni principali e conversioni di base.",
                  fileUrl: "#",
                  solutionUrl: null
                },
                {
                  id: "doc-fis-1-002",
                  title: "Moto rettilineo uniforme",
                  type: "Verifica",
                  date: "2024-10-03",
                  tags: ["moto", "velocita"],
                  description: "Esercizi su velocita media e grafici spazio-tempo.",
                  fileUrl: "#",
                  solutionUrl: "#"
                },
                {
                  id: "doc-fis-1-003",
                  title: "Forze e diagrammi",
                  type: "Slide",
                  date: "2024-10-22",
                  tags: ["forze", "dinamica"],
                  description: "Slide con esempi di diagrammi corpo libero.",
                  fileUrl: "#",
                  solutionUrl: null
                }
              ]
            },
            {
              id: "secondo-anno",
              name: "Secondo anno",
              documents: [
                {
                  id: "doc-fis-2-001",
                  title: "Lavoro, energia e potenza",
                  type: "Appunti",
                  date: "2024-09-25",
                  tags: ["energia", "potenza"],
                  description: "Sintesi su lavoro meccanico e conservazione dell'energia.",
                  fileUrl: "#",
                  solutionUrl: null
                },
                {
                  id: "doc-fis-2-002",
                  title: "Verifica su quantita di moto",
                  type: "Verifica",
                  date: "2024-10-12",
                  tags: ["urti", "quantita di moto"],
                  description: "Problemi guidati con urti elastici e anelastici.",
                  fileUrl: "#",
                  solutionUrl: "#"
                },
                {
                  id: "doc-fis-2-003",
                  title: "Onde meccaniche: panoramica",
                  type: "Slide",
                  date: "2024-10-29",
                  tags: ["onde", "frequenza"],
                  description: "Slide su caratteristiche delle onde e applicazioni.",
                  fileUrl: "#",
                  solutionUrl: null
                }
              ]
            }
          ]
        },
        {
          id: "chimica",
          name: "Chimica",
          topics: "Organica, Inorganica, Laboratorio",
          icon: "beaker",
          years: [
            {
              id: "primo-anno",
              name: "Primo anno",
              documents: [
                {
                  id: "doc-chim-1-001",
                  title: "Struttura dell'atomo",
                  type: "Appunti",
                  date: "2024-09-08",
                  tags: ["atomo", "struttura"],
                  description: "Panoramica su particelle subatomiche e modelli atomici.",
                  fileUrl: "#",
                  solutionUrl: null
                },
                {
                  id: "doc-chim-1-002",
                  title: "Verifica sulle leggi ponderali",
                  type: "Verifica",
                  date: "2024-09-28",
                  tags: ["leggi", "massa"],
                  description: "Test con esercizi sulle leggi fondamentali.",
                  fileUrl: "#",
                  solutionUrl: "#"
                },
                {
                  id: "doc-chim-1-003",
                  title: "Laboratorio: miscugli e soluzioni",
                  type: "Slide",
                  date: "2024-10-15",
                  tags: ["laboratorio", "soluzioni"],
                  description: "Slide operative per esperimenti di separazione.",
                  fileUrl: "#",
                  solutionUrl: null
                }
              ]
            },
            {
              id: "secondo-anno",
              name: "Secondo anno",
              documents: [
                {
                  id: "doc-chim-2-001",
                  title: "Legami chimici essenziali",
                  type: "Appunti",
                  date: "2024-09-22",
                  tags: ["legami", "ionico"],
                  description: "Schema sui legami ionici, covalenti e metallici.",
                  fileUrl: "#",
                  solutionUrl: null
                },
                {
                  id: "doc-chim-2-002",
                  title: "Verifica su reazioni redox",
                  type: "Verifica",
                  date: "2024-10-10",
                  tags: ["redox", "reazioni"],
                  description: "Esercizi con bilanciamento e numeri di ossidazione.",
                  fileUrl: "#",
                  solutionUrl: "#"
                },
                {
                  id: "doc-chim-2-003",
                  title: "Chimica organica: gruppi funzionali",
                  type: "Slide",
                  date: "2024-10-27",
                  tags: ["organica", "gruppi"],
                  description: "Slide sui gruppi funzionali e nomenclatura base.",
                  fileUrl: "#",
                  solutionUrl: null
                }
              ]
            }
          ]
        },
        
        {
          id: "informatica",
          name: "Informatica",
          topics: "Programmazione, Reti, Dati",
          icon: "code",
          years: [
            {
              id: "primo-anno",
              name: "Primo anno",
              documents: [
                {
                  id: "doc-inf-1-001",
                  title: "Introduzione agli algoritmi",
                  type: "Appunti",
                  date: "2024-09-13",
                  tags: ["algoritmi", "logica"],
                  description: "Concetti base su sequenze e cicli.",
                  fileUrl: "#",
                  solutionUrl: null
                },
                {
                  id: "doc-inf-1-002",
                  title: "Verifica su pseudocodice",
                  type: "Verifica",
                  date: "2024-10-02",
                  tags: ["pseudocodice", "esercizi"],
                  description: "Esercizi guidati su strutture di controllo.",
                  fileUrl: "#",
                  solutionUrl: "#"
                },
                {
                  id: "doc-inf-1-003",
                  title: "Basi di hardware",
                  type: "Slide",
                  date: "2024-10-19",
                  tags: ["hardware", "componenti"],
                  description: "Slide sui componenti principali del computer.",
                  fileUrl: "#",
                  solutionUrl: null
                }
              ]
            },
            {
              id: "secondo-anno",
              name: "Secondo anno",
              documents: [
                {
                  id: "doc-inf-2-001",
                  title: "Strutture dati essenziali",
                  type: "Appunti",
                  date: "2024-09-23",
                  tags: ["strutture dati", "liste"],
                  description: "Array, liste e stack con esempi pratici.",
                  fileUrl: "#",
                  solutionUrl: null
                },
                {
                  id: "doc-inf-2-002",
                  title: "Verifica su reti locali",
                  type: "Verifica",
                  date: "2024-10-11",
                  tags: ["reti", "lan"],
                  description: "Domande su topologie e dispositivi di rete.",
                  fileUrl: "#",
                  solutionUrl: "#"
                },
                {
                  id: "doc-inf-2-003",
                  title: "Database: concetti base",
                  type: "Slide",
                  date: "2024-10-30",
                  tags: ["database", "sql"],
                  description: "Slide introduttive su tabelle e chiavi.",
                  fileUrl: "#",
                  solutionUrl: null
                }
              ]
            }
          ]
        }
        
      ]
    },
    uni: {
      id: "uni",
      name: "Universita",
      subjects: [
        {
          id: "analisi1",
          name: "Analisi 1",
          topics: "Limiti, Derivate, Integrali",
          icon: "grid",
          years: [
            {
              id: "primo-anno",
              name: "Primo anno",
              documents: [
                {
                  id: "doc-uni-ana1-1-001",
                  title: "Limiti e continuita",
                  type: "Appunti",
                  date: "2024-10-05",
                  tags: ["limiti", "continuita"],
                  description: "Sintesi su limiti notevoli e continuita.",
                  fileUrl: "#",
                  solutionUrl: null
                }
              ]
            },
            {
              id: "secondo-anno",
              name: "Secondo anno",
              documents: [
                {
                  id: "doc-uni-ana1-2-001",
                  title: "Integrali definiti: esercizi",
                  type: "Esercizi",
                  date: "2025-02-14",
                  tags: ["integrali", "esercizi"],
                  description: "Esercizi guidati sugli integrali definiti.",
                  fileUrl: "#",
                  solutionUrl: "#"
                }
              ]
            }
          ]
        },
        {
          id: "analisi2",
          name: "Analisi 2",
          topics: "Serie, Integrali impropri, Fourier",
          icon: "grid",
          years: [
            {
              id: "primo-anno",
              name: "Primo anno",
              documents: [
                {
                  id: "doc-uni-ana2-1-001",
                  title: "Serie numeriche: criteri",
                  type: "Appunti",
                  date: "2025-03-10",
                  tags: ["serie", "criteri"],
                  description: "Riepilogo dei principali criteri di convergenza.",
                  fileUrl: "#",
                  solutionUrl: null
                }
              ]
            },
            {
              id: "secondo-anno",
              name: "Secondo anno",
              documents: [
                {
                  id: "doc-uni-ana2-2-001",
                  title: "Fourier e applicazioni",
                  type: "Slide",
                  date: "2025-04-02",
                  tags: ["fourier", "trasformate"],
                  description: "Slide introduttive su serie di Fourier.",
                  fileUrl: "#",
                  solutionUrl: null
                }
              ]
            }
          ]
        },
        {
          id: "fisica1",
          name: "Fisica 1",
          topics: "Meccanica, Termodinamica",
          icon: "atom",
          years: [
            {
              id: "primo-anno",
              name: "Primo anno",
              documents: [
                {
                  id: "doc-uni-fis1-1-001",
                  title: "Cinematica del punto materiale",
                  type: "Appunti",
                  date: "2024-10-12",
                  tags: ["cinematica", "moto"],
                  description: "Schema su moto rettilineo e accelerato.",
                  fileUrl: "#",
                  solutionUrl: null
                }
              ]
            },
            {
              id: "secondo-anno",
              name: "Secondo anno",
              documents: [
                {
                  id: "doc-uni-fis1-2-001",
                  title: "Termodinamica: primo principio",
                  type: "Verifica",
                  date: "2025-01-20",
                  tags: ["termodinamica", "energia"],
                  description: "Esercizi sul primo principio e applicazioni.",
                  fileUrl: "#",
                  solutionUrl: "#"
                }
              ]
            }
          ]
        },
        {
          id: "fisica2",
          name: "Fisica 2",
          topics: "Elettromagnetismo, Onde",
          icon: "atom",
          years: [
            {
              id: "primo-anno",
              name: "Primo anno",
              documents: [
                {
                  id: "doc-uni-fis2-1-001",
                  title: "Campi elettrici essenziali",
                  type: "Appunti",
                  date: "2025-02-05",
                  tags: ["campi", "elettrico"],
                  description: "Sintesi su campo elettrico e potenziale.",
                  fileUrl: "#",
                  solutionUrl: null
                }
              ]
            },
            {
              id: "secondo-anno",
              name: "Secondo anno",
              documents: [
                {
                  id: "doc-uni-fis2-2-001",
                  title: "Onde elettromagnetiche",
                  type: "Slide",
                  date: "2025-03-22",
                  tags: ["onde", "elettromagnetismo"],
                  description: "Slide su propagazione e spettro.",
                  fileUrl: "#",
                  solutionUrl: null
                }
              ]
            }
          ]
        },
        {
          id: "algebra-lineare",
          name: "Algebra Lineare",
          topics: "Spazi vettoriali, Matrici",
          icon: "grid",
          years: [
            {
              id: "primo-anno",
              name: "Primo anno",
              documents: [
                {
                  id: "doc-uni-alg-1-001",
                  title: "Spazi vettoriali: basi",
                  type: "Appunti",
                  date: "2024-11-02",
                  tags: ["spazi", "basi"],
                  description: "Definizioni e esempi di basi e dimensione.",
                  fileUrl: "#",
                  solutionUrl: null
                }
              ]
            },
            {
              id: "secondo-anno",
              name: "Secondo anno",
              documents: [
                {
                  id: "doc-uni-alg-2-001",
                  title: "Matrici e sistemi lineari",
                  type: "Esercizi",
                  date: "2025-02-18",
                  tags: ["matrici", "sistemi"],
                  description: "Esercizi con metodo di Gauss.",
                  fileUrl: "#",
                  solutionUrl: "#"
                }
              ]
            }
          ]
        },
        {
          id: "chimica",
          name: "Chimica",
          topics: "Struttura, Reazioni",
          icon: "beaker",
          years: [
            {
              id: "primo-anno",
              name: "Primo anno",
              documents: [
                {
                  id: "doc-uni-chim-1-001",
                  title: "Struttura molecolare",
                  type: "Appunti",
                  date: "2024-10-18",
                  tags: ["struttura", "molecole"],
                  description: "Richiamo su geometrie e legami.",
                  fileUrl: "#",
                  solutionUrl: null
                }
              ]
            },
            {
              id: "secondo-anno",
              name: "Secondo anno",
              documents: [
                {
                  id: "doc-uni-chim-2-001",
                  title: "Cinetica e equilibrio",
                  type: "Slide",
                  date: "2025-03-05",
                  tags: ["cinetica", "equilibrio"],
                  description: "Slide su velocita di reazione ed equilibrio.",
                  fileUrl: "#",
                  solutionUrl: null
                }
              ]
            }
          ]
        }
      ]
    }
  }
};

data.subjects = data.levels.hs.subjects;

export function getSubjects(level = "hs") {
  const selectedLevel = data.levels[level] || data.levels.hs;
  return selectedLevel ? selectedLevel.subjects : [];
}

export function getSubjectById(id, level = "hs") {
  return getSubjects(level).find((subject) => subject.id === id) || null;
}

export function getYearsForSubject(subject) {
  return subject ? subject.years : [];
}

export function getDocumentsForYear(subject, yearId) {
  if (!subject) {
    return [];
  }
  const year = subject.years.find((item) => item.id === yearId);
  return year ? year.documents : [];
}

export function getAllDocumentsForSubject(subject) {
  if (!subject) {
    return [];
  }
  return subject.years.flatMap((year) =>
    year.documents.map((doc) => ({ ...doc, yearId: year.id, yearName: year.name }))
  );
}
