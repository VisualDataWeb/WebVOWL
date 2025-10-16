# WebVOWL + OWL2VOWL Quick Start Guide

## Current Status

You have WebVOWL and OWL2VOWL services running separately:
- WebVOWL: http://localhost:8080
- OWL2VOWL: http://localhost:8081

**Problem**: They run on different ports, so WebVOWL can't connect to OWL2VOWL due to browser same-origin policy.

## Solution: Use the Combined Image (Easiest)

A combined Docker image is currently building that includes both services with nginx routing.

### Once the build completes:

```bash
# Stop current services
podman-compose down

# Run the combined image
podman run -d --name webvowl -p 8080:80 webvowl:combined

# Access WebVOWL
# Open http://localhost:8080
```

### Testing the OWL2VOWL Connection:

1. Open http://localhost:8080 in your browser
2. Click "Ontology" → "Select ontology"
3. Go to the "IRI" tab
4. Enter: `http://purl.uniprot.org/core/`
5. Click "Visualize"

The ontology should now load successfully without errors!

---

## Alternative: Quick Fix for Current Setup

If you want to use the currently running services right now, you have two options:

### Option A: Host-based Nginx Proxy

Create a simple nginx config on your host machine:

```bash
# Install nginx if needed
sudo apt install nginx

# Create config
sudo tee /etc/nginx/sites-available/webvowl << 'EOF'
server {
    listen 8000;

    location / {
        proxy_pass http://localhost:8080;
    }

    location ~ ^/(convert|serverTimeStamp) {
        proxy_pass http://localhost:8081;
    }
}
EOF

# Enable and restart
sudo ln -s /etc/nginx/sites-available/webvowl /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl restart nginx

# Access at http://localhost:8000
```

### Option B: Browser CORS Extension (Development Only)

1. Install a CORS extension:
   - Chrome: "Allow CORS: Access-Control-Allow-Origin"
   - Firefox: "CORS Everywhere"

2. Enable the extension
3. Access http://localhost:8080
4. The extension will allow cross-origin requests to port 8081

**Warning**: Only use this for testing. Never browse other websites with CORS disabled!

---

## Files Overview

- `Dockerfile` - WebVOWL frontend only
- `Dockerfile.owl2vowl` - OWL2VOWL converter only
- `Dockerfile.combined` - **Both services in one container (recommended)**
- `docker-compose.yml` - Run services separately
- `PODMAN_SETUP.md` - Detailed Podman instructions
- `SOLUTION.md` - Technical explanation of the problem and solutions

## Managing Services

```bash
# View logs
podman logs webvowl
podman logs -f webvowl  # Follow logs

# Stop
podman stop webvowl

# Restart
podman restart webvowl

# Remove
podman rm -f webvowl

# Rebuild combined image
podman build --no-cache -t webvowl:combined -f Dockerfile.combined .
```

## Troubleshooting

### Combined image build fails
Check the build logs and ensure you have enough disk space (needs ~2GB during build).

### "Could not connect to OWL2VOWL service" error
This means WebVOWL can't reach the converter. Make sure you're using the combined image or one of the proxy solutions above.

### Port 8080 already in use
```bash
# Stop existing services
podman stop $(podman ps -q)

# Or use a different port
podman run -p 8090:80 webvowl:combined
```

### Services not starting
```bash
# Check logs
podman logs webvowl

# Check if containers are running
podman ps -a
```
