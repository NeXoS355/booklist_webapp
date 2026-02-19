// =============================================
// BUCHVERWALTUNG — App Logic
// =============================================

import APP_VERSION from './_version.js';

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

// --- Hilfsfunktionen fuer Detail-Ansicht ---

function renderEbookIcon() {
    return '<span class="ebook-icon" title="E-Book">'
        + '<svg width="11" height="14" viewBox="0 0 11 14" fill="none">'
        + '<rect x="0.7" y="0.7" width="9.6" height="12.6" rx="1.8" stroke="currentColor" stroke-width="1.3"/>'
        + '<circle cx="5.5" cy="11.2" r="0.65" fill="currentColor"/>'
        + '<line x1="2.2" y1="4" x2="8.8" y2="4" stroke="currentColor" stroke-width="1.1" stroke-linecap="round"/>'
        + '<line x1="2.2" y1="6.3" x2="8.8" y2="6.3" stroke="currentColor" stroke-width="1.1" stroke-linecap="round"/>'
        + '</svg></span>';
}

function renderStarsHtml(rating, size) {
    if (!rating || rating <= 0) return '';
    var full  = Math.floor(rating);
    var half  = (rating % 1) >= 0.4 ? 1 : 0;
    var empty = 5 - full - half;
    var s = '<span class="detail-stars-inner">';
    for (var i = 0; i < full;  i++) s += '<span class="star filled">★</span>';
    if (half)                        s += '<span class="star half">★</span>';
    for (var i = 0; i < empty; i++) s += '<span class="star">★</span>';
    return s + '</span>';
}

function renderInteractiveStars(initialRating, onChange) {
    var current = initialRating || 0;
    var container = document.createElement('span');
    container.className = 'detail-stars-inner interactive-stars';

    for (var i = 1; i <= 5; i++) {
        var star = document.createElement('span');
        star.className = 'star interactive-star';
        star.dataset.value = i;
        star.textContent = '★';
        container.appendChild(star);
    }

    function getRatingFromX(clientX) {
        var rect = container.getBoundingClientRect();
        var x = Math.max(0, Math.min(clientX - rect.left, rect.width - 1));
        var raw = (x / rect.width) * 5;
        return Math.max(0.5, Math.min(5, Math.round(raw * 2) / 2));
    }

    function updateDisplay(rating) {
        container.querySelectorAll('.interactive-star').forEach(function(s, idx) {
            s.classList.remove('filled', 'half');
            if (rating >= idx + 1)  s.classList.add('filled');
            else if (rating > idx)  s.classList.add('half');
        });
    }

    updateDisplay(current);

    var active = false;

    container.addEventListener('pointerdown', function(e) {
        active = true;
        container.setPointerCapture(e.pointerId);
        updateDisplay(getRatingFromX(e.clientX));
        e.preventDefault();
    });

    container.addEventListener('pointermove', function(e) {
        if (active || e.pointerType === 'mouse') {
            updateDisplay(getRatingFromX(e.clientX));
        }
    });

    container.addEventListener('pointerup', function(e) {
        if (active) {
            active = false;
            current = getRatingFromX(e.clientX);
            updateDisplay(current);
            onChange(current);
        }
    });

    container.addEventListener('pointercancel', function() {
        active = false;
        updateDisplay(current);
    });

    container.addEventListener('pointerleave', function(e) {
        if (!active && e.pointerType === 'mouse') {
            updateDisplay(current);
        }
    });

    return container;
}

async function updateBookRating(bid, rating) {
    const token = localStorage.getItem('token');
    const formData = new FormData();
    formData.append('bid', bid);
    formData.append('rating', rating);
    try {
        const response = await fetch('./api/updateRating.php', {
            method: 'POST',
            headers: { 'X-Auth-Token': token },
            body: formData
        });
        if (response.ok) {
            showToast('Bewertung gespeichert', 'success');
        } else {
            showToast('Fehler beim Speichern der Bewertung', 'error');
        }
    } catch (e) {
        showToast('Verbindungsfehler', 'error');
    }
}

