# Docker — WebVOWL + OWL2VOWL

## Prerequisites

- Docker with **BuildKit**
- Sibling clones (local) or `OWL2VOWL` checked out under `./OWL2VOWL` (CI)

```text
your-workspace/
  WebVOWL/     ← run commands here
  OWL2VOWL/    ← ../OWL2VOWL (default) or ./OWL2VOWL
```

## Merged stack (recommended)

```bash
cd WebVOWL
docker compose build
docker compose up -d --wait
```

Open [http://localhost:8080](http://localhost:8080).

### Health

- Image `HEALTHCHECK` → `GET /serverTimeStamp`
- Compose `healthcheck` + `docker compose up --wait`

```bash
curl -sf http://localhost:8080/serverTimeStamp
curl -sf -X POST \
  -F "ontology=@../OWL2VOWL/ontologies/foaf.rdf" \
  -F "sessionId=test" \
  http://localhost:8080/convert | head -c 80
```

### Security (runtime)

- Process runs as **`tomcat`** (non-root)
- `security_opt: no-new-privileges:true` in compose
- JRE runtime image (WAR exploded in JDK build stage only)

## Frontend only

```bash
docker compose -f docker-compose.frontend.yml up -d --build --wait
```

## OWL2VOWL path override

```bash
export OWL2VOWL_CONTEXT=./OWL2VOWL   # CI / nested checkout
docker compose build
```

Default: `../OWL2VOWL` (sibling).

## Volumes

| Host | Container | Purpose |
|------|-----------|---------|
| `./data` | `/data` | Ontology files (storage only) |
| `./deploy` (optional) | `webapps/ROOT` | Hot-reload UI |

## CI / releases (GitHub Actions)

| Workflow | Trigger | Images |
|----------|---------|--------|
| `.github/workflows/docker-ci.yml` | PR + push `master`/`main` | Build + smoke test (no push) |
| `.github/workflows/docker-release.yml` | Tag `v*` | Push to GHCR |

**Registry (on release tag `v1.2.3`):**

- `ghcr.io/visualdataweb/webvowl:1.2.3` (+ `latest`, semver minors)
- `ghcr.io/visualdataweb/webvowl-frontend:1.2.3`

Pull (after release and `docker login ghcr.io`):

```bash
docker pull ghcr.io/visualdataweb/webvowl:latest
docker run --rm -p 8080:8080 ghcr.io/visualdataweb/webvowl:latest
```

Package visibility follows the GitHub org/repo settings.

## Files

| File | Description |
|------|-------------|
| `docker/Dockerfile` | Merged image |
| `docker/Dockerfile.frontend` | Frontend only |
| `docker-compose.yml` | Merged service |
| `docs/adr/0001-docker-local-development.md` | ADR |

## Legacy

`doc/Docker/` — superseded; see ADR 0001.
