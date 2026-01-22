<?php

require_once __DIR__ . "/Documento.php";

class GestoreDocumenti
{
  private string $jsonPath;
  private string $rootPath;
  private array $index;
  private string $solutionSuffix = "_soluzione.pdf";

  public function __construct(string $jsonPath)
  {
    $this->jsonPath = $jsonPath;
    $this->rootPath = dirname(__DIR__, 2);
    $this->index = $this->loadIndex();
  }

  public function getIndex(): array
  {
    return $this->index;
  }

  public function getSubjectsSummary(): array
  {
    $levels = $this->index["levels"] ?? [];
    $summary = [];

    foreach ($levels as $levelId => $level) {
      $subjects = $level["subjects"] ?? [];
      $summarySubjects = [];
      foreach ($subjects as $subject) {
        $summarySubjects[] = [
          "id" => $subject["id"],
          "name" => $subject["name"],
          "topics" => $subject["topics"] ?? "",
          "icon" => $subject["icon"] ?? "grid",
          "resourceCount" => $this->countDocuments($levelId, $subject)
        ];
      }
      $summary[$levelId] = [
        "id" => $level["id"] ?? $levelId,
        "name" => $level["name"] ?? $levelId,
        "subjects" => $summarySubjects
      ];
    }

    return $summary;
  }

  public function getSubjectData(string $level, string $subjectId): ?array
  {
    $subject = $this->findSubject($level, $subjectId);
    if (!$subject) {
      return null;
    }

    $documents = [];
    $years = [];

    if ($level === "hs") {
      $years = $subject["years"] ?? [];
      foreach ($years as $year) {
        $yearId = $year["id"];
        $yearName = $year["name"];
        $yearDocs = $year["documents"] ?? [];
        foreach ($yearDocs as $doc) {
          $documents[] = $this->buildDocument($doc, $yearId, $yearName);
        }
      }
    } else {
      $categories = $subject["categories"] ?? [];
      foreach ($categories as $category) {
        $categoryId = $category["id"];
        $categoryName = $category["name"];
        $categoryDocs = $category["documents"] ?? [];
        foreach ($categoryDocs as $doc) {
          $documents[] = $this->buildDocument($doc, $categoryId, $categoryName);
        }
      }
    }

    $documents = array_values(array_filter($documents));

    $years = [];
    $categories = [];
    if ($level === "hs") {
      $years = $subject["years"] ?? [];
    } else {
      $categories = $subject["categories"] ?? [];
    }

    return [
      "subject" => [
        "id" => $subject["id"],
        "name" => $subject["name"],
        "topics" => $subject["topics"] ?? "",
        "icon" => $subject["icon"] ?? "grid"
      ],
      "years" => array_map(function ($year) {
        return [
          "id" => $year["id"],
          "name" => $year["name"]
        ];
      }, $years),
      "categories" => array_map(function ($category) {
        return [
          "id" => $category["id"],
          "name" => $category["name"]
        ];
      }, $categories),
      "documents" => array_map(function (Documento $doc) {
        return $doc->toArray();
      }, $documents)
    ];
  }

