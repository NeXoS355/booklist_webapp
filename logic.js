        // Funktion zum Laden der Bücher basierend auf dem Token im localStorage
        async function loadBooks() {
            // Token aus dem localStorage abrufen
            const token = localStorage.getItem('token');

            if (!token) {
                document.getElementById('book-list').innerHTML = 'Kein Token im localStorage gefunden.';
                return;
            }

            // Anfrage an den Server senden, um Bücher basierend auf dem Token zu erhalten
            // Temporär gespeicherte Daten holen und in Tabelle darstellen
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
                            tableHtml += `<tr>
                                            <td>${book.author}</td>
                                            <td>${book.title}</td>
                                            <td><button onclick="deleteBook(${book.id})"><i class="fa fa-trash"></i></button></td>
                                          </tr>`;
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

            // hochgeladene Bücher abrufen und in Tabelle darstellen
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

        // Funktion zum Löschen eines spezifischen Buches
        async function deleteBook(bookId) {
            const confirmed = confirm('Möchten Sie dieses Buch wirklich löschen?');
            if (!confirmed) return;
            const token = localStorage.getItem('token');
            if (!token) {
                alert('Kein Token vorhanden. Bitte melden Sie sich erneut an.');
                return;
            }

            try {
                const response = await fetch('./api/delete.php', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                    body: new URLSearchParams({
                        'token': token,
                        'bookId': bookId
                    })
                });

                const result = await response.json();

                if (result.message) {
                    alert(result.message);
                    loadBooks(); // Tabelle aktualisieren
                } else {
                    alert('Fehler: ' + result.error);
                }
            } catch (error) {
                console.error('Fehler beim Löschen des Buches:', error);
                alert('Ein Fehler ist aufgetreten.');
            }
        }

        // Filterfunktion für die Tabelle
        document.getElementById('search').addEventListener('input', function() {
            const searchTerm = this.value.toLowerCase();
            const table = document.getElementById('syncedBooks');
            const rows = table.getElementsByTagName('tr');

            for (let i = 1; i < rows.length; i++) { // Starten ab 1, um die Kopfzeile zu überspringen
                const authorCell = rows[i].getElementsByTagName('td')[0];
                const author = authorCell.textContent.toLowerCase();
                const titleCell = rows[i].getElementsByTagName('td')[1];
                const title = titleCell.textContent.toLowerCase();
                if (author.includes(searchTerm)) {
                    rows[i].style.display = '';
                } else if (title.includes(searchTerm)) {
                    rows[i].style.display = '';
                } else {
                    rows[i].style.display = 'none';
                }
            }
        });

        // Autovervollständigung für das Autor-Feld
        document.getElementById('author').addEventListener('input', async function () {
            const query = this.value;
            const token = document.getElementById('token').value;
            if (query.length >= 4) {
                const authors = await fetchAuthors(query, token);
                const autocompleteDiv = document.getElementById('authorAutocomplete');
                autocompleteDiv.innerHTML = ''; // Autovervollständigungs-Div leeren
                if (authors.length > 0) {
                    authors.forEach(author => {
                        const div = document.createElement('div');
                        div.textContent = author;
                        div.addEventListener('click', function() {
                            document.getElementById('author').value = author;
                            autocompleteDiv.innerHTML = ''; // Autovervollständigungs-Div leeren nach Auswahl
                        });
                        autocompleteDiv.appendChild(div);
                    });
                }
            }
        });

        // Funktion zur API-Anfrage für die Autoren
        async function fetchAuthors(query, token) {
            try {
                const response = await fetch('./api/author_search.php?author=' + query + '&token=' + token);
                if (!response.ok) {
                    throw new Error('Fehler bei der API-Anfrage');
                }
                return await response.json();
            } catch (error) {
                console.error('Fehler beim Abrufen der Autoren:', error);
                return [];
            }
        }

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

        // Die Funktion aufrufen, sobald die Seite geladen wurde
        window.onload = loadBooks;

