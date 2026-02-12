// =============================================
// BUCHVERWALTUNG — App Logic
// =============================================

// --- Toast Notifications ---
function showToast(message, type = 'success') {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = 'toast toast--' + type;
    toast.textContent = message;
    container.appendChild(toast);

    setTimeout(function () {
        toast.classList.add('toast--hiding');
        toast.addEventListener('animationend', function () {
            toast.remove();
        });
    }, 3000);
}

// --- Token Indicator ---
function updateTokenIndicator() {
    const token = localStorage.getItem('token');
    const indicator = document.getElementById('tokenIndicator');
    indicator.textContent = '';

    const dot = document.createElement('span');
    const text = document.createElement('span');

    if (token && token.length >= 4) {
        dot.className = 'token-dot token-dot--active';
        text.textContent = 'Token: \u2731\u2731\u2731\u2731' + token.slice(-4);
        indicator.appendChild(dot);
        indicator.appendChild(text);

        var copyBtn = document.createElement('button');
        copyBtn.type = 'button';
        copyBtn.className = 'btn-token-copy';
        copyBtn.title = 'Token kopieren';
        var copyIcon = document.createElement('i');
        copyIcon.className = 'fa fa-clipboard';
        copyBtn.appendChild(copyIcon);
        copyBtn.addEventListener('click', function () {
            navigator.clipboard.writeText(token).then(function () {
                showToast('Token kopiert!', 'success');
            }).catch(function () {
                showToast('Kopieren fehlgeschlagen.', 'error');
            });
        });
        indicator.appendChild(copyBtn);
    } else {
        dot.className = 'token-dot';
        text.textContent = 'Kein Token';
        indicator.appendChild(dot);
        indicator.appendChild(text);

        var setup = document.createElement('div');
        setup.className = 'token-setup';
        var input = document.createElement('input');
        input.type = 'text';
        input.placeholder = 'Token einfügen\u2026';
        var saveBtn = document.createElement('button');
        saveBtn.type = 'button';
        saveBtn.className = 'btn-token-save';
        var saveIcon = document.createElement('i');
        saveIcon.className = 'fa fa-check';
        saveBtn.appendChild(saveIcon);
        saveBtn.addEventListener('click', function () {
            var val = input.value.trim();
            if (val.length >= 32) {
                localStorage.setItem('token', val);
                document.getElementById('token').value = val;
                updateTokenIndicator();
                loadBooks();
                showToast('Token gespeichert!', 'success');
            } else {
                showToast('Token muss mindestens 32 Zeichen lang sein.', 'error');
            }
        });
        setup.appendChild(input);
        setup.appendChild(saveBtn);
        indicator.appendChild(setup);
    }
}

// --- Helper: Tabelle mit Kopfzeile erstellen ---
function createBookTable(columns) {
    const table = document.createElement('table');
    table.className = 'book-table';
    const thead = table.createTHead();
    const headerRow = thead.insertRow();
    columns.forEach(function (col) {
        const th = document.createElement('th');
        th.textContent = col.label || '';
        if (col.className) th.className = col.className;
        headerRow.appendChild(th);
    });
    table.createTBody();
    return table;
}

// --- Buecher laden ---
async function loadBooks() {
    const token = localStorage.getItem('token');

    if (!token) {
        document.getElementById('savedBooks').textContent = '';
        document.getElementById('syncedBooks').textContent = '';
        return;
    }

    // Zwischengespeicherte Buecher
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
            const savedBooksDiv = document.getElementById('savedBooks');
            const savedCount = document.getElementById('savedCount');
            savedBooksDiv.textContent = '';

            if (books.length > 0) {
                savedCount.textContent = books.length;

                const table = createBookTable([
                    { label: 'Autor' },
                    { label: 'Titel' },
                    { label: '', className: 'col-action' }
                ]);
                const tbody = table.tBodies[0];

                books.forEach(function (book) {
                    const row = tbody.insertRow();
                    row.insertCell().textContent = book.author;
                    row.insertCell().textContent = book.title;

                    const btnCell = row.insertCell();
                    btnCell.className = 'col-action';
                    const btn = document.createElement('button');
                    btn.className = 'btn-delete';
                    btn.type = 'button';
                    btn.addEventListener('click', function () {
                        deleteBook(book.id);
                    });
                    const icon = document.createElement('i');
                    icon.className = 'fa fa-trash';
                    btn.appendChild(icon);
                    btnCell.appendChild(btn);
                });

                savedBooksDiv.appendChild(table);
            } else {
                savedCount.textContent = '';
                const empty = document.createElement('div');
                empty.className = 'empty-state';
                empty.textContent = 'Keine zwischengespeicherten Bücher.';
                savedBooksDiv.appendChild(empty);
            }
        } else {
            document.getElementById('savedBooks').textContent = '';
            showToast('Fehler beim Abrufen der gespeicherten Bücher.', 'error');
        }
    } catch (error) {
        console.error('Fehler beim Laden der Bücher:', error);
        document.getElementById('savedBooks').textContent = '';
        showToast('Verbindungsfehler beim Laden.', 'error');
    }

    // Synchronisierte Buecher
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
            const syncedBooksDiv = document.getElementById('syncedBooks');
            const syncedCount = document.getElementById('syncedCount');
            syncedBooksDiv.textContent = '';

            if (books.length > 0) {
                syncedCount.textContent = books.length;

                const table = createBookTable([
                    { label: 'Autor' },
                    { label: 'Titel' }
                ]);
                const tbody = table.tBodies[0];

                books.forEach(function (book) {
                    const row = tbody.insertRow();
                    row.insertCell().textContent = book.author;
                    row.insertCell().textContent = book.title;
                });

                syncedBooksDiv.appendChild(table);
            } else {
                syncedCount.textContent = '';
                const empty = document.createElement('div');
                empty.className = 'empty-state';
                empty.textContent = 'Keine synchronisierten Bücher.';
                syncedBooksDiv.appendChild(empty);
            }
        } else {
            document.getElementById('syncedBooks').textContent = '';
            showToast('Fehler beim Abrufen der Bücherliste.', 'error');
        }
    } catch (error) {
        console.error('Fehler beim Laden der Bücher:', error);
        document.getElementById('syncedBooks').textContent = '';
        showToast('Verbindungsfehler beim Laden.', 'error');
    }
}

