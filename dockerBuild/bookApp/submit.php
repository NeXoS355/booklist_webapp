<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

require 'db.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $author = $_POST['author'];
    $title = $_POST['title'];
    $series = isset($_POST['series']) ? $_POST['series'] : null;
    $seriesPart = isset($_POST['seriesPart']) ? $_POST['seriesPart'] : null;
    $note = isset($_POST['note']) ? $_POST['note'] : null;
    $ebook = isset($_POST['ebook']) ? 1 : 0;
    $token = $_POST['token'];

    // SQL-Abfrage vorbereiten
    $sql = "INSERT INTO books (author, title, series, series_part, note, ebook, token) VALUES (?, ?, ?, ?, ?, ?, ?)";
    $stmt = $conn->prepare($sql);

    // Überprüfen, ob das Statement erfolgreich vorbereitet wurde
    if ($stmt === false) {
        die("Fehler beim Vorbereiten des Statements: " . $conn->error);
    }

    // Parameter binden und das Statement ausführen
    $stmt->bind_param("sssisis", $author, $title, $series, $seriesPart, $note, $ebook, $token);

    if ($stmt->execute()) {
        // Erfolgreiche Speicherung
    } else {
        // Fehler bei der Ausführung
        echo "Fehler beim Speichern der Daten: " . $stmt->error;
    }
    // Verbindung schließen
    $stmt->close();
    $conn->close();
    echo "<script type='text/javascript'>alert('Buch erfolgreich gespeichert!');window.location.replace('../');</script>";
} else {
    echo 'Ungültige Anfrage.';
}
?>
