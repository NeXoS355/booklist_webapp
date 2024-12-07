#!/bin/bash

# Dynamischer Pfad für Zertifikate aus Umgebungsvariablen
CERT_PATH="${LETSENCRYPT_PATH}"
CHAIN_FILE="${CERT_PATH}/fullchain.pem"
KEY_FILE="${CERT_PATH}/privkey.pem"

# Apache SSL-Konfiguration dynamisch anpassen
cp "${CHAIN_FILE}" /etc/ssl/fullchain.pem
cp "${KEY_FILE}" /etc/ssl/privkey.pem

# Am Ende das CMD ausführen
exec "$@"
