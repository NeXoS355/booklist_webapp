<?php
error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('log_errors', 1);

// ISBN validieren (nur Ziffern, 10 oder 13 Stellen)
$isbn = preg_replace('/[^0-9]/', '', $_GET['isbn'] ?? '');
if (strlen($isbn) < 10 || strlen($isbn) > 13) {
    http_response_code(400);
    exit;
}

$imageData = null;

$ctx = stream_context_create(['http' => [
    'timeout'         => 5,
    'follow_location' => 1,
    'user_agent'      => 'BooklistApp/1.0',
]]);

// 1. Open Library Medium-Cover
$olUrl     = 'https://covers.openlibrary.org/b/isbn/' . $isbn . '-M.jpg';
$imageData = @file_get_contents($olUrl, false, $ctx);

// 2. Fallback: Google Books (zoom=0 fuer groesseres Bild als Standard-Thumbnail)
if (!$imageData || strlen($imageData) < 1000) {
    $googleApiUrl = 'https://www.googleapis.com/books/v1/volumes?q=isbn:' . $isbn
        . '&fields=items/volumeInfo/imageLinks/thumbnail&maxResults=1';
    $json = @file_get_contents($googleApiUrl, false, $ctx);
    if ($json) {
        $data  = json_decode($json, true);
        $thumb = $data['items'][0]['volumeInfo']['imageLinks']['thumbnail'] ?? null;
        if ($thumb) {
            // zoom=1 (Thumbnail) auf zoom=0 (groesseres Bild) hochsetzen
            $thumbUrl  = str_replace('http://', 'https://', $thumb);
            $thumbUrl  = str_replace('&edge=curl', '', $thumbUrl);
            $thumbUrl  = preg_replace('/&zoom=\d+/', '&zoom=0', $thumbUrl);
            $imageData = @file_get_contents($thumbUrl, false, $ctx);
        }
    }
}

// Kein Cover gefunden oder zu klein (Open Library 1x1px-Platzhalter)
if (!$imageData || strlen($imageData) < 1000) {
    http_response_code(404);
    exit;
}

// MIME-Typ prüfen
$finfo    = new finfo(FILEINFO_MIME_TYPE);
$mimeType = $finfo->buffer($imageData);
if (!in_array($mimeType, ['image/jpeg', 'image/png', 'image/gif', 'image/webp'])) {
    http_response_code(404);
    exit;
}

// Bild ausliefern (1 Woche cachen)
header('Content-Type: ' . $mimeType);
header('Cache-Control: public, max-age=604800, immutable');
header('Content-Length: ' . strlen($imageData));
echo $imageData;
