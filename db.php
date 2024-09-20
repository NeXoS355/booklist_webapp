<?php
$host = 'localhost';
$dbname = 'bookApp';
$username = '<yourUser>';
$password = '<yourPassword>';

try {
//    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8", $username, $password);
//    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $conn = new mysqli($host, $username, $password, $dbname);
    // Verbindung prüfen
    if ($conn->connect_error) {
        die(json_encode(["error" => "Verbindung fehlgeschlagen: " . $conn->connect_error]));
    }
} catch (PDOException $e) {
    die('Fehler bei der Datenbankverbindung: ' . $e->getMessage());
}
?>
