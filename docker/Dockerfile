# syntax=docker/dockerfile:1.4
# Combined WebVOWL + OWL2VOWL (Node 12 for frontend, Java 11 for OWL2VOWL / OWL API 5.5.x).
# OWL2VOWL is fetched at build time; only the WebVOWL repo must be cloned locally.

ARG TOMCAT_IMAGE=9.0.118
ARG WEBVOWL_VERSION=1.1.7
ARG MAVEN_IMAGE=3.9.16-eclipse-temurin-11-noble
ARG NODE_IMAGE=12-alpine
ARG OWL2VOWL_GIT_URL=https://github.com/Artemis-IA/OWL2VOWL.git
ARG OWL2VOWL_GIT_REF=fix-owlapi-1080

# --- OWL2VOWL (Maven WAR, cloned in image build) ---
FROM maven:${MAVEN_IMAGE} AS owl2vowl-builder

ARG OWL2VOWL_GIT_URL
ARG OWL2VOWL_GIT_REF

RUN apt-get update \
    && apt-get install -y --no-install-recommends git \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /build/owl2vowl
RUN git clone --depth 1 --branch "${OWL2VOWL_GIT_REF}" "${OWL2VOWL_GIT_URL}" . \
    || git clone --depth 1 "${OWL2VOWL_GIT_URL}" .

RUN mvn -B package -P war-release -DskipTests

# --- WebVOWL (Grunt/Webpack → deploy/) ---
FROM node:${NODE_IMAGE} AS webvowl-builder

WORKDIR /build/webvowl
COPY package.json Gruntfile.js webpack.config.js ./
COPY src ./src
COPY util ./util
COPY .jshintrc .jshintignore ./

RUN npm install --ignore-scripts && npm run release

# --- Explode WAR (JDK only in build stage) ---
FROM tomcat:${TOMCAT_IMAGE}-jdk11-temurin-noble AS owl2vowl-expand

RUN rm -rf "${CATALINA_HOME}/webapps/"* \
    && mkdir -p "${CATALINA_HOME}/webapps/ROOT"

COPY --from=owl2vowl-builder /build/owl2vowl/target/owl2vowl.war /tmp/owl2vowl.war
RUN cd "${CATALINA_HOME}/webapps/ROOT" \
    && jar xf /tmp/owl2vowl.war \
    && rm /tmp/owl2vowl.war

# --- Runtime ---
FROM tomcat:${TOMCAT_IMAGE}-jre11-temurin-noble AS runtime

ARG WEBVOWL_VERSION=1.1.7

LABEL org.opencontainers.image.title="WebVOWL" \
      org.opencontainers.image.description="WebVOWL with OWL2VOWL converter (single Tomcat ROOT)" \
      org.opencontainers.image.version="${WEBVOWL_VERSION}"

RUN apt-get update \
    && apt-get install -y --no-install-recommends curl \
    && rm -rf /var/lib/apt/lists/* \
    && groupadd -r tomcat --gid=999 \
    && useradd -r -g tomcat --uid=999 --home-dir="${CATALINA_HOME}" tomcat \
    && rm -rf "${CATALINA_HOME}/webapps/"* \
    && mkdir -p "${CATALINA_HOME}/webapps/ROOT" /data \
    && chown -R tomcat:tomcat "${CATALINA_HOME}" /data

COPY --from=owl2vowl-expand --chown=tomcat:tomcat \
    /usr/local/tomcat/webapps/ROOT/ /usr/local/tomcat/webapps/ROOT/

COPY --from=webvowl-builder --chown=tomcat:tomcat \
    /build/webvowl/deploy/ /usr/local/tomcat/webapps/ROOT/

USER tomcat

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=5s --start-period=90s --retries=3 \
    CMD curl -f http://127.0.0.1:8080/serverTimeStamp || exit 1

VOLUME ["/data"]

CMD ["catalina.sh", "run"]
