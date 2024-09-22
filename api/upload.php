<?php
header('Content-Type: application/json');
require '../db.php';

// POST-Daten empfangen
$token = $_GET['token'] ?? '';

if (!$token) {
    echo json_encode(["message" => "Kein Token vorhanden"]);
    exit;
}

// POST-Daten empfangen (JSON-Daten von der Java-Anwendung)
$data = json_decode(file_get_contents('php://input'), true);

if (is_array($data)) {
    foreach ($data as $book) {
        // Extrahiere Buch-ID, Autor und Titel aus dem JSON
        $bookId = $book['bid'] ?? null;
        $author = $book['author'] ?? '';
        $title = $book['title'] ?? '';

        // Überprüfen, ob die Felder nicht leer sind
        if ($bookId && $author && $title) {
            // SQL-Abfrage zum Einfügen der Buchdaten vorbereiten
            $sql = "INSERT INTO syncedBooks (bid, author, title, token) VALUES (?, ?, ?, ?)";
            $stmt = $conn->prepare($sql);
            $stmt->bind_param("isss", $bookId, $author, $title, $token);
            $stmt->execute();
            $stmt->close();
        }
    }
    echo json_encode(["message" => "Bücher erfolgreich hochgeladen"]);
} else {
    echo json_encode(["message" => "Ungültige Daten"]);
}

$conn->close();
?>
