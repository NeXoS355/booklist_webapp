<?php
header('Content-Type: application/json');
error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('log_errors', 1);

require '../db.php';
require '../auth.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(["message" => "Nur POST erlaubt"]);
    exit;
}

$token = getToken();

// Payload-Groesse begrenzen (5 MB)
$maxSize = 5 * 1024 * 1024;
$rawInput = file_get_contents('php://input', false, null, 0, $maxSize + 1);
if (strlen($rawInput) > $maxSize) {
    http_response_code(413);
    echo json_encode(["message" => "Payload zu gross (max 5 MB)"]);
    exit;
}

$data = json_decode($rawInput, true);

if (!is_array($data)) {
    http_response_code(400);
    echo json_encode(["message" => "Ungültige Daten"]);
    $conn->close();
    exit;
}

$sql = "INSERT INTO syncedBooks (bid, author, title, series, token) VALUES (?, ?, ?, ?, ?)";
$stmt = $conn->prepare($sql);
$inserted = 0;

foreach ($data as $book) {
    $bookId = $book['bid'] ?? null;
    $author = $book['author'] ?? '';
    $title = $book['title'] ?? '';
    $series = $book['series'] ?? '';

    if ($bookId && $author && $title) {
        $stmt->bind_param("issss", $bookId, $author, $title, $series, $token);
        $stmt->execute();
        $inserted++;
    }
}

$stmt->close();
$conn->close();
echo json_encode(["message" => "Bücher erfolgreich hochgeladen", "count" => $inserted]);
?>
