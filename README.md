# booklist Webapp
Booklist Web Interface with API for Java Booklist.
Access the app with your token via `https://your-server/?token=<yourRandomTokenHere>`
The Token (min. 32 characters) is then saved locally in your BrowserStorage.

## Setup

- Clone the repo
- Install Node.js dependencies: `npm install`
- Configure `config.php` with your DB credentials
- Create the necessary DB tables (see SQL below)
- Add `bookApp.conf` as an Apache VirtualHost and set ownership to your Apache user

## Deployment

```bash
./deploy.sh   # builds with Parcel, then deploys dist/ via rsync
```

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
- Apache 2.4 with mod_rewrite, mod_ssl, mod_headers
- Node.js 20+ (Build)