function formatDateDetail(str) {
    if (!str) return '—';
    try {
        return new Date(str).toLocaleDateString('de-DE', { year: 'numeric', month: 'long', day: 'numeric' });
    } catch (e) { return str; }
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
                    { label: '', className: 'col-ebook' },
                    { label: 'Autor' },
                    { label: 'Titel' }
                ]);
                const tbody = table.tBodies[0];

                books.forEach(function (book) {
                    const row = tbody.insertRow();
                    row.className = 'clickable';

                    // Ebook-Icon
                    const ebookCell = row.insertCell();
                    ebookCell.className = 'col-ebook';
                    if (book.ebook) {
                        ebookCell.innerHTML = renderEbookIcon();
                    }

                    // Autor
                    row.insertCell().textContent = book.author;

                    // Titel + Serienzeile
                    const titleCell = row.insertCell();
                    const titleDiv = document.createElement('div');
                    titleDiv.textContent = book.title;
                    titleCell.appendChild(titleDiv);
                    if (book.series) {
                        const seriesDiv = document.createElement('div');
                        seriesDiv.className = 'book-series-chip';
                        const seriesName = document.createElement('span');
                        seriesName.textContent = book.series;
                        seriesDiv.appendChild(seriesName);
                        if (book.series_part) {
                            const vol = document.createElement('span');
                            vol.className = 'book-series-vol';
                            vol.textContent = book.series_part;
                            seriesDiv.appendChild(vol);
                        }
                        titleCell.appendChild(seriesDiv);
                    }

                    row.addEventListener('click', function () {
                        openBookDetail(book);
                    });
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

// --- Buchreihen-Autocomplete (API) ---
async function fetchSeries(query, token) {
    try {
        const response = await fetch('./api/series_search.php?series=' + encodeURIComponent(query), {
            headers: { 'X-Auth-Token': token }
        });
        if (!response.ok) {
            throw new Error('Fehler bei der API-Anfrage');
        }
        return await response.json();
    } catch (error) {
        console.error('Fehler beim Abrufen der Buchreihen:', error);
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
        if (cells.length < 3) continue;
        var author = cells[1].textContent.toLowerCase();
        var title  = cells[2].textContent.toLowerCase();
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

// --- Buchreihen-Autovervollstaendigung ---
document.getElementById('series').addEventListener('input', async function () {
    var query = this.value;
    var token = document.getElementById('token').value;
    var autocompleteDiv = document.getElementById('seriesAutocomplete');

    if (query.length >= 3) {
        var seriesList = await fetchSeries(query, token);
        autocompleteDiv.textContent = '';
        if (seriesList.length > 0) {
            seriesList.forEach(function (series) {
                var div = document.createElement('div');
                div.textContent = series;
                div.addEventListener('click', function () {
                    document.getElementById('series').value = series;
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
    // Immer: Detail-Modal zuruecksetzen (bfcache kann offenen Modal-Zustand einfrieren)
    var overlay = document.getElementById('detailOverlay');
    overlay.classList.remove('showing', 'closing');
    document.body.classList.remove('modal-open');
    if (APP_VERSION) {
        var versionEl = document.getElementById('appVersion');
        if (versionEl) versionEl.textContent = 'v' + APP_VERSION;
    }
    loadBooks();
});

// --- Buchdetail oeffnen ---
function openBookDetail(book) {
    document.getElementById('detailTitle').textContent  = book.title  || '';
    document.getElementById('detailAuthor').textContent = book.author || '';

    // Sterne + Bewertungszahl
    var starsEl = document.getElementById('detailStars');
    starsEl.innerHTML = '';
    if (book.bid) {
        // syncedBook: interaktive Sterne
        var ratingVal = document.createElement('span');
        ratingVal.className = 'detail-rating-val';
        ratingVal.textContent = book.rating > 0 ? parseFloat(book.rating).toFixed(1) : '';
        var stars = renderInteractiveStars(book.rating || 0, function(newRating) {
            ratingVal.textContent = newRating.toFixed(1);
            updateBookRating(book.bid, newRating);
        });
        var editHint = document.createElement('span');
        editHint.className = 'detail-rating-edit-hint';
        editHint.setAttribute('aria-hidden', 'true');
        editHint.innerHTML = '<i class="fa fa-pencil"></i>';
        var touchHint = document.createElement('div');
        touchHint.className = 'detail-rating-touch-hint';
        touchHint.textContent = 'Wischen zum Bewerten';
        starsEl.appendChild(stars);
        starsEl.appendChild(ratingVal);
        starsEl.appendChild(editHint);
        starsEl.appendChild(touchHint);
    } else if (book.rating && book.rating > 0) {
        // manuell hinzugefuegtes Buch: statische Sterne
        starsEl.innerHTML = renderStarsHtml(book.rating, 17);
        var ratingValStatic = document.createElement('span');
        ratingValStatic.className = 'detail-rating-val';
        ratingValStatic.textContent = parseFloat(book.rating).toFixed(1);
        starsEl.appendChild(ratingValStatic);
    }

    // Chips (Serie, E-Book, Ausleihstatus)
    var chipsEl = document.getElementById('detailChips');
    chipsEl.innerHTML = '';
    if (book.series) {
        var c = document.createElement('span');
        c.className = 'chip chip--series';
        c.textContent = book.series + (book.series_part ? ' \u00b7 Bd.\u00a0' + book.series_part : '');
        chipsEl.appendChild(c);
    }
    if (book.ebook) {
        chipsEl.appendChild(createDetailChip('chip--ebook', 'E-Book'));
    }
    if (book.ausgeliehen === 'an' && book.borrow_name) {
        chipsEl.appendChild(createDetailChip('chip--borrowed', 'Verliehen an ' + book.borrow_name));
    } else if (book.ausgeliehen === 'von' && book.borrow_name) {
        chipsEl.appendChild(createDetailChip('chip--borrowed-from', 'Geliehen von ' + book.borrow_name));
    }

    // Cover laden via PHP-Proxy (umgeht CSP, Google Books + Open Library server-seitig)
    var coverEl = document.getElementById('detailCover');
    var coverPlaceholder = '<div class="detail-cover-placeholder">'
        + '<svg width="28" height="34" viewBox="0 0 28 34" fill="none">'
        + '<rect x="1" y="1" width="26" height="32" rx="3" stroke="currentColor" stroke-width="1.5"/>'
        + '<line x1="5" y1="9" x2="23" y2="9" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/>'
        + '<line x1="5" y1="13" x2="23" y2="13" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/>'
        + '<line x1="5" y1="17" x2="18" y2="17" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/>'
        + '</svg></div>';
    coverEl.innerHTML = coverPlaceholder;

    if (book.isbn) {
        var img = document.createElement('img');
        img.alt = book.title;
        img.onload = function () {
            coverEl.innerHTML = '';
            coverEl.appendChild(img);
        };
        // onerror: Platzhalter bleibt bestehen
        img.src = './api/cover.php?isbn=' + encodeURIComponent(book.isbn);
    }

    // Body: Beschreibung, Metadaten, Bemerkung
    var bodyEl = document.getElementById('detailBody');
    bodyEl.innerHTML = '';

    if (book.description) {
        var descSec = document.createElement('div');
        descSec.className = 'detail-section';
        var descLbl = document.createElement('span');
        descLbl.className = 'detail-label';
        descLbl.textContent = 'Beschreibung';
        var descP = document.createElement('p');
        descP.className = 'detail-description detail-description--clamped';
        descP.textContent = book.description;
        descSec.appendChild(descLbl);
        descSec.appendChild(descP);

        var expandBtn = document.createElement('button');
        expandBtn.className = 'btn-expand';
        expandBtn.textContent = 'Mehr anzeigen \u25be';
        expandBtn.addEventListener('click', function () {
            var clamped = descP.classList.toggle('detail-description--clamped');
            expandBtn.textContent = clamped ? 'Mehr anzeigen \u25be' : 'Weniger anzeigen \u25b4';
        });
        descSec.appendChild(expandBtn);

        bodyEl.appendChild(descSec);
        bodyEl.appendChild(createDetailDivider());
    }

    var metaSec = document.createElement('div');
    metaSec.className = 'detail-section';
    var metaLbl = document.createElement('span');
    metaLbl.className = 'detail-label';
    metaLbl.textContent = 'Details';
    metaSec.appendChild(metaLbl);
    var grid = document.createElement('div');
    grid.className = 'detail-meta-grid';
    // margin-top via CSS (.detail-meta-grid)
    addDetailMetaItem(grid, 'ISBN',         book.isbn || '\u2014');
    addDetailMetaItem(grid, 'Hinzugef\u00fcgt', formatDateDetail(book.date_added));
    metaSec.appendChild(grid);
    bodyEl.appendChild(metaSec);

    if (book.note) {
        bodyEl.appendChild(createDetailDivider());
        bodyEl.appendChild(createDetailSection('Bemerkung', book.note, 'detail-value'));
    }

    var overlay = document.getElementById('detailOverlay');
    overlay.classList.remove('closing');
    overlay.classList.add('showing');
    document.body.classList.add('modal-open');
    document.querySelector('.detail-scroll').scrollTop = 0;
}

function closeBookDetail() {
    var overlay = document.getElementById('detailOverlay');
    overlay.classList.remove('showing');
    overlay.classList.add('closing');
    setTimeout(function () {
        overlay.classList.remove('closing');
        document.body.classList.remove('modal-open');
    }, 200);
}

function createDetailChip(cls, text) {
    var el = document.createElement('span');
    el.className = 'chip ' + cls;
    el.textContent = text;
    return el;
}

function createDetailSection(label, text, valueClass) {
    var sec = document.createElement('div');
    sec.className = 'detail-section';
    var lbl = document.createElement('span');
    lbl.className = 'detail-label';
    lbl.textContent = label;
    var val = document.createElement('p');
    val.className = valueClass || 'detail-value';
    val.textContent = text;
    sec.appendChild(lbl);
    sec.appendChild(val);
    return sec;
}

function addDetailMetaItem(grid, label, value) {
    var cell = document.createElement('div');
    cell.className = 'detail-meta-item';
    var lbl = document.createElement('span');
    lbl.className = 'detail-label';
    lbl.textContent = label;
    var val = document.createElement('span');
    val.className = 'detail-value';
    val.textContent = value;
    cell.appendChild(lbl);
    cell.appendChild(val);
    grid.appendChild(cell);
}

function createDetailDivider() {
    var d = document.createElement('div');
    d.className = 'detail-divider';
    return d;
}

// --- Detail-Modal: Event-Listener ---
document.getElementById('detailClose').addEventListener('click', closeBookDetail);
document.getElementById('detailOverlay').addEventListener('click', function (e) {
    if (e.target === this) closeBookDetail();
});
document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeBookDetail();
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
