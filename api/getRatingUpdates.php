<?php
header('Content-Type: application/json');
error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('log_errors', 1);

require '../db.php';
require '../auth.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(["error" => "Nur GET erlaubt"]);
    exit;
}

$token = getToken();

$stmt = $conn->prepare("SELECT bid, rating FROM ratingUpdates WHERE token = ?");
$stmt->bind_param("s", $token);
$stmt->execute();
$result = $stmt->get_result();

$updates = [];
while ($row = $result->fetch_assoc()) {
    $updates[] = [
        "bid"    => (int)   $row['bid'],
        "rating" => (float) $row['rating'],
    ];
}

$stmt->close();
$conn->close();

echo json_encode($updates);
?>
