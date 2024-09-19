<?php
header('Content-Type: application/json');
error_reporting(E_ALL);
ini_set('display_errors', 1);

require 'db.php';

// Überprüfe die HTTP-Methode
$method = $_SERVER['REQUEST_METHOD'];

// Überprüfen, welcher Endpunkt aufgerufen wurde
if ($method == 'GET' && isset($_GET['token'])) {
    // Daten für einen bestimmten Token abrufen
    $token = $_GET['token'];

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

    // Antwort als JSON zurückgeben
    echo json_encode($books);
} else {
    echo json_encode(["error" => "Ungültige Anfrage"]);
}

// Verbindung schließen
$pdo->close();
?>
