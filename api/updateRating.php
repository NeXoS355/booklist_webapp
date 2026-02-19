<?php
header('Content-Type: application/json');
error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('log_errors', 1);

require '../db.php';
require '../auth.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(["error" => "Nur POST erlaubt"]);
    exit;
}

$token  = getToken();
$bid    = isset($_POST['bid'])    ? (int) $_POST['bid']       : 0;
$rating = isset($_POST['rating']) ? (float) $_POST['rating']  : -1;

// Validierung
if ($bid <= 0) {
    http_response_code(400);
    echo json_encode(["error" => "Ungueltige bid"]);
    $conn->close();
    exit;
}
if ($rating < 0.5 || $rating > 5.0) {
    http_response_code(400);
    echo json_encode(["error" => "Bewertung muss zwischen 0.5 und 5.0 liegen"]);
    $conn->close();
    exit;
}
// Auf 0.5-Schritte runden
$rating = round($rating * 2) / 2;

// Pruefen ob das Buch diesem Token gehoert
$check = $conn->prepare("SELECT bid FROM syncedBooks WHERE token = ? AND bid = ?");
$check->bind_param("si", $token, $bid);
$check->execute();
$check->store_result();
if ($check->num_rows === 0) {
    http_response_code(403);
    echo json_encode(["error" => "Buch nicht gefunden"]);
    $check->close();
    $conn->close();
    exit;
}
$check->close();

// Upsert: neueste Bewertung speichern
$stmt = $conn->prepare(
    "INSERT INTO ratingUpdates (token, bid, rating)
     VALUES (?, ?, ?)
     ON DUPLICATE KEY UPDATE rating = VALUES(rating), created_at = CURRENT_TIMESTAMP"
);
$stmt->bind_param("sid", $token, $bid, $rating);
$stmt->execute();
$stmt->close();
$conn->close();

echo json_encode(["success" => true]);
?>
