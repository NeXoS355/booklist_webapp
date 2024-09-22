<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Buchverwaltung</title>
    <link rel="stylesheet" href="styles.css">
    <link rel="icon" type="image/png" href="favicon.png">
    <link rel="apple-touch-icon" type="image/png" href="favicon_apple.png">
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

        <br>
        <button type="submit">Buch speichern</button>
        <br><br>

        <b><label for="savedBooks">zwischengespeicherte Bücher:</label></b>
        <div id="savedBooks">Lade Bücher...</div><br>

        <b><label for="syncedBooks">Bücherliste:</label></b>
        <input type="text" id="search" name="search">
        <div id="syncedBooks">Lade Bücher...</div>

        <script>
        // Funktion zum Laden der Bücher basierend auf dem Token im localStorage
        async function loadBooks() {
            // Token aus dem localStorage abrufen
            const token = localStorage.getItem('token');

            if (!token) {
                document.getElementById('book-list').innerHTML = 'Kein Token im localStorage gefunden.';
                return;
            }

            // Anfrage an den Server senden, um Bücher basierend auf dem Token zu erhalten
            try {
                const response = await fetch('./api/get.php?token=' + token, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    }
                });

                if (response.ok) {
                    const books = await response.json();

                    if (books.length > 0) {
                        // Bücher in einer Tabelle darstellen
                        let tableHtml = '<table border="1" cellpadding="10"><tr><th>Autor</th><th>Titel</th></tr>';
                        books.forEach(book => {
                            tableHtml += `<tr><td>${book.author}</td><td>${book.title}</td></tr>`;
                        });
                        tableHtml += '</table>';

                        document.getElementById('savedBooks').innerHTML = tableHtml;
                    } else {
                        document.getElementById('savedBooks').innerHTML = 'Keine Bücher für diesen Token gefunden.';
                    }
                } else {
                    document.getElementById('savedBooks').innerHTML = 'Fehler beim Abrufen der Bücher.';
                }
            } catch (error) {
                console.error('Fehler beim Laden der Bücher:', error);
                document.getElementById('savedBooks').innerHTML = 'Ein Fehler ist aufgetreten.';
            }

            try {
                const response = await fetch('./api/getSynced.php?token=' + token, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    }
                });

                if (response.ok) {
                    const books = await response.json();

                    if (books.length > 0) {
                        // Bücher in einer Tabelle darstellen
                        let tableHtml = '<table border="1" cellpadding="10"><tr><th>Autor</th><th>Titel</th></tr>';
                        books.forEach(book => {
                            tableHtml += `<tr><td>${book.author}</td><td>${book.title}</td></tr>`;
                        });
                        tableHtml += '</table>';

                        document.getElementById('syncedBooks').innerHTML = tableHtml;
                    } else {
                        document.getElementById('syncedBooks').innerHTML = 'Keine Bücher für diesen Token gefunden.';
                    }
                } else {
                    document.getElementById('syncedBooks').innerHTML = 'Fehler beim Abrufen der Bücher.';
                }
            } catch (error) {
                console.error('Fehler beim Laden der Bücher:', error);
                document.getElementById('syncedBooks').innerHTML = 'Ein Fehler ist aufgetreten.';
            }
        }

        // Die Funktion aufrufen, sobald die Seite geladen wurde
        window.onload = loadBooks;
    </script>

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
