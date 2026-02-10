<?php
error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('log_errors', 1);

require 'db.php';
require 'auth.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $token = getToken();
    $author = $_POST['author'];
    $title = $_POST['title'];
    $series = isset($_POST['series']) ? $_POST['series'] : null;
    $seriesPart = isset($_POST['seriesPart']) ? $_POST['seriesPart'] : null;
    $note = isset($_POST['note']) ? $_POST['note'] : null;
    $ebook = isset($_POST['ebook']) ? 1 : 0;

    // SQL-Abfrage vorbereiten
    $sql = "INSERT INTO books (author, title, series, series_part, note, ebook, token) VALUES (?, ?, ?, ?, ?, ?, ?)";
    $stmt = $conn->prepare($sql);

    // Überprüfen, ob das Statement erfolgreich vorbereitet wurde
    if ($stmt === false) {
        error_log("Fehler beim Vorbereiten des Statements: " . $conn->error);
        die("Fehler beim Verarbeiten der Anfrage.");
    }

    // Parameter binden und das Statement ausführen
    $stmt->bind_param("sssisis", $author, $title, $series, $seriesPart, $note, $ebook, $token);

    if ($stmt->execute()) {
        $stmt->close();
        $conn->close();
        header('Location: /');
        exit;
    } else {
        error_log("Fehler beim Speichern der Daten: " . $stmt->error);
        $stmt->close();
        $conn->close();
        die("Fehler beim Speichern der Daten.");
    }
} else {
    echo 'Ungültige Anfrage.';
}
?>
