<?php

session_start();
header("Content-Type: application/json; charset=utf-8");

require_once __DIR__ . "/GestoreDocumenti.php";

$config = require __DIR__ . "/../../Config/configKey.php";
$indexPath = __DIR__ . "/../../Config/archive_index.json";
$gestore = new GestoreDocumenti($indexPath);

$action = $_GET["action"] ?? $_POST["action"] ?? "";

function respond(array $payload, int $status = 200): void
{
  http_response_code($status);
  echo json_encode($payload, JSON_UNESCAPED_SLASHES);
  exit;
}

function isLoggedIn(): bool
{
  return !empty($_SESSION["admin"]);
}

function deleteFileIfExists(string $rootPath, ?string $url): void
{
  if (!$url) {
    return;
  }
  $filePath = $rootPath . DIRECTORY_SEPARATOR . ltrim($url, "/");
  $realPath = realpath($filePath);
  $rootReal = realpath($rootPath);
  if ($realPath && $rootReal && strpos($realPath, $rootReal) === 0 && file_exists($realPath)) {
    @unlink($realPath);
  }
}

switch ($action) {
  case "subjects":
    $levels = $gestore->getSubjectsSummary();
    respond(["success" => true, "levels" => $levels]);
    break;
  case "documents":
    $level = $_GET["level"] ?? "hs";
    $subjectId = $_GET["subject"] ?? "";
    $data = $gestore->getSubjectData($level, $subjectId);
    if (!$data) {
      respond(["success" => false, "message" => "Materia non trovata."], 404);
    }
    respond(["success" => true] + $data);
    break;
  case "login":
    $username = $_POST["username"] ?? "";
    $password = $_POST["password"] ?? "";
    $hash = $config["password_hash"] ?? "";
    if ($username === ($config["username"] ?? "") && $hash !== "" && password_verify($password, $hash)) {
      $_SESSION["admin"] = true;
      respond(["success" => true]);
    }
    respond(["success" => false, "message" => "Credenziali non valide."], 401);
    break;
  case "logout":
    $_SESSION = [];
    session_destroy();
    respond(["success" => true]);
    break;
  case "status":
    respond(["success" => true, "loggedIn" => isLoggedIn()]);
    break;
  case "add":
    if (!isLoggedIn()) {
      respond(["success" => false, "message" => "Non autorizzato."], 403);
    }
    $result = $gestore->addDocument($_POST);
    if (!$result["success"]) {
      respond($result, 400);
    }
    respond($result);
    break;
  case "remove":
    if (!isLoggedIn()) {
      respond(["success" => false, "message" => "Non autorizzato."], 403);
    }
    $level = $_POST["level"] ?? "";
    $subjectId = $_POST["subjectId"] ?? "";
    $docId = $_POST["docId"] ?? "";
    
    // Rimuove dal JSON
    $result = $gestore->removeDocument($level, $subjectId, $docId);
    if (!$result["success"]) {
      respond($result, 400);
    }
    
    // Elimina i file fisici (stessa logica di delete_file.php)
    $rootPath = dirname(__DIR__, 2);
    $fileUrl = $result["fileUrl"] ?? null;
    $solutionUrl = $result["solutionUrl"] ?? null;
    
    deleteFileIfExists($rootPath, $fileUrl);
    deleteFileIfExists($rootPath, $solutionUrl);
    
    respond($result);
    break;
  case "removeById":
    if (!isLoggedIn()) {
      respond(["success" => false, "message" => "Non autorizzato."], 403);
    }
    $docId = $_POST["docId"] ?? "";
    if (!$docId) {
      respond(["success" => false, "message" => "ID documento mancante."], 400);
    }
    $result = $gestore->removeDocumentById($docId);
    if (!$result["success"]) {
      respond($result, 404);
    }

    $rootPath = dirname(__DIR__, 2);
    deleteFileIfExists($rootPath, $result["fileUrl"] ?? null);
    deleteFileIfExists($rootPath, $result["solutionUrl"] ?? null);

    respond($result);
    break;
  default:
    respond(["success" => false, "message" => "Azione non valida."], 400);
}
