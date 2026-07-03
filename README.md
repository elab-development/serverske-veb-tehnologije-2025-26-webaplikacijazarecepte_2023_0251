# Web aplikacija za Pretrazivanje Recepata / STeh Recepti

Fakultetski seminarski rad fokusiran na backend servise veb aplikacije.

## Trenutno stanje

- Ovaj repozitorijum sada sadrzi projektnu dokumentaciju, `docker-compose.yml` i kompletne STeh Recepti backend/frontend source foldere.
- Docker servisne definicije i build konteksti su postavljeni za arhitekturu sa 3 servisa: MongoDB, backend, frontend.

## Cilj projekta

Implementirati web aplikaciju za recepte i napraviti dokument koji sadrzi:

- korisnicki zahtev i namenu,
- upotrebljene tehnologije,
- scenarije koriscenja,
- reprezentativne delove koda,
- kompletan Docker i Docker Compose proces,
- dokaz kroz terminal komande i screenshot-ove.

## Arhitektura

- Frontend: Angular
- Backend: Node.js + Express
- Database: MongoDB
- Orchestration: Docker Compose

## Pregled Docker konfiguracije

Iz trenutnog `docker-compose.yml`:

- servis `mongodb`:
  - image: `mongo:4.4`
  - kontejner: `steh-recepti-mongodb`
  - mapiranje porta: `${MONGO_PORT}:27017`
  - volume: `mongodb_data:/data/db`
- servis `backend`:
  - build context: `./backend`
  - kontejner: `steh-recepti-backend`
  - mapiranje porta: `${BACKEND_EXTERNAL_PORT}:${BACKEND_PORT}`
  - bind mount: `./backend/src:/usr/src/app/src`
- servis `frontend`:
  - build context: `./frontend`
  - kontejner: `steh-recepti-frontend`
  - mapiranje porta: `${FRONTEND_PORT}:${FRONTEND_PORT}`
- mreza: `steh-recepti-network` (bridge)
- imenovani volume: `steh-recepti-mongodb-data`

## Environment promenljive

Trenutni `.env` sadrzi:

- MongoDB kredencijale i naziv baze
- interne/eksterne backend portove
- Mongo connection URI
- CORS origin
- JWT secret
- frontend port i API URL
- compose project name

## Pokretanje aplikacije

### Preduslovi

- [Docker](https://docs.docker.com/get-docker/) i Docker Compose instalirani
- Portovi `8080`, `3001` i `27017` moraju biti slobodni (proveriti sa `netstat -ano | findstr :8080` na Windows-u ili `lsof -i :8080` na Linux/Mac-u)

### Pokretanje

```bash
# 1. Build i pokretanje svih servisa u pozadini
docker compose up -d --build
```

Prvo pokretanje traje duze jer Docker preuzima `mongo:4.4`, `node:20-slim` i `nginx:alpine` slike i instalira npm pakete za frontend i backend.

### Provera da li sve radi

```bash
# Provera statusa kontejnera — svi moraju biti "Up"
docker compose ps

# Provera backend health endpoint-a
curl http://localhost:3001/health
# Ocekivani odgovor: {"status":"ok","message":"Backend API is running"}

# Provera frontenda (vraca HTML)
curl -I http://localhost:8080
# Ocekivani odgovor: HTTP/1.1 200 OK (+ html)
```

Aplikacija je dostupna na:

- **Frontend:** [http://localhost:8080](http://localhost:8080)
- **Backend API:** [http://localhost:3001](http://localhost:3001)

### Zaustavljanje

```bash
# Zaustavlja sve kontejnere, ali cuva volumene (podatke iz baze)
docker compose down

# Zaustavlja sve kontejnere I BRISE volumene (prazna baza pri sledecem pokretanju)
docker compose down -v
```

### Ceste greske pri pokretanju

| Greska | Uzrok | Resenje |
|---|---|---|
| `port is already allocated` | Port je vec zauzet (npr. MongoDB na 27017 ili NGINX na 8080) | Zaustavite servis koji koristi taj port ili promenite port u `.env` fajlu |
| `EADDRINUSE` u backend logovima | Drugi proces slusa na `${BACKEND_PORT}` (3001) | `netstat -ano | findstr :3001` i `taskkill /PID <PID> /F` |
| `connect ECONNREFUSED` pri pozivu API-ja | Backend ne moze da se poveze na MongoDB | Proverite da li `mongodb` servis ima status `Up` u `docker compose ps`; sacekajte 30s da se MongoDB inicijalizuje |
| `Module not found` ili `Cannot find module` | Build kes nije osvezen nakon dodavanja novih paketa | Pokrenite `docker compose build --no-cache` pa zatim `docker compose up -d` |
| Frontend prikazuje belu stranicu | Angular build nije uspeo ili NGINX nije ispravno konfigurisan | Proverite `docker compose logs frontend` za greske pri build-u |
| `MongoNetworkError` | MongoDB kontejner nije spreman kada backend pokusa da se poveze | Backend ima `depends_on` ali MongoDB-u treba vremena; restartujte backend: `docker compose restart backend` |
| Angular `import error` u konzoli | Verzije Angular paketa su nekompatibilne | Proverite `frontend/package.json` — sve Angular verzije moraju biti iste (~19.2.x); obrisite `node_modules` i `package-lock.json` pa rebuild-ujte |

## Docker - pomocna tabela

| Zahtev | Status | Dokaz |
|---|---|---|
| Docker compose sa frontend/backend/database servisima | Zavrseno | `docker-compose.yml` |
| Dockerfiles za sve servise | Zavrseno | `backend/Dockerfile`, `frontend/Dockerfile` |
| Definicija mreze | Zavrseno | `steh-recepti-network` |
| Volume definicija + bind mount | Zavrseno | `mongodb_data`, `./backend/src:/usr/src/app/src` |
| Upotreba posebnog env fajla | Zavrseno | `.env` + `env_file` |
| Terminal-based proces dokazi (images/containers/networks/volumes) | Zavrseno | `docker compose build`, `docker compose up -d`, `docker compose ps`, `docker images`, `docker volume ls`, `docker network ls` |
| Dokaz da aplikacija radi | Zavrseno | `curl -I http://localhost:8080`, `curl http://localhost:3001/health` |
| Objasnjenje naprednih Docker opcija | U toku | Finalni prolaz dokumentacije |
