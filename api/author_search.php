<?php
header('Content-Type: application/json');
error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('log_errors', 1);

require '../db.php';
require '../auth.php';

// Überprüfen, ob der Parameter 'author' in der URL vorhanden ist
if (isset($_GET['author']) && !empty($_GET['author'])) {
    $searchTerm = $_GET['author'];
    $token = getToken();

    // SQL-Abfrage: Autoren suchen, die dem Suchbegriff ähneln (zum Beispiel mit LIKE)
    $stmt = $conn->prepare("SELECT DISTINCT author FROM syncedBooks WHERE token = ? AND author LIKE ? LIMIT 10");
    $likeTerm = $searchTerm . "%";
    $stmt->bind_param("ss", $token, $likeTerm);
    $stmt->execute();
    $result = $stmt->get_result();

    $authors = [];

    // Ergebnisse sammeln
    while ($row = $result->fetch_assoc()) {
        $authors[] = $row['author'];
    }

    // JSON-Ausgabe der Ergebnisse
    echo json_encode($authors);

    $stmt->close();
} else {
    // Leere Antwort zurückgeben, wenn kein Suchbegriff übergeben wurde
    echo json_encode([]);
}

// Datenbankverbindung schließen
$conn->close();
?>
