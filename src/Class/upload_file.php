<?php

header("Content-Type: application/json; charset=utf-8");

$rootPath = dirname(__DIR__, 2);
$indexPath = $rootPath . "/Config/archive_index.json";
$index = file_exists($indexPath) ? json_decode(file_get_contents($indexPath), true) : ["levels" => []];
if (!is_array($index)) {
  $index = ["levels" => []];
}

$allowedSubjects = [
  "hs" => [],
  "uni" => []
];

foreach ($index["levels"]["hs"]["subjects"] ?? [] as $subjectItem) {
  if (!empty($subjectItem["id"])) {
    $allowedSubjects["hs"][] = $subjectItem["id"];
  }
}

foreach ($index["levels"]["uni"]["subjects"] ?? [] as $subjectItem) {
  if (!empty($subjectItem["id"])) {
    $allowedSubjects["uni"][] = $subjectItem["id"];
  }
}

if (empty($allowedSubjects["hs"]) && empty($allowedSubjects["uni"]) && file_exists(__DIR__ . "/subject_pool.php")) {
  $allowedSubjects = require __DIR__ . "/subject_pool.php";
}

$level = $_POST["level"] ?? "";
$subject = $_POST["subject"] ?? "";
$year = $_POST["year"] ?? "";
$title = trim($_POST["title"] ?? "");
$tagsRaw = trim($_POST["tags"] ?? "");
$description = trim($_POST["description"] ?? "");
$category = trim($_POST["category"] ?? "");

if (!$level || !$subject || empty($_FILES["file"])) {
  echo json_encode(["ok" => false, "error" => "Dati mancanti."]);
  exit;
}

if ($level !== "hs" && $level !== "uni") {
  echo json_encode(["ok" => false, "error" => "Livello non valido."]);
  exit;
}

if (!in_array($subject, $allowedSubjects[$level], true)) {
  echo json_encode(["ok" => false, "error" => "Materia non valida."]);
  exit;
}

if ($level === "hs") {
  $yearNumber = (int) $year;
  if ($yearNumber < 1 || $yearNumber > 5) {
    echo json_encode(["ok" => false, "error" => "Anno non valido."]);
    exit;
  }
  $year = (string) $yearNumber;
} else {
  $year = "";
}

$sectionLabel = $level === "hs"
  ? "Scuola - " . $subject . " - anno " . $year
  : "Universita - " . $subject;


$file = $_FILES["file"];
if ($file["error"] !== UPLOAD_ERR_OK || !is_uploaded_file($file["tmp_name"])) {
  echo json_encode(["ok" => false, "error" => "Errore durante l'upload."]);
  exit;
}

$safeFilename = sanitizePdfFilename($file["name"]);
$safeName = pathinfo($safeFilename, PATHINFO_FILENAME);
$finalTitle = $title !== "" ? $title : $safeName;
if ($finalTitle === "") {
  echo json_encode(["ok" => false, "error" => "Titolo non valido."]);
  exit;
}

if ($level === "hs") {
  $destinationDir = $rootPath . "/src/Documents/hs/" . $subject . "/" . $year;
} else {
  $destinationDir = $rootPath . "/src/Documents/uni/" . $subject;
}

if (!is_dir($destinationDir)) {
  if (!mkdir($destinationDir, 0775, true)) {
    echo json_encode([
      "ok" => false,
      "error" => "Impossibile creare la cartella di destinazione in " . $sectionLabel . ".\nVerifica permessi e riprova."
    ]);
    exit;
  }
}

$destinationPath = $destinationDir . "/" . $safeFilename;

$solutionPath = null;
$solutionFilename = null;
$solutionDestination = null;

// Preflight checks: validate files and uniqueness before moving anything.
$fileError = validateUploadedPdf($file);
if ($fileError) {
  echo json_encode(["ok" => false, "error" => $fileError]);
  exit;
}

if (file_exists($destinationPath)) {
  echo json_encode([
    "ok" => false,
    "error" => "Esiste gia un file PDF principale con lo stesso nome in " . $sectionLabel . ".\nRinominare il file per aggiungerlo."
  ]);
  exit;
}

