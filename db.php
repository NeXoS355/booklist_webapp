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
        error_log("DB-Verbindung fehlgeschlagen: " . $conn->connect_error);
        die(json_encode(["error" => "Datenbankverbindung fehlgeschlagen."]));
    }
} catch (PDOException $e) {
    error_log("DB-Verbindung fehlgeschlagen: " . $e->getMessage());
    die(json_encode(["error" => "Datenbankverbindung fehlgeschlagen."]));
}
?>