  public function addDocument(array $payload): array
  {
    $level = $payload["level"] ?? "";
    $subjectId = $payload["subjectId"] ?? "";
    $yearId = $payload["yearId"] ?? null;
    $filename = $payload["filename"] ?? "";
    $categoryId = $payload["categoryId"] ?? null;

    if ($this->isSolutionFileName($filename)) {
      return ["success" => false, "message" => "Il file di soluzione non puo essere aggiunto come documento."];
    }

    $subject = $this->findSubject($level, $subjectId);
    if (!$subject) {
      return ["success" => false, "message" => "Materia non trovata."];
    }

    $fileUrl = $this->buildFileUrl($level, $subjectId, $yearId, $filename);
    if (!$this->fileExists($fileUrl)) {
      return ["success" => false, "message" => "File non trovato nel filesystem."];
    }

    $doc = [
      "id" => $this->buildDocumentId($subjectId),
      "title" => $payload["title"] ?? $filename,
      "type" => $payload["type"] ?? "Appunti",
      "date" => $payload["date"] ?? date("Y-m-d"),
      "tags" => $this->normalizeTags($payload["tags"] ?? ""),
      "description" => $payload["description"] ?? "",
      "fileUrl" => $fileUrl,
      "solutionUrl" => null,
      "p" => 1
    ];

    $doc["solutionUrl"] = $this->detectSolutionUrl($doc["fileUrl"]);

    if ($level === "hs") {
      if (!$yearId) {
        return ["success" => false, "message" => "Anno mancante per il livello HS."];
      }
      $updated = false;
      foreach ($this->index["levels"]["hs"]["subjects"] as &$subjectRef) {
        if ($subjectRef["id"] !== $subjectId) {
          continue;
        }
        foreach ($subjectRef["years"] as &$yearRef) {
          if ($yearRef["id"] === $yearId) {
            $yearRef["documents"][] = $doc;
            $updated = true;
            break;
          }
        }
        if (!$updated) {
          return ["success" => false, "message" => "Anno non trovato nella materia."];
        }
      }
    } else {
      $updated = false;
      foreach ($this->index["levels"]["uni"]["subjects"] as &$subjectRef) {
        if ($subjectRef["id"] !== $subjectId) {
          continue;
        }
        $categories = $subjectRef["categories"] ?? [];
        if (!$categories) {
          $subjectRef["categories"] = [
            [
              "id" => "Esami",
              "name" => "Esami",
              "documents" => []
            ]
          ];
        }
        $targetCategory = $categoryId ?: ($subjectRef["categories"][0]["id"] ?? "Esami");
        foreach ($subjectRef["categories"] as &$categoryRef) {
          if ($categoryRef["id"] === $targetCategory) {
            $categoryRef["documents"][] = $doc;
            $updated = true;
            break;
          }
        }
        if (!$updated) {
          $subjectRef["categories"][0]["documents"][] = $doc;
          $updated = true;
        }
        break;
      }
      if (!$updated) {
        return ["success" => false, "message" => "Materia non trovata."];
      }
    }

    $this->saveIndex($this->index);

    return ["success" => true, "document" => $doc];
  }

  public function removeDocument(string $level, string $subjectId, string $docId): array
  {
    $removed = false;
    $fileUrl = null;
    $solutionUrl = null;
    $year = null;
    $category = null;

    if ($level === "hs") {
      foreach ($this->index["levels"]["hs"]["subjects"] as &$subjectRef) {
        if ($subjectRef["id"] !== $subjectId) {
          continue;
        }
        foreach ($subjectRef["years"] as &$yearRef) {
          $docs = $yearRef["documents"] ?? [];
          $newDocs = [];
          foreach ($docs as $doc) {
            if ($doc["id"] === $docId) {
              $removed = true;
              $fileUrl = $doc["fileUrl"] ?? null;
              $solutionUrl = $doc["solutionUrl"] ?? null;
              $year = $yearRef["id"] ?? null;
              $doc["p"] = 0;
            }
            $newDocs[] = $doc;
          }
          $yearRef["documents"] = $newDocs;
        }
      }
    } else {
      foreach ($this->index["levels"]["uni"]["subjects"] as &$subjectRef) {
        if ($subjectRef["id"] !== $subjectId) {
          continue;
        }
        foreach ($subjectRef["categories"] ?? [] as &$categoryRef) {
          $docs = $categoryRef["documents"] ?? [];
          $newDocs = [];
          foreach ($docs as $doc) {
            if ($doc["id"] === $docId) {
              $removed = true;
              $fileUrl = $doc["fileUrl"] ?? null;
              $solutionUrl = $doc["solutionUrl"] ?? null;
              $category = $categoryRef["id"] ?? null;
              $doc["p"] = 0;
            }
            $newDocs[] = $doc;
          }
          $categoryRef["documents"] = $newDocs;
        }
      }
    }

    if (!$removed) {
      return ["success" => false, "message" => "Documento non trovato."];
    }

    $this->saveIndex($this->index);

    return [
      "success" => true,
      "fileUrl" => $fileUrl,
      "solutionUrl" => $solutionUrl,
      "year" => $year,
      "category" => $category
    ];
  }

  

  private function loadIndex(): array
  {
    if (!file_exists($this->jsonPath)) {
      return ["levels" => []];
    }
    $content = file_get_contents($this->jsonPath);
    $data = json_decode($content, true);
    if (!is_array($data)) {
      return ["levels" => []];
    }
    return $data;
  }