if (stripos($safeFilename, "soluzione") !== false) {
  echo json_encode(["ok" => false, "error" => "La soluzione va caricata a destra con file Principale associato!"]);
  exit;
}

$targetDocs = [];
if ($level === "uni") {
  $targetDocs = findDocumentsForUniSubject($index, $subject);
} else {
  $targetDocs = findDocumentsForTarget($index, $level, $subject, $year, $category);
}

if (titleExists($targetDocs, $finalTitle)) {
  $message = "Esiste gia un documento con lo stesso titolo in " . $sectionLabel . ".\nRinominare il titolo per aggiungerlo.";
  echo json_encode(["ok" => false, "error" => $message]);
  exit;
}

if ($level === "uni" && filenameExistsInSubject($targetDocs, $safeFilename)) {
  echo json_encode([
    "ok" => false,
    "error" => "Esiste gia un file con lo stesso nome in " . $sectionLabel . ".\nRinominare il PDF per aggiungerlo."
  ]);
  exit;
}

if (!empty($_FILES["solution"]["name"])) {
  $solutionFile = $_FILES["solution"];
  if ($solutionFile["error"] !== UPLOAD_ERR_OK || !is_uploaded_file($solutionFile["tmp_name"])) {
    echo json_encode(["ok" => false, "error" => "Soluzione: errore durante l'upload."]);
    exit;
  }
  $solutionError = validateUploadedPdf($solutionFile);
  if ($solutionError) {
    echo json_encode(["ok" => false, "error" => "Soluzione: " . $solutionError]);
    exit;
  }
  $solutionFilename = sanitizePdfFilename($solutionFile["name"]);
  if (stripos($solutionFilename, "soluzione") === false) {
    echo json_encode([
      "ok" => false,
      "error" => "Il file soluzione deve contenere la parola \"soluzione\" nel nome in " . $sectionLabel . ".\nRinominare il file soluzione per aggiungerlo."
    ]);
    exit;
  }
  $solutionDestination = $destinationDir . "/" . $solutionFilename;
  if (file_exists($solutionDestination)) {
    echo json_encode([
      "ok" => false,
      "error" => "Esiste gia un file soluzione con lo stesso nome in " . $sectionLabel . ".\nRinominare il file soluzione per aggiungerlo."
    ]);
    exit;
  }
  if ($level === "uni" && filenameExistsInSubject($targetDocs, $solutionFilename)) {
    echo json_encode([
      "ok" => false,
      "error" => "Esiste gia un file con lo stesso nome in " . $sectionLabel . ".\nRinominare la soluzione per aggiungerla."
    ]);
    exit;
  }
}

if (!move_uploaded_file($file["tmp_name"], $destinationPath)) {
  echo json_encode([
    "ok" => false,
    "error" => "Salvataggio file non riuscito in " . $sectionLabel . ".\nRiprova o verifica i permessi."
  ]);
  exit;
}

if ($solutionDestination) {
  $solutionFile = $_FILES["solution"];
  if (!move_uploaded_file($solutionFile["tmp_name"], $solutionDestination)) {
    @unlink($destinationPath);
    echo json_encode([
      "ok" => false,
      "error" => "Salvataggio soluzione non riuscito in " . $sectionLabel . ".\nRiprova o verifica i permessi."
    ]);
    exit;
  }
  $solutionPath = str_replace($rootPath, "", $solutionDestination);
  $solutionPath = str_replace("\\", "/", $solutionPath);
}

$relativePath = str_replace($rootPath, "", $destinationPath);
$relativePath = str_replace("\\", "/", $relativePath);

$tags = parseTags($tagsRaw);

if (!isset($index["levels"][$level])) {
  $index["levels"][$level] = [
    "id" => $level,
    "name" => $level === "hs" ? "Scuole Superiori" : "Universita",
    "subjects" => []
  ];
}

