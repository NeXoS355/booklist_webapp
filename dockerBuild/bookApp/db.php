<?php

// Lade die Zugangsdaten
// require 'config.php';
// Verbindungsvariablen
$host = getenv('MYSQL_HOST');
$port = getenv('MYSQL_PORT');
$dbname = getenv('MYSQL_DATABASE');
$username = getenv('MYSQL_USER');
$password = getenv('MYSQL_PASSWORD');

try {
    $conn = new mysqli($host, $username, $password, $dbname);
    // Verbindung prüfen
    if ($conn->connect_error) {
        die(json_encode(["error" => "Verbindung fehlgeschlagen: " . $conn->connect_error]));
    }
} catch (PDOException $e) {
    die('Fehler bei der Datenbankverbindung: ' . $e->getMessage());
}
?>
