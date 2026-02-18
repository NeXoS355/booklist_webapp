<?php
header('Content-Type: application/json');
error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('log_errors', 1);

require '../db.php';
require '../auth.php';

// Überprüfen, ob der Parameter 'series' in der URL vorhanden ist
if (isset($_GET['series']) && !empty($_GET['series'])) {
    $searchTerm = $_GET['series'];
    $token = getToken();

    // SQL-Abfrage: Buchreihen suchen, die dem Suchbegriff ähneln
    $stmt = $conn->prepare("SELECT DISTINCT series FROM syncedBooks WHERE token = ? AND series LIKE ? AND series != '' LIMIT 10");
    $likeTerm = $searchTerm . "%";
    $stmt->bind_param("ss", $token, $likeTerm);
    $stmt->execute();
    $result = $stmt->get_result();

    $seriesList = [];

    // Ergebnisse sammeln
    while ($row = $result->fetch_assoc()) {
        $seriesList[] = $row['series'];
    }

    // JSON-Ausgabe der Ergebnisse
    echo json_encode($seriesList);

    $stmt->close();
} else {
    // Leere Antwort zurückgeben, wenn kein Suchbegriff übergeben wurde
    echo json_encode([]);
}

// Datenbankverbindung schließen
$conn->close();
?>