  private function saveIndex(array $data): void
  {
    file_put_contents($this->jsonPath, json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES));
  }

  private function findSubject(string $level, string $subjectId): ?array
  {
    $levels = $this->index["levels"] ?? [];
    $levelData = $levels[$level] ?? null;
    if (!$levelData) {
      return null;
    }
    foreach ($levelData["subjects"] ?? [] as $subject) {
      if ($subject["id"] === $subjectId) {
        return $subject;
      }
    }
    return null;
  }

  private function countDocuments(string $level, array $subject): int
  {
    $count = 0;
    if ($level === "hs") {
      foreach ($subject["years"] ?? [] as $year) {
        foreach ($year["documents"] ?? [] as $doc) {
          if (($doc["p"] ?? 1) === 0) {
            continue;
          }
          if ($this->isSolutionDocument($doc)) {
            continue;
          }
          if ($this->fileExists($doc["fileUrl"] ?? "")) {
            $count++;
          }
        }
      }
    } else {
      foreach ($subject["categories"] ?? [] as $category) {
        foreach ($category["documents"] ?? [] as $doc) {
          if (($doc["p"] ?? 1) === 0) {
            continue;
          }
          if ($this->isSolutionDocument($doc)) {
            continue;
          }
          if ($this->fileExists($doc["fileUrl"] ?? "")) {
            $count++;
          }
        }
      }
    }
    return $count;
  }

  private function buildDocument(array $docData, ?string $yearId, ?string $yearName): ?Documento
  {
    if (($docData["p"] ?? 1) === 0) {
      return null;
    }
    if ($this->isSolutionDocument($docData)) {
      return null;
    }
    $fileUrl = $docData["fileUrl"] ?? "";
    if (!$this->fileExists($fileUrl)) {
      return null;
    }

    $docData["solutionUrl"] = $this->resolveSolutionUrl($docData);
    $docData["yearId"] = $yearId;
    $docData["yearName"] = $yearName;

    return new Documento($docData);
  }

  private function isSolutionDocument(array $docData): bool
  {
    $fileUrl = $docData["fileUrl"] ?? "";
    if (!$fileUrl) {
      return false;
    }
    $filename = strtolower(basename($fileUrl));
    return strpos($filename, "soluzione") === 0;
  }

  private function resolveSolutionUrl(array $docData): ?string
  {
    $solutionUrl = $docData["solutionUrl"] ?? null;
    if ($solutionUrl && $this->fileExists($solutionUrl)) {
      return $solutionUrl;
    }

    $fileUrl = $docData["fileUrl"] ?? "";
    return $this->detectSolutionUrl($fileUrl);
  }

  private function detectSolutionUrl(string $fileUrl): ?string
  {
    if (!$fileUrl) {
      return null;
    }
    $pathInfo = pathinfo($fileUrl);
    $candidate = $pathInfo["dirname"] . "/" . $pathInfo["filename"] . $this->solutionSuffix;
    if ($this->fileExists($candidate)) {
      return $candidate;
    }
    return null;
  }

  private function fileExists(string $url): bool
  {
    if (!$url) {
      return false;
    }
    $path = $this->rootPath . DIRECTORY_SEPARATOR . ltrim($url, "/");
    return file_exists($path);
  }

  private function buildFileUrl(string $level, string $subjectId, ?string $yearId, string $filename): string
  {
    $filename = ltrim($filename, "/");
    if ($level === "hs") {
      return "/src/Documents/hs/" . $subjectId . "/" . $yearId . "/" . $filename;
    }
    return "/src/Documents/uni/" . $subjectId . "/" . $filename;
  }

  private function buildDocumentId(string $subjectId): string
  {
    return $subjectId . "-" . time();
  }

  private function normalizeTags(string $tags): array
  {
    if (!$tags) {
      return [];
    }
    $parts = array_map("trim", explode(",", $tags));
    return array_values(array_filter($parts));
  }

  private function isSolutionFileName(string $filename): bool
  {
    $lower = strtolower($filename);
    return substr($lower, -strlen($this->solutionSuffix)) === $this->solutionSuffix;
  }
}
