<?php
header('Content-Type: application/json');
error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('log_errors', 1);

require '../db.php';
require '../auth.php';

// Überprüfe die HTTP-Methode
$method = $_SERVER['REQUEST_METHOD'];

// Bücher nur abrufen
if ($method == 'GET') {
    $token = getToken();

    // SQL-Abfrage vorbereiten
    $sql = "SELECT * FROM books WHERE token = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("s", $token);
    $stmt->execute();
    $result = $stmt->get_result();

    $books = [];

    // Daten in ein Array speichern
    while ($row = $result->fetch_assoc()) {
        $books[] = $row;
    }

    if (!empty($books)) {
        echo json_encode($books);
    } else {
        echo json_encode(["message" => "Keine Bücher für diesen Token gefunden."]);
    }
} else {
    echo json_encode(["error" => "Ungültige Anfrage"]);
}

$conn->close();
?>
