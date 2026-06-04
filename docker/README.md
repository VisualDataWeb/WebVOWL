# Docker — WebVOWL

## Full stack (default)

Clone **WebVOWL** only. `docker/Dockerfile` clones **OWL2VOWL** from GitHub during the image build.

```bash
cd WebVOWL
docker compose build
docker compose up -d --wait
```

- UI: [http://localhost:8080](http://localhost:8080)
- Converter: `/serverTimeStamp`, `/convert`

### Build args

| Arg | Default | Purpose |
|-----|---------|---------|
| `OWL2VOWL_GIT_URL` | `https://github.com/VisualDataWeb/OWL2VOWL.git` | Converter repo |
| `OWL2VOWL_GIT_REF` | `master` | Branch or tag to build |

```bash
OWL2VOWL_GIT_REF=master docker compose build
```

Requires network access during `docker build`.

### Health

```bash
curl -sf http://localhost:8080/serverTimeStamp
curl -sfL -o /tmp/foaf.rdf \
  https://raw.githubusercontent.com/VisualDataWeb/OWL2VOWL/master/ontologies/foaf.rdf
curl -sf -X POST -F "ontology=@/tmp/foaf.rdf" -F "sessionId=test" \
  http://localhost:8080/convert | head -c 80
```

## Frontend only

No OWL2VOWL fetch, no file/IRI conversion:

```bash
docker compose -f docker-compose.frontend.yml up -d --build --wait
```

Or: `docker build -t webvowl:local .` (root `Dockerfile`).

## Volumes

| Host | Container | Purpose |
|------|-----------|---------|
| `./data` | `/data` | Ontology files (storage only) |
| `./deploy` (optional) | `webapps/ROOT` | Hot-reload UI |

## CI / releases

| Workflow | Builds |
|----------|--------|
| `docker-ci.yml` | Merged (git clone in Dockerfile) + frontend |
| `docker-release.yml` | `ghcr.io/visualdataweb/webvowl` + `-frontend` on tag `v*` |

## Files

| File | Notes |
|------|--------|
| `docker-compose.yml` | Full stack |
| `docker-compose.frontend.yml` | UI only |
| `docker/Dockerfile` | Clones OWL2VOWL at build time |

## Legacy

`doc/Docker/` — superseded; see ADR 0001.
