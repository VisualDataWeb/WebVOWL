###########
# WebVOWL #
###########

# Build stage: Build WebVOWL from source since WAR downloads are no longer available
FROM docker.io/library/node:18-alpine AS builder

# Build time arguments (WebVOWL version tag/branch)
ARG VERSION=master

# Install build dependencies
RUN apk add --no-cache git

# Clone WebVOWL repository
WORKDIR /build
RUN git clone --depth 1 --branch ${VERSION} https://github.com/VisualDataWeb/WebVOWL.git . || \
    git clone --depth 1 https://github.com/VisualDataWeb/WebVOWL.git .

# Install dependencies and build
RUN npm install && \
    npm run release

# Runtime stage: Tomcat server
# Option 1: Use JRE 8 Alpine (smaller but older Java - ~100MB)
# FROM docker.io/library/tomcat:9-jre8-alpine

# Option 2: Use JRE 17 LTS on Temurin (recommended, modern Java - ~250MB)
FROM docker.io/library/tomcat:9-jre17-temurin-noble

# Option 3: Use JRE 21 LTS on Temurin (latest LTS - ~250MB)
# FROM docker.io/library/tomcat:9-jre21-temurin-noble

# Re-declare ARG for this stage
ARG VERSION=master

# Add metadata labels
LABEL maintainer="WebVOWL"
LABEL description="WebVOWL - Web-based Visualization of Ontologies"
LABEL version="${VERSION}"

# Set working directory
WORKDIR /usr/local/tomcat

# Copy built files from builder stage
RUN rm -rf webapps/*
COPY --from=builder /build/deploy/ webapps/ROOT/

# Expose tomcat default port
EXPOSE 8080

# Add healthcheck (using curl which is available in Temurin images)
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
    CMD curl -f http://localhost:8080/ || exit 1

# Run as non-root user for security
USER nobody

# Run default server
CMD ["catalina.sh", "run"]