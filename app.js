// Funktion zum Laden der Bücher basierend auf dem Token im localStorage
async function loadBooks() {
    // Token aus dem localStorage abrufen
    const token = localStorage.getItem('token');

    if (!token) {
        document.getElementById('book-list').textContent = 'Kein Token im localStorage gefunden.';
        return;
    }

    // Anfrage an den Server senden, um Bücher basierend auf dem Token zu erhalten
    // Temporär gespeicherte Daten holen und in Tabelle darstellen
    try {
        const response = await fetch('./api/get.php', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'X-Auth-Token': token,
            }
        });

        if (response.ok) {
            const books = await response.json();

            if (books.length > 0) {
                // Bücher in einer Tabelle darstellen
                const table = document.createElement('table');
                table.setAttribute('border', '1');
                table.setAttribute('cellpadding', '10');
                const headerRow = table.insertRow();
                headerRow.insertCell().textContent = 'Autor';
                headerRow.insertCell().textContent = 'Titel';
                headerRow.cells[0].outerHTML = '<th>Autor</th>';
                headerRow.cells[0].outerHTML = '<th>Titel</th>';
                books.forEach(book => {
                    const row = table.insertRow();
                    row.insertCell().textContent = book.author;
                    row.insertCell().textContent = book.title;
                    const btnCell = row.insertCell();
                    const btn = document.createElement('button');
                    btn.addEventListener('click', () => deleteBook(book.id));
                    const icon = document.createElement('i');
                    icon.className = 'fa fa-trash';
                    btn.appendChild(icon);
                    btnCell.appendChild(btn);
                });

                const savedBooksDiv = document.getElementById('savedBooks');
                savedBooksDiv.textContent = '';
                savedBooksDiv.appendChild(table);
            } else {
                document.getElementById('savedBooks').textContent = 'Keine Bücher für diesen Token gefunden.';
            }
        } else {
            document.getElementById('savedBooks').textContent = 'Fehler beim Abrufen der Bücher.';
        }
    } catch (error) {
        console.error('Fehler beim Laden der Bücher:', error);
        document.getElementById('savedBooks').textContent = 'Ein Fehler ist aufgetreten.';
    }

    // hochgeladene Bücher abrufen und in Tabelle darstellen
    try {
        const response = await fetch('./api/getSynced.php', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'X-Auth-Token': token,
            }
        });

        if (response.ok) {
            const books = await response.json();

            if (books.length > 0) {
                // Bücher in einer Tabelle darstellen
                const table = document.createElement('table');
                table.setAttribute('border', '1');
                table.setAttribute('cellpadding', '10');
                const headerRow = table.insertRow();
                headerRow.insertCell().textContent = 'Autor';
                headerRow.insertCell().textContent = 'Titel';
                headerRow.cells[0].outerHTML = '<th>Autor</th>';
                headerRow.cells[0].outerHTML = '<th>Titel</th>';
                books.forEach(book => {
                    const row = table.insertRow();
                    row.insertCell().textContent = book.author;
                    row.insertCell().textContent = book.title;
                });

                const syncedBooksDiv = document.getElementById('syncedBooks');
                syncedBooksDiv.textContent = '';
                syncedBooksDiv.appendChild(table);
            } else {
                document.getElementById('syncedBooks').textContent = 'Keine Bücher für diesen Token gefunden.';
            }
        } else {
            document.getElementById('syncedBooks').textContent = 'Fehler beim Abrufen der Bücher.';
        }
    } catch (error) {
        console.error('Fehler beim Laden der Bücher:', error);
        document.getElementById('syncedBooks').textContent = 'Ein Fehler ist aufgetreten.';
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
                'X-Auth-Token': token,
            },
            body: new URLSearchParams({
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

// Funktion zur API-Anfrage für die Autoren
async function fetchAuthors(query, token) {
    try {
        const response = await fetch('./api/author_search.php?author=' + encodeURIComponent(query), {
            headers: { 'X-Auth-Token': token }
        });
        if (!response.ok) {
            throw new Error('Fehler bei der API-Anfrage');
        }
        return await response.json();
    } catch (error) {
        console.error('Fehler beim Abrufen der Autoren:', error);
        return [];
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

// EventListeners
// Autovervollständigung für das Autor-Feld
document.getElementById('author').addEventListener('input', async function () {
    const query = this.value;
    const token = document.getElementById('token').value;
    if (query.length >= 4) {
        const authors = await fetchAuthors(query, token);
        const autocompleteDiv = document.getElementById('authorAutocomplete');
        autocompleteDiv.textContent = ''; // Autovervollständigungs-Div leeren
        if (authors.length > 0) {
            authors.forEach(author => {
                const div = document.createElement('div');
                div.textContent = author;
                div.addEventListener('click', function() {
                    document.getElementById('author').value = author;
                    autocompleteDiv.textContent = ''; // Autovervollständigungs-Div leeren nach Auswahl
                });
                autocompleteDiv.appendChild(div);
            });
        }
    }
});

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

// Beim Absenden des Formulars das Token im LocalStorage speichern
document.getElementById('bookForm').addEventListener('submit', function(event) {
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

// Beim Laden der Seite das Token aus dem LocalStorage in das Feld eintragen
document.getElementById('token').value = localStorage.getItem('token') || '';
// Die Funktion aufrufen, sobald die Seite geladen wurde
window.onload = loadBooks;
