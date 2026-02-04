# POS System (MVP)

## Prerequisites
- Node.js LTS
- Docker Desktop

## Run Infra (Postgres, Redis, pgAdmin)
docker compose up -d

pgAdmin: http://localhost:8080

## Stop Infra
docker compose down

## Reset DB (delete all data)
docker compose down -v
