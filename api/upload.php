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

// Payload-Groesse begrenzen (20 MB — Beschreibungen koennen groesser sein)
$maxSize = 20 * 1024 * 1024;
$rawInput = file_get_contents('php://input', false, null, 0, $maxSize + 1);
if (strlen($rawInput) > $maxSize) {
    http_response_code(413);
    echo json_encode(["message" => "Payload zu gross (max 20 MB)"]);
    exit;
}

$data = json_decode($rawInput, true);

if (!is_array($data)) {
    http_response_code(400);
    echo json_encode(["message" => "Ungültige Daten"]);
    $conn->close();
    exit;
}

$sql = "INSERT INTO syncedBooks
            (bid, author, title, series, series_part, ebook, rating,
             note, isbn, description, date_added, ausgeliehen, borrow_name, token)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
$stmt = $conn->prepare($sql);
$inserted = 0;

foreach ($data as $book) {
    $bookId      = $book['bid']         ?? null;
    $author      = $book['author']      ?? '';
    $title       = $book['title']       ?? '';
    $series      = $book['series']      ?? '';
    $seriesPart  = $book['series_part'] ?? '';
    $ebook       = (int) ($book['ebook'] ?? 0);
    $rating      = isset($book['rating']) && $book['rating'] > 0 ? (float) $book['rating'] : 0.0;
    $note        = $book['note']        ?? '';
    $isbn        = $book['isbn']        ?? '';
    $description = $book['description'] ?? '';
    $dateAdded   = !empty($book['date_added']) ? $book['date_added'] : null;
    $ausgeliehen = $book['ausgeliehen'] ?? 'nein';
    $borrowName  = $book['borrow_name'] ?? '';

    if ($bookId && $author && $title) {
        $stmt->bind_param("issssidsssssss",
            $bookId, $author, $title, $series, $seriesPart,
            $ebook, $rating, $note, $isbn, $description,
            $dateAdded, $ausgeliehen, $borrowName, $token
        );
        $stmt->execute();
        $inserted++;
    }
}

$stmt->close();
$conn->close();
echo json_encode(["message" => "Bücher erfolgreich hochgeladen", "count" => $inserted]);
?>
