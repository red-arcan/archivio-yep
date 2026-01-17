<?php

header("Content-Type: application/json; charset=utf-8");

$allowedSubjects = require __DIR__ . "/subject_pool.php";

$level = $_POST["level"] ?? "";
$subject = $_POST["subject"] ?? "";
$year = $_POST["year"] ?? "";
$filename = $_POST["filename"] ?? "";

if (!$level || !$subject || !$filename) {
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

$extension = strtolower(pathinfo($filename, PATHINFO_EXTENSION));
if ($extension !== "pdf") {
  echo json_encode(["ok" => false, "error" => "Il file deve essere un PDF."]);
  exit;
}

$safeFilename = basename($filename);
$rootPath = dirname(__DIR__, 2);
if ($level === "hs") {
  $filePath = $rootPath . "/src/Documents/hs/" . $subject . "/" . $year . "/" . $safeFilename;
} else {
  $filePath = $rootPath . "/src/Documents/uni/" . $subject . "/" . $safeFilename;
}

$realPath = realpath($filePath);
$rootReal = realpath($rootPath);
if (!$realPath || strpos($realPath, $rootReal) !== 0) {
  echo json_encode(["ok" => false, "error" => "Percorso non valido."]);
  exit;
}

if (!file_exists($realPath)) {
  echo json_encode(["ok" => false, "error" => "File non trovato."]);
  exit;
}

if (!unlink($realPath)) {
  echo json_encode(["ok" => false, "error" => "Impossibile eliminare il file."]);
  exit;
}

$relativePath = str_replace($rootReal, "", $realPath);
$relativePath = str_replace("\\", "/", $relativePath);

$indexPath = $rootPath . "/Config/archive_index.json";
$index = file_exists($indexPath) ? json_decode(file_get_contents($indexPath), true) : ["levels" => []];
if (!is_array($index)) {
  $index = ["levels" => []];
}

if ($level === "hs") {
  foreach ($index["levels"]["hs"]["subjects"] as &$subjectItem) {
    if ($subjectItem["id"] !== $subject) {
      continue;
    }
    foreach ($subjectItem["years"] as &$yearItem) {
      if ($yearItem["id"] !== $year) {
        continue;
      }
      $documents = $yearItem["documents"] ?? [];
      $newDocs = [];
      foreach ($documents as $doc) {
        if (($doc["fileUrl"] ?? "") === $relativePath) {
          continue;
        }
        if (($doc["solutionUrl"] ?? "") === $relativePath) {
          $doc["solutionUrl"] = null;
        }
        $newDocs[] = $doc;
      }
      $yearItem["documents"] = $newDocs;
    }
  }
} else {
  foreach ($index["levels"]["uni"]["subjects"] as &$subjectItem) {
    if ($subjectItem["id"] !== $subject) {
      continue;
    }
    $documents = $subjectItem["documents"] ?? [];
    $newDocs = [];
    foreach ($documents as $doc) {
      if (($doc["fileUrl"] ?? "") === $relativePath) {
        continue;
      }
      if (($doc["solutionUrl"] ?? "") === $relativePath) {
        $doc["solutionUrl"] = null;
      }
      $newDocs[] = $doc;
    }
    $subjectItem["documents"] = $newDocs;
  }
}

file_put_contents($indexPath, json_encode($index, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES));

echo json_encode(["ok" => true, "message" => "File eliminato.", "path" => $relativePath], JSON_UNESCAPED_SLASHES);