if ($level === "hs") {
  $subjectRef = null;
  foreach ($index["levels"]["hs"]["subjects"] as &$subjectItem) {
    if ($subjectItem["id"] === $subject) {
      $subjectRef = &$subjectItem;
      break;
    }
  }
  if ($subjectRef === null) {
    $subjectRef = [
      "id" => $subject,
      "name" => ucfirst($subject),
      "topics" => "",
      "icon" => "grid",
      "years" => []
    ];
    $index["levels"]["hs"]["subjects"][] = &$subjectRef;
  }

  $yearRef = null;
  foreach ($subjectRef["years"] as &$yearItem) {
    if ($yearItem["id"] === $year) {
      $yearRef = &$yearItem;
      break;
    }
  }
  if ($yearRef === null) {
    $yearRef = [
      "id" => $year,
      "name" => $year . " anno",
      "documents" => []
    ];
    $subjectRef["years"][] = &$yearRef;
  }

  $yearRef["documents"][] = [
    "id" => $subject . "-" . time(),
    "title" => $finalTitle,
    "type" => "PDF",
    "date" => date("Y-m-d"),
    "tags" => $tags,
    "description" => $description,
    "fileUrl" => $relativePath,
    "solutionUrl" => $solutionPath
  ];
} else {
  $subjectRef = null;
  foreach ($index["levels"]["uni"]["subjects"] as &$subjectItem) {
    if ($subjectItem["id"] === $subject) {
      $subjectRef = &$subjectItem;
      break;
    }
  }
  if ($subjectRef === null) {
    $subjectRef = [
      "id" => $subject,
      "name" => ucfirst($subject),
      "topics" => "",
      "icon" => "grid",
      "categories" => [
        [
          "id" => "Esami",
          "name" => "Esami",
          "documents" => []
        ],
        [
          "id" => "Prove Parziali",
          "name" => "Prove Parziali",
          "documents" => []
        ]
      ]
    ];
    $index["levels"]["uni"]["subjects"][] = &$subjectRef;
  }

  
  if (!isset($subjectRef["categories"])) {
    $subjectRef["categories"] = [
      [
        "id" => "Esami",
        "name" => "Esami",
        "documents" => []
      ],
      [
        "id" => "Prove Parziali",
        "name" => "Prove Parziali",
        "documents" => []
      ]
    ];
  }

  $docData = [
    "id" => $subject . "-" . time(),
    "title" => $finalTitle,
    "type" => "PDF",
    "date" => date("Y-m-d"),
    "tags" => $tags,
    "description" => $description,
    "fileUrl" => $relativePath,
    "solutionUrl" => $solutionPath
  ];

  // Use default category if not specified
  $targetCategory = $category !== "" ? $category : "Esami";

  // Find and add to the correct category
  $added = false;
  foreach ($subjectRef["categories"] as &$categoryRef) {
    if ($categoryRef["id"] === $targetCategory) {
      $categoryRef["documents"][] = $docData;
      $added = true;
      break;
    }
  }

  // If category doesn't exist, add to Esami as default
  if (!$added) {
    foreach ($subjectRef["categories"] as &$categoryRef) {
      if ($categoryRef["id"] === "Esami") {
        $categoryRef["documents"][] = $docData;
        break;
      }
    }
  }
}

$jsonHandle = fopen($indexPath, "c+");
if (!$jsonHandle) {
  @unlink($destinationPath);
  if ($solutionDestination) {
    @unlink($solutionDestination);
  }
  echo json_encode([
    "ok" => false,
    "error" => "Impossibile salvare l'indice in " . $sectionLabel . ".\nRiprova o verifica i permessi."
  ]);
  exit;
}
if (!flock($jsonHandle, LOCK_EX)) {
  fclose($jsonHandle);
  @unlink($destinationPath);
  if ($solutionDestination) {
    @unlink($solutionDestination);
  }
  echo json_encode([
    "ok" => false,
    "error" => "Impossibile bloccare l'indice in " . $sectionLabel . ".\nRiprova tra qualche secondo."
  ]);
  exit;
}
ftruncate($jsonHandle, 0);
rewind($jsonHandle);
fwrite($jsonHandle, json_encode($index, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES));
fflush($jsonHandle);
flock($jsonHandle, LOCK_UN);
fclose($jsonHandle);

echo json_encode(["ok" => true, "message" => "Upload completato.", "path" => $relativePath], JSON_UNESCAPED_SLASHES);


