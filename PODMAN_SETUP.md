# WebVOWL with Podman Setup

This guide explains how to run WebVOWL with OWL2VOWL converter using Podman.

## Recommended: All-in-One Combined Image

The easiest way to run WebVOWL with OWL2VOWL is using the combined Dockerfile that includes both services and nginx in a single container.

### Build and Run:
```bash
# Build the combined image
podman build -t webvowl:combined -f Dockerfile.combined .

# Run the container
podman run -d --name webvowl -p 8080:80 webvowl:combined

# Access WebVOWL
# Open http://localhost:8080
```

This image includes:
- WebVOWL frontend (served by nginx)
- OWL2VOWL converter (running on Tomcat)
- Nginx reverse proxy (combining both services)

---

## Alternative: Separate Services Architecture

If you prefer running services separately:

### Architecture

The setup consists of two services:
1. **WebVOWL** - Visualization frontend (port 8080)
2. **OWL2VOWL** - Ontology converter service (port 8081)

## Quick Start with Podman Compose

### Install podman-compose (if needed):
```bash
pip install podman-compose
```

### Build and run all services:
```bash
podman-compose build
podman-compose up -d
```

### Access WebVOWL:
Open [http://localhost:8080](http://localhost:8080)

### Stop services:
```bash
podman-compose down
```

---

## Manual Podman Setup (without podman-compose)

### Step 1: Create a network
```bash
podman network create webvowl-network
```

### Step 2: Build the images
```bash
# Build WebVOWL
podman build -t webvowl:latest -f Dockerfile .

# Build OWL2VOWL
podman build -t owl2vowl:latest -f Dockerfile.owl2vowl .
```

### Step 3: Run the services
```bash
# Run OWL2VOWL converter
podman run -d \
    --name owl2vowl \
    --network webvowl-network \
    owl2vowl:latest

# Run WebVOWL frontend
podman run -d \
    --name webvowl \
    --network webvowl-network \
    webvowl:latest

# Run Nginx reverse proxy
podman run -d \
    --name webvowl-nginx \
    --network webvowl-network \
    -p 8080:80 \
    -v ./nginx.conf:/etc/nginx/nginx.conf:ro \
    docker.io/library/nginx:alpine
```

### Step 4: Access the application
Open [http://localhost:8080](http://localhost:8080)

---

## Managing Services

### View logs:
```bash
# WebVOWL logs
podman logs webvowl

# OWL2VOWL logs
podman logs owl2vowl

# Nginx logs
podman logs webvowl-nginx

# Follow logs in real-time
podman logs -f webvowl
```

### Stop services:
```bash
podman stop webvowl-nginx webvowl owl2vowl
```

### Start services:
```bash
podman start owl2vowl webvowl webvowl-nginx
```

### Remove services:
```bash
podman rm -f webvowl-nginx webvowl owl2vowl
podman network rm webvowl-network
```

### Rebuild after changes:
```bash
# Remove old containers and images
podman rm -f webvowl-nginx webvowl owl2vowl
podman rmi webvowl:latest owl2vowl:latest

# Rebuild
podman build -t webvowl:latest -f Dockerfile .
podman build -t owl2vowl:latest -f Dockerfile.owl2vowl .

# Run again (Step 3)
```

---

## Troubleshooting

### OWL2VOWL service not connecting:
1. Check if all containers are running:
   ```bash
   podman ps
   ```

2. Check nginx logs:
   ```bash
   podman logs webvowl-nginx
   ```

3. Test OWL2VOWL directly:
   ```bash
   podman exec owl2vowl curl -f http://localhost:8080/serverTimeStamp
   ```

### Build issues:
- Make sure you have enough disk space
- Try with `--no-cache` flag:
  ```bash
  podman build --no-cache -t webvowl:latest -f Dockerfile .
  ```

### Port already in use:
```bash
# Check what's using port 8080
sudo lsof -i :8080

# Or use a different port
podman run -p 8090:80 ...
```

---

## Building Specific Versions

You can build specific versions from GitHub releases:

```bash
# Build WebVOWL v1.1.6
podman build --build-arg VERSION=v1.1.6 -t webvowl:1.1.6 -f Dockerfile .

# Build OWL2VOWL specific version
podman build --build-arg VERSION=v0.3.5 -t owl2vowl:0.3.5 -f Dockerfile.owl2vowl .
```

---

## Using Podman Pod (Alternative)

You can also run all services in a single Podman pod:

```bash
# Create pod with port mapping
podman pod create --name webvowl-pod -p 8080:80

# Run containers in the pod
podman run -d --pod webvowl-pod --name owl2vowl owl2vowl:latest
podman run -d --pod webvowl-pod --name webvowl webvowl:latest
podman run -d --pod webvowl-pod --name nginx \
    -v ./nginx.conf:/etc/nginx/nginx.conf:ro \
    docker.io/library/nginx:alpine

# Stop the entire pod
podman pod stop webvowl-pod

# Start the pod
podman pod start webvowl-pod

# Remove the pod
podman pod rm -f webvowl-pod
```
