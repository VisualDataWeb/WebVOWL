###########
# WebVOWL #
###########

# Stage 1: Build OWL2VOWL converter from source
FROM docker.io/maven:3-openjdk-8-slim AS owl2vowl-builder

WORKDIR /owl2vowl

# Clone and build OWL2VOWL WAR
RUN apt-get update && \
    apt-get install -y git && \
    git clone https://github.com/VisualDataWeb/OWL2VOWL.git . && \
    mvn clean package -P war-release -DskipTests

# Stage 2: Build WebVOWL from source
FROM docker.io/node:12-alpine AS webvowl-builder

WORKDIR /build

# Copy package files
COPY package.json ./
COPY Gruntfile.js ./
COPY webpack.config.js ./

# Copy source code and configuration
COPY src ./src
COPY util ./util
COPY .jshintrc ./.jshintrc
COPY .jshintignore ./.jshintignore

# Install dependencies and build
RUN npm install && \
    npm run release

# Stage 3: Runtime - Deploy both to Tomcat
FROM docker.io/tomcat:9-jdk8-openjdk-slim

# Remove default webapps
RUN rm -rf /usr/local/tomcat/webapps/*

# First, deploy OWL2VOWL WAR as ROOT (this provides the servlets)
RUN mkdir -p /usr/local/tomcat/webapps/ROOT
COPY --from=owl2vowl-builder /owl2vowl/target/*.war /tmp/owl2vowl.war
RUN cd /usr/local/tomcat/webapps/ROOT && \
    jar -xf /tmp/owl2vowl.war && \
    rm /tmp/owl2vowl.war

# Then, copy WebVOWL static files into the same ROOT context
# This merges the static frontend with the backend servlets
COPY --from=webvowl-builder /build/deploy /usr/local/tomcat/webapps/ROOT/

# Expose port 8080
EXPOSE 8080

# Run Tomcat
CMD ["catalina.sh", "run"]