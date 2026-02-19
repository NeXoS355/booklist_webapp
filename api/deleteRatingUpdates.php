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

$token = getToken();

$stmt = $conn->prepare("DELETE FROM ratingUpdates WHERE token = ?");
$stmt->bind_param("s", $token);
$stmt->execute();
$deleted = $stmt->affected_rows;
$stmt->close();
$conn->close();

echo json_encode(["message" => "Rating-Updates geloescht", "count" => $deleted]);
?>
