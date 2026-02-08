<?php

/**
 * Liest den Token aus dem X-Auth-Token Header, mit Fallback auf GET/POST Parameter.
 * Prueft die Mindestlaenge (32 Zeichen). Gibt bei ungueltigem Token eine 401-Antwort
 * und beendet das Script.
 *
 * @return string - validierter Token
 */
function getToken() {
    $token = $_SERVER['HTTP_X_AUTH_TOKEN'] ?? $_GET['token'] ?? $_POST['token'] ?? '';
    $token = trim($token);

    if (strlen($token) < 32) {
        http_response_code(401);
        echo json_encode(["error" => "Ungültiger oder fehlender Token."]);
        exit;
    }

    return $token;
}
