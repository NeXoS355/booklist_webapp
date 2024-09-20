<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Buchverwaltung</title>
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <h1>Buchverwaltung</h1>

    <form action="submit.php" id="bookForm" method="POST">

        <label for="token">Token:</label>
        <input type="text" id="token" name="token" required readonly><br>

        <label for="author">Autor:</label>
        <input type="text" id="author" name="author" required><br>

        <label for="title">Titel:</label>
        <input type="text" id="title" name="title" required><br>

        <label for="series">Buchreihe:</label>
        <input type="text" id="series" name="series"><br>

        <label for="seriesPart">Teil der Buchreihe:</label>
        <input type="number" id="seriesPart" name="seriesPart"><br>

        <label for="note">Bemerkung:</label>
        <textarea id="note" name="note"></textarea><br>

        <label for="ebook">eBook:</label>
        <input type="checkbox" id="ebook" name="ebook"><br>

        <button type="submit">Buch speichern</button>
    </form>
</body>
</html>

<script>
    // Funktion zum Auslesen der URL-Parameter
    function getQueryParam(param) {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get(param);
    }

    document.addEventListener('DOMContentLoaded', function() {
        // Token aus URL-Parameter auslesen und ins Token-Feld eintragen
        const token = getQueryParam('token');
        if (token) {
            document.getElementById('token').value = token;
            // Speichern des Tokens im LocalStorage (falls benötigt)
            localStorage.setItem('token', token);
            window.location.href = './';
        }
    });


    // Beim Laden der Seite das Token aus dem LocalStorage in das Feld eintragen
    document.getElementById('token').value = localStorage.getItem('token') || '';

    // Beim Absenden des Formulars das Token im LocalStorage speichern
    document.getElementById('bookForm').addEventListener('submit', function() {
        const tokenField = document.getElementById('token');
        if (!tokenField.value) {
            // Token-Feld ist leer, Fehlermeldung anzeigen und Formular nicht absenden
            tokenField.setCustomValidity('Token darf nicht leer sein.');
            window.alert("Token darf nicht leer sein.");
            event.preventDefault(); // Verhindert das Absenden des Formulars
        } else {
            tokenField.setCustomValidity(''); // Setzt die Validierung zurück, wenn alles in Ordnung ist
            localStorage.setItem('token', document.getElementById('token').value);
        }
    });

    document.getElementById('token').value = localStorage.getItem('token')

</script>

</body>
</html>