function validateUploadedPdf(array $file): ?string
{
  if ($file["error"] !== UPLOAD_ERR_OK) {
    return "Errore durante l'upload.";
  }

  if ($file["size"] > 20 * 1024 * 1024) {
    return "File troppo grande.";
  }

  $originalName = $file["name"];
  $extension = strtolower(pathinfo($originalName, PATHINFO_EXTENSION));
  if ($extension !== "pdf") {
    return "Il file deve essere un PDF.";
  }

  $mimeType = $file["type"] ?? "";
  if (function_exists("finfo_open")) {
    $finfo = finfo_open(FILEINFO_MIME_TYPE);
    if ($finfo) {
      $mimeType = finfo_file($finfo, $file["tmp_name"]);
      finfo_close($finfo);
    }
  }
  if ($mimeType !== "application/pdf") {
    return "Tipo file non valido.";
  }

  return null;
}

function sanitizePdfFilename(string $name): string
{
  $safeName = preg_replace("/[^a-zA-Z0-9_-]+/", "-", pathinfo($name, PATHINFO_FILENAME));
  $safeName = trim($safeName, "-");
  if ($safeName === "") {
    $safeName = "documento";
  }
  return $safeName . ".pdf";
}

function parseTags(string $tagsRaw): array
{
  if ($tagsRaw === "") {
    return [];
  }
  // Gestisce virgole e spazi: "c, f, d,t , y" -> ["c", "f", "d", "t", "y"]
  $parts = preg_split("/[,]+/", $tagsRaw);
  if (!$parts) {
    return [];
  }
  $tags = array_map("trim", $parts);
  return array_values(array_filter($tags));
}

function findDocumentsForTarget(array $index, string $level, string $subject, string $year, string $category): array
{
  if (!isset($index["levels"][$level])) {
    return [];
  }
  if ($level === "hs") {
    foreach ($index["levels"]["hs"]["subjects"] ?? [] as $subjectItem) {
      if (($subjectItem["id"] ?? "") !== $subject) {
        continue;
      }
      foreach ($subjectItem["years"] ?? [] as $yearItem) {
        if (($yearItem["id"] ?? "") === $year) {
          return $yearItem["documents"] ?? [];
        }
      }
    }
    return [];
  }

  $targetCategory = $category !== "" ? $category : "Esami";
  foreach ($index["levels"]["uni"]["subjects"] ?? [] as $subjectItem) {
    if (($subjectItem["id"] ?? "") !== $subject) {
      continue;
    }
    foreach ($subjectItem["categories"] ?? [] as $categoryItem) {
      if (($categoryItem["id"] ?? "") === $targetCategory) {
        return $categoryItem["documents"] ?? [];
      }
    }
  }
  return [];
}

function titleExists(array $documents, string $title): bool
{
  $target = mb_strtolower(trim($title));
  foreach ($documents as $doc) {
    if (($doc["p"] ?? 1) === 0) {
      continue;
    }
    $existing = mb_strtolower(trim($doc["title"] ?? ""));
    if ($existing !== "" && $existing === $target) {
      return true;
    }
  }
  return false;
}

function findDocumentsForUniSubject(array $index, string $subject): array
{
  $docs = [];
  foreach ($index["levels"]["uni"]["subjects"] ?? [] as $subjectItem) {
    if (($subjectItem["id"] ?? "") !== $subject) {
      continue;
    }
    foreach ($subjectItem["categories"] ?? [] as $categoryItem) {
      foreach ($categoryItem["documents"] ?? [] as $doc) {
        $docs[] = $doc;
      }
    }
  }
  return $docs;
}

function filenameExistsInSubject(array $documents, string $filename): bool
{
  $target = mb_strtolower($filename);
  foreach ($documents as $doc) {
    if (($doc["p"] ?? 1) === 0) {
      continue;
    }
    $fileUrl = $doc["fileUrl"] ?? "";
    $solutionUrl = $doc["solutionUrl"] ?? "";
    $fileName = $fileUrl ? mb_strtolower(basename($fileUrl)) : "";
    $solutionName = $solutionUrl ? mb_strtolower(basename($solutionUrl)) : "";
    if ($fileName === $target || $solutionName === $target) {
      return true;
    }
  }
  return false;
}
