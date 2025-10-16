WebVOWL [![Build Status](https://travis-ci.org/VisualDataWeb/WebVOWL.svg?branch=master)](https://travis-ci.org/VisualDataWeb/WebVOWL)
=======

> [!CAUTION]
> The URL https://visualdataweb.org/ is not owned bei VisualDataWeb anymore! Not related to WebVOWL anymore.

This repository was ported from an internal SVN repository to Github after the release of WebVOWL 0.4.0. Due to cleanups with `git filter-branch`, the commit history might show some strange effects.

Run Using Docker
------------

### Quick Start (Recommended - All-in-One Container)

Build and run WebVOWL with integrated OWL2VOWL converter in a single container:

```bash
# Build combined image (WebVOWL + OWL2VOWL + nginx)
docker build -t webvowl:combined -f Dockerfile.combined .

# Run container
docker run -d --name webvowl -p 8080:80 webvowl:combined

# Access WebVOWL
# Visit http://localhost:8080
```

This image includes:
- **WebVOWL** frontend visualization
- **OWL2VOWL** converter service (for loading ontologies from IRIs)
- **Nginx** reverse proxy (routing requests between services)

All services are built from source using multi-stage builds, eliminating dependency on external WAR file downloads.

### Alternative: Separate Services

Run WebVOWL and OWL2VOWL as separate containers:

```bash
docker-compose up -d
```

This starts:
- WebVOWL on port 8080
- OWL2VOWL on port 8081

**Note:** See [PODMAN_SETUP.md](PODMAN_SETUP.md) for detailed instructions on connecting separate services.

### Podman Support

All Docker commands work with Podman. Simply replace `docker` with `podman`:

```bash
podman build -t webvowl:combined -f Dockerfile.combined .
podman run -d --name webvowl -p 8080:80 webvowl:combined
```

For detailed Podman instructions, see [PODMAN_SETUP.md](PODMAN_SETUP.md).

Requirements
------------

Node.js for installing the development tools and dependencies.


Development setup
-----------------

### Simple ###
1. Download and install Node.js from http://nodejs.org/download/
2. Open the terminal in the root directory
3. Run `npm install` to install the dependencies and build the project
4. Edit the code
5. Run `npm run-script release` to (re-)build all necessary files into the deploy directory
6. Run `serve deploy/` to run the server locally, by installing serve by using `npm install serve -g`.

Visit [http://localhost:3000](http://localhost:3000) to use WebVOWL.

### Advanced ###
Instead of the last step of the simple setup, install the npm package `grunt-cli` globally with
`npm install grunt-cli -g`. Now you can execute a few more advanced commands in the terminal:

* `grunt` or `grunt release` builds the release files into the deploy directory
* `grunt package` builds the development version
* `grunt webserver` starts a local live-updating webserver with the current development version
* `grunt test` starts the test runner
* `grunt zip` builds the project and puts it into a zip file


Additional information
----------------------

To export the VOWL visualization to an SVG image, all css styles have to be included into the SVG code.
This means that if you change the CSS code in the `vowl.css` file, you also have to update the code that
inlines the styles - otherwise the exported SVG will not look the same as the displayed graph.

The tool which creates the code that inlines the styles can be found in the util directory. Please
follow the instructions in its [README](util/VowlCssToD3RuleConverter/README.md) file.
