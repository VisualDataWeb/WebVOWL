# ADR 0001: Local Docker development for WebVOWL + OWL2VOWL

| Metadata | Value |
|----------|-------|
| **Status** | Accepted (implemented in this repository) |
| **Date** | 2026-06-04 |
| **Deciders** | VisualDataWeb maintainers / local dev workflow |
| **Supersedes** | wget-based root `Dockerfile` on upstream `master` |

## Context

WebVOWL needs a browser UI and an **OWL2VOWL** backend on the **same origin** (`/convert`, `/serverTimeStamp`). Upstream Docker docs build an image that **downloads** `webvowl_1.1.7.war` from `vowl.visualdataweb.org`. That host is compromised or unreachable (HTTP 520/403, corrupt HTML served as WAR). See [#212](https://github.com/VisualDataWeb/WebVOWL/issues/212), [#203](https://github.com/VisualDataWeb/WebVOWL/issues/203), [#180](https://github.com/VisualDataWeb/WebVOWL/issues/180).

Constraints:

- **Small images** where possible (multi-stage, no nginx/supervisor unless required).
- **Volume mounts** for ontologies (`/data`) and optional frontend overlay (`deploy/`).
- **Do not change application build toolchains** (Java 8, Maven as-is, Node 12 / Webpack 1 / Grunt).
- **Bump only container base image tags** (Tomcat **9.0.118**, Maven **3.9.16**, Temurin **8** on Noble, Node **12** Alpine — see `docker/Dockerfile` `ARG`s).
- **All deliverables live inside Git repositories** (WebVOWL + OWL2VOWL), not in a parent folder outside clones.

**Local checkout:** WebVOWL repository only. OWL2VOWL is **not** cloned on the host.

## Decision

1. **Default**: `docker-compose.yml` + `docker/Dockerfile` (full stack).
2. **OWL2VOWL at image build time**: `git clone` in the Maven stage (`OWL2VOWL_GIT_URL` / `OWL2VOWL_GIT_REF`, default `master`). No Compose `additional_contexts` and no sibling directory.
3. **Multi-stage build**:
   - Maven `3.9-eclipse-temurin-8` → `owl2vowl.war`
   - Node `12-alpine` → `npm install --ignore-scripts` + `npm run release`
   - Tomcat `9.0.118-jdk8-temurin-noble` → explode WAR into `ROOT`, overlay `deploy/`
4. **Single Tomcat `ROOT`** (same design as [PR #215](https://github.com/VisualDataWeb/WebVOWL/pull/215)).
5. **Reject** [PR #214](https://github.com/VisualDataWeb/WebVOWL/pull/214) nginx/Java 17 split compose for this workflow.
6. **Frontend-only** variant: `docker/Dockerfile.frontend` + `docker-compose.frontend.yml`.
7. **OWL2VOWL** documents sibling checkout in `OWL2VOWL/doc/docker/README.md`; `.dockerignore` excludes large `ontologies/` when used as build context.
8. **Hardening:** non-root `tomcat` / `owl2vowl` users, image + compose `HEALTHCHECK`, `no-new-privileges`, JRE runtime after WAR explode in JDK stage.
9. **CI/CD:** `.github/workflows/docker-ci.yml` (PR/build test), `docker-release.yml` (push tagged images to `ghcr.io`).

## Rationale

| Approach | Why chosen / rejected |
|----------|----------------------|
| wget WAR | Broken ([#212](https://github.com/VisualDataWeb/WebVOWL/issues/212)). |
| Sibling `../OWL2VOWL` checkout | Replaced by `git clone` inside `docker/Dockerfile` (network at build time). |
| PR #215 | Correct merge model; arm64 fix: `--ignore-scripts`. |
| PR #214 | Java 17 + nginx rejected. |
| Two services, two ports, no proxy | Breaks relative `/convert` ([#195](https://github.com/VisualDataWeb/WebVOWL/issues/195)). |
| `doc/Docker` legacy | `/data` volume pattern kept; inotify batch job not ported. |

## Consequences

### Positive

- No external WAR download; converter on same origin.
- ~**358 MB** runtime image (2026-06-04, arm64).
- Mount `./data`; optional `./deploy` overlay.

### Negative / follow-ups

- Merged build needs **network** to clone OWL2VOWL; pin `OWL2VOWL_GIT_REF` for reproducible releases.
- Node 12 / Java 8 EOL.
- [#111](https://github.com/VisualDataWeb/WebVOWL/issues/111) Docker Hub not addressed.
- Align upstream [PR #215](https://github.com/VisualDataWeb/WebVOWL/pull/215) with this layout.

## Verification (2026-06-04)

Environment: Docker 29.4, macOS arm64.

```bash
cd WebVOWL
docker compose build && docker compose up -d
curl -sf http://localhost:8080/serverTimeStamp
# POST foaf.rdf to /convert (any local OWL file)
```

## Implementation map (WebVOWL)

| Path | Role |
|------|------|
| `docker-compose.yml` | Full stack (OWL2VOWL cloned in build) |
| `docker-compose.frontend.yml` | UI only |
| `docker/Dockerfile` | Merged image |
| `docker/Dockerfile.frontend` | Frontend-only image |
| `docker/README.md` | Operator guide (security, GHCR) |
| `.github/workflows/docker-ci.yml` | PR / main build + smoke test |
| `.github/workflows/docker-release.yml` | Publish to GHCR on tag `v*` |
| `.dockerignore` | WebVOWL build context |
| `data/` | Host mount → `/data` |
| `docs/adr/0001-…` | This ADR |

## Implementation map (OWL2VOWL)

| Path | Role |
|------|------|
| `doc/docker/README.md` | Sibling checkout + standalone JAR image |
| `.dockerignore` | Exclude `ontologies/` from Docker context |
| `Dockerfile` | Standalone converter (non-root, healthcheck) |
| `.github/workflows/docker-ci.yml` | PR / main build + smoke test |
| `.github/workflows/docker-release.yml` | GHCR on tag `v*` |

## Related GitHub issues (WebVOWL)

| # | State | Title | Relevance |
|---|-------|-------|-----------|
| [212](https://github.com/VisualDataWeb/WebVOWL/issues/212) | OPEN | Docker compose: wget HTTP 520 | **Primary** |
| [203](https://github.com/VisualDataWeb/WebVOWL/issues/203) | OPEN | README Docker instructions do not work | Fixed here |
| [202](https://github.com/VisualDataWeb/WebVOWL/issues/202) | OPEN | Temporary fix as website is down | Same root cause |
| [195](https://github.com/VisualDataWeb/WebVOWL/issues/195) | OPEN | Could not establish OWL2VOWL connection | Fixed with merged image |
| [201](https://github.com/VisualDataWeb/WebVOWL/issues/201) | OPEN | OWL2VOWL service error | Related |
| [180](https://github.com/VisualDataWeb/WebVOWL/issues/180) | CLOSED | Unable to download war release | Historical |
| [206](https://github.com/VisualDataWeb/WebVOWL/issues/206) | CLOSED | Service is down | Domain context |
| [183](https://github.com/VisualDataWeb/WebVOWL/issues/183) | OPEN | WebVOWL cannot be rebuild | Addressed via source build |
| [111](https://github.com/VisualDataWeb/WebVOWL/issues/111) | OPEN | Docker Hub image | Not implemented |
| [100](https://github.com/VisualDataWeb/WebVOWL/issues/100) | CLOSED | Add Dockerfile | Original Docker support |

## Related GitHub pull requests (WebVOWL)

| # | State | Title | Notes |
|---|-------|-------|-------|
| [215](https://github.com/VisualDataWeb/WebVOWL/pull/215) | OPEN | Build from source in Docker | Align with this ADR |
| [214](https://github.com/VisualDataWeb/WebVOWL/pull/214) | CLOSED | Modernize Docker (Java 17, nginx) | Rejected scope |
| [213](https://github.com/VisualDataWeb/WebVOWL/pull/213) | CLOSED | Duplicate of #214 | |
| [114](https://github.com/VisualDataWeb/WebVOWL/pull/114) | OPEN | chore(docker): update image | wget-based; obsolete |
| [207](https://github.com/VisualDataWeb/WebVOWL/pull/207) | DRAFT | Dockerfile page amd64 | Partial |
| [181](https://github.com/VisualDataWeb/WebVOWL/pull/181) | MERGED | Fixed Docker File | |
| [170](https://github.com/VisualDataWeb/WebVOWL/pull/170) | MERGED | Dockerized WebVOWL | |
| [102](https://github.com/VisualDataWeb/WebVOWL/pull/102) | MERGED | Fix #100 Add Docker | |

## Related GitHub (OWL2VOWL)

| # | State | Title | Notes |
|---|-------|-------|-------|
| [47](https://github.com/VisualDataWeb/OWL2VOWL/pull/47) | MERGED | Dockerize | Standalone `OWL2VOWL/Dockerfile`; merged build uses Maven stage in WebVOWL |

## References

- [docker/README.md](../docker/README.md)
- [doc/Docker/README.md](../doc/Docker/README.md) — legacy inotify image
- [OWL2VOWL doc/docker/README.md](../../../OWL2VOWL/doc/docker/README.md) — sibling layout
- [TIB WebVOWL](https://service.tib.eu/webvowl/)
