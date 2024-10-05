<?php

// Lade die Zugangsdaten
require 'config.php';

// Verbindungsvariablen
$host = $dbCredentials['host'];
$dbname = $dbCredentials['name'];
$username = $dbCredentials['user'];
$password = $dbCredentials['pass'];

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