// --- Buch loeschen ---
async function deleteBook(bookId) {
    const confirmed = confirm('Möchten Sie dieses Buch wirklich löschen?');
    if (!confirmed) return;

    const token = localStorage.getItem('token');
    if (!token) {
        showToast('Kein Token vorhanden.', 'error');
        return;
    }

    try {
        const response = await fetch('./api/delete.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'X-Auth-Token': token,
            },
            body: new URLSearchParams({ 'bookId': bookId })
        });

        const result = await response.json();

        if (result.message) {
            showToast(result.message, 'success');
            loadBooks();
        } else {
            showToast(result.error || 'Fehler beim Löschen.', 'error');
        }
    } catch (error) {
        console.error('Fehler beim Löschen des Buches:', error);
        showToast('Ein Fehler ist aufgetreten.', 'error');
    }
}

// --- Autoren-Autocomplete (API) ---
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

// --- Suchfilter fuer die Buecherliste ---
document.getElementById('search').addEventListener('input', function () {
    const searchTerm = this.value.toLowerCase();
    const container = document.getElementById('syncedBooks');
    const rows = container.getElementsByTagName('tr');

    for (var i = 1; i < rows.length; i++) {
        var cells = rows[i].getElementsByTagName('td');
        if (cells.length < 2) continue;
        var author = cells[0].textContent.toLowerCase();
        var title = cells[1].textContent.toLowerCase();
        rows[i].style.display = (author.includes(searchTerm) || title.includes(searchTerm)) ? '' : 'none';
    }
});

// --- Autovervollstaendigung ---
document.getElementById('author').addEventListener('input', async function () {
    var query = this.value;
    var token = document.getElementById('token').value;
    var autocompleteDiv = document.getElementById('authorAutocomplete');

    if (query.length >= 4) {
        var authors = await fetchAuthors(query, token);
        autocompleteDiv.textContent = '';
        if (authors.length > 0) {
            authors.forEach(function (author) {
                var div = document.createElement('div');
                div.textContent = author;
                div.addEventListener('click', function () {
                    document.getElementById('author').value = author;
                    autocompleteDiv.textContent = '';
                });
                autocompleteDiv.appendChild(div);
            });
        }
    } else {
        autocompleteDiv.textContent = '';
    }
});

// --- URL-Parameter auslesen ---
function getQueryParam(param) {
    var urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
}

// --- Token aus URL uebernehmen ---
document.addEventListener('DOMContentLoaded', function () {
    var token = getQueryParam('token');
    if (token) {
        document.getElementById('token').value = token;
        localStorage.setItem('token', token);
        window.location.href = './';
    }
    updateTokenIndicator();
});

// --- Formular-Submit: Token validieren + Ladezustand ---
document.getElementById('bookForm').addEventListener('submit', function (event) {
    var tokenField = document.getElementById('token');
    var submitBtn = document.getElementById('submitBtn');

    if (!tokenField.value) {
        showToast('Token darf nicht leer sein.', 'error');
        event.preventDefault();
        return;
    }

    tokenField.setCustomValidity('');
    localStorage.setItem('token', tokenField.value);

    submitBtn.disabled = true;
    submitBtn.textContent = 'Wird gespeichert\u2026';
});

// --- Token aus localStorage laden ---
document.getElementById('token').value = localStorage.getItem('token') || '';

// --- Seite initialisieren ---
// pageshow fires both on initial load AND when restored from bfcache (Safari/iOS).
// window.onload does NOT fire on bfcache restore, causing a blank page on iOS Safari.
window.addEventListener('pageshow', function (event) {
    if (event.persisted) {
        // Page was restored from bfcache — reset submit button state
        var submitBtn = document.getElementById('submitBtn');
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="fa fa-book"></i> Buch speichern';
    }
    loadBooks();
});

// --- iOS Safari tab restore: force visibility ---
// When Safari freezes/unfreezes a tab, CSS animation state (opacity) can reset.
// This forces all animated elements to be visible when the tab becomes active again.
document.addEventListener('visibilitychange', function () {
    if (!document.hidden) {
        var animated = document.querySelectorAll('.header, .card, .section');
        for (var i = 0; i < animated.length; i++) {
            animated[i].style.opacity = '1';
            animated[i].style.transform = 'none';
        }
    }
});
