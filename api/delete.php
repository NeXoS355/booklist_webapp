<?php
header('Content-Type: application/json');
error_reporting(E_ALL);
ini_set('display_errors', 1);

require '../db.php';

// Überprüfe die HTTP-Methode
$method = $_SERVER['REQUEST_METHOD'];

// Bücher löschen nach Bestätigung
if ($method == 'POST' && isset($_POST['token'])) {
    $token = $_POST['token'];

    // Beginne eine Transaktion
    $conn->begin_transaction();

    try {
        // SQL-Abfrage zum Löschen der Bücher
        $delete_sql = "DELETE FROM books WHERE token = ?";
        $delete_stmt = $conn->prepare($delete_sql);
        $delete_stmt->bind_param("s", $token);
        $delete_stmt->execute();

        if ($delete_stmt->affected_rows > 0) {
            // Transaktion erfolgreich
            $conn->commit();
            echo json_encode(["message" => "Bücher erfolgreich gelöscht."]);
        } else {
            // Transaktion zurückrollen, wenn nichts gelöscht wurde
            $conn->rollback();
            echo json_encode(["message" => "Keine Bücher zum Löschen gefunden."]);
        }
    } catch (Exception $e) {
        // Bei einem Fehler: Transaktion zurückrollen
        $conn->rollback();
        echo json_encode(["error" => "Fehler beim Löschen der Bücher: " . $e->getMessage()]);
    }
} else {
    echo json_encode(["error" => "Ungültige Anfrage"]);
}

$conn->close();
?>
