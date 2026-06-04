WebVOWL [![Build Status](https://travis-ci.org/VisualDataWeb/WebVOWL.svg?branch=master)](https://travis-ci.org/VisualDataWeb/WebVOWL)
=======

> [!CAUTION]
> The URL https://visualdataweb.org/ is not owned bei VisualDataWeb anymore! Not related to WebVOWL anymore.
> 🌐 The new link to WebVOWL is:  https://service.tib.eu/webvowl/ 

This repository was ported from an internal SVN repository to Github after the release of WebVOWL 0.4.0. Due to cleanups with `git filter-branch`, the commit history might show some strange effects.

Run Using Docker
------------
The legacy root `Dockerfile` downloaded a WAR from `vowl.visualdataweb.org` (broken; see issue #212).

Clone **WebVOWL** only. The image build fetches [OWL2VOWL](https://github.com/VisualDataWeb/OWL2VOWL) from GitHub (no second local clone):

```bash
docker compose build && docker compose up -d
```

**Frontend only** (no `/convert`; faster build):

```bash
docker compose -f docker-compose.frontend.yml up -d --build
```

Pin converter source: `OWL2VOWL_GIT_REF=v0.3.7 docker compose build` (branch or tag on `VisualDataWeb/OWL2VOWL`).

See [docker/README.md](docker/README.md) and [docs/adr/0001-docker-local-development.md](docs/adr/0001-docker-local-development.md).

Visit [http://localhost:8080](http://localhost:8080).

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
