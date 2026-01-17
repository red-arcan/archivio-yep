<?php

header("Content-Type: application/json; charset=utf-8");

$allowedSubjects = require __DIR__ . "/subject_pool.php";

$level = $_POST["level"] ?? "";
$subject = $_POST["subject"] ?? "";
$year = $_POST["year"] ?? "";
$title = trim($_POST["title"] ?? "");

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

$file = $_FILES["file"];
if ($file["error"] !== UPLOAD_ERR_OK) {
  echo json_encode(["ok" => false, "error" => "Errore durante l'upload."]);
  exit;
}

$fileError = validateUploadedPdf($file);
if ($fileError) {
  echo json_encode(["ok" => false, "error" => $fileError]);
  exit;
}

$safeFilename = sanitizePdfFilename($file["name"]);
$safeName = pathinfo($safeFilename, PATHINFO_FILENAME);

$rootPath = dirname(__DIR__, 2);
if ($level === "hs") {
  $destinationDir = $rootPath . "/src/Documents/hs/" . $subject . "/" . $year;
} else {
  $destinationDir = $rootPath . "/src/Documents/uni/" . $subject;
}

if (!is_dir($destinationDir)) {
  mkdir($destinationDir, 0775, true);
}

$destinationPath = $destinationDir . "/" . $safeFilename;
if (!move_uploaded_file($file["tmp_name"], $destinationPath)) {
  echo json_encode(["ok" => false, "error" => "Salvataggio file non riuscito."]);
  exit;
}

$solutionPath = null;
if (!empty($_FILES["solution"]["name"])) {
  $solutionFile = $_FILES["solution"];
  $solutionError = validateUploadedPdf($solutionFile);
  if ($solutionError) {
    echo json_encode(["ok" => false, "error" => "Soluzione: " . $solutionError]);
    exit;
  }

  $solutionFilename = sanitizePdfFilename($solutionFile["name"]);
  $solutionDestination = $destinationDir . "/" . $solutionFilename;
  if (!move_uploaded_file($solutionFile["tmp_name"], $solutionDestination)) {
    echo json_encode(["ok" => false, "error" => "Salvataggio soluzione non riuscito."]);
    exit;
  }

  $solutionPath = str_replace($rootPath, "", $solutionDestination);
  $solutionPath = str_replace("\\", "/", $solutionPath);
}

$relativePath = str_replace($rootPath, "", $destinationPath);
$relativePath = str_replace("\\", "/", $relativePath);

$indexPath = $rootPath . "/Config/archive_index.json";
$index = file_exists($indexPath) ? json_decode(file_get_contents($indexPath), true) : ["levels" => []];
if (!is_array($index)) {
  $index = ["levels" => []];
}

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
    "title" => $title !== "" ? $title : $safeName,
    "type" => "PDF",
    "date" => date("Y-m-d"),
    "tags" => [],
    "description" => "",
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
      "documents" => []
    ];
    $index["levels"]["uni"]["subjects"][] = &$subjectRef;
  }

  $subjectRef["documents"][] = [
    "id" => $subject . "-" . time(),
    "title" => $title !== "" ? $title : $safeName,
    "type" => "PDF",
    "date" => date("Y-m-d"),
    "tags" => [],
    "description" => "",
    "fileUrl" => $relativePath,
    "solutionUrl" => $solutionPath
  ];
}

file_put_contents($indexPath, json_encode($index, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES));

echo json_encode(["ok" => true, "message" => "Upload completato.", "path" => $relativePath], JSON_UNESCAPED_SLASHES);
