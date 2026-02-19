# Booklist Webapp

A PHP/MySQL web interface for managing a personal book collection. Serves as a companion app for the Java Booklist desktop application, which can sync its book list to this web app via API.

Users are identified by a token (min. 32 characters) stored in the browser's localStorage — no login required.

Access the app via `https://your-server/?token=<yourRandomTokenHere>`

## Features

- Add books with author, title, series, notes, and ebook flag
- View books synced from the Java desktop app
- Author and series autocomplete
- Star rating (synced back to the desktop app)
- Detail view per book
- Token-based multi-user support

## Setup

1. Clone the repo
2. Run `npm install`
3. Fill in your database credentials in `config.php`
4. Create the database tables (see SQL below)
5. Add `bookApp.conf` as an Apache VirtualHost and set ownership to your Apache user

## Build

```bash
npm run dev        # local dev server with hot reload
npm run build      # production build to dist/ (bundled JS/CSS + PHP files)
```

After `npm run build`, the `dist/` directory contains everything needed for deployment.

## Database Tables

```sql
CREATE TABLE IF NOT EXISTS books (
  id INT AUTO_INCREMENT PRIMARY KEY,
  author VARCHAR(255) NOT NULL, title VARCHAR(255) NOT NULL,
  series VARCHAR(255), series_part VARCHAR(2), note TEXT,
  ebook BOOLEAN NOT NULL, token VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS syncedBooks (
  token VARCHAR(255) NOT NULL, bid INT NOT NULL,
  author VARCHAR(255), title VARCHAR(255), series VARCHAR(255),
  PRIMARY KEY (token, bid)
);

CREATE TABLE IF NOT EXISTS ratingUpdates (
  id INT AUTO_INCREMENT PRIMARY KEY,
  token VARCHAR(255) NOT NULL, bid INT NOT NULL,
  rating FLOAT NOT NULL, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_token_bid (token, bid)
);
```

## Dependencies

- PHP 8.2+
- MariaDB 11.6 / MySQL 8.0
- Apache 2.4 with `mod_rewrite`, `mod_ssl`, `mod_headers`
- Node.js 20+ (build only)
