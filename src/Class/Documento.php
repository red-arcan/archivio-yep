<?php

class Documento
{
  public string $id;
  public string $title;
  public string $type;
  public string $date;
  public array $tags;
  public string $description;
  public string $fileUrl;
  public ?string $solutionUrl;
  public ?string $yearId;
  public ?string $yearName;

  public function __construct(array $data)
  {
    $this->id = $data["id"];
    $this->title = $data["title"];
    $this->type = $data["type"];
    $this->date = $data["date"];
    $this->tags = $data["tags"] ?? [];
    $this->description = $data["description"] ?? "";
    $this->fileUrl = $data["fileUrl"];
    $this->solutionUrl = $data["solutionUrl"] ?? null;
    $this->yearId = $data["yearId"] ?? null;
    $this->yearName = $data["yearName"] ?? null;
  }

  public function toArray(): array
  {
    return [
      "id" => $this->id,
      "title" => $this->title,
      "type" => $this->type,
      "date" => $this->date,
      "tags" => $this->tags,
      "description" => $this->description,
      "fileUrl" => $this->fileUrl,
      "solutionUrl" => $this->solutionUrl,
      "yearId" => $this->yearId,
      "yearName" => $this->yearName
    ];
  }
}
