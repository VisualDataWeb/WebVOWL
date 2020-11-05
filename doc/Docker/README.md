# WebVOWL Docker image

This directory contains [Docker](https://docs.docker.com/) images of the [WebVOWL](https://github.com/VisualDataWeb/WebVOWL) project.

## Tags

Hereafter the list of available tags:

Tag     | Description                   | Source
------- | ----------------------------- | ------------------------------------------
latest  | The latest WebVOWL version    |  [1.0.6/Dockerfile](./1.0.6/Dockerfile)
1.0.6   | The 1.0.6 WebVOWL version     |  [1.0.6/Dockerfile](./1.0.6/Dockerfile)
1.0.5   | The 1.0.5 WebVOWL version     |  [1.0.5/Dockerfile](./1.0.5/Dockerfile)
1.0.4   | The 1.0.4 WebVOWL version     |  [1.0.4/Dockerfile](./1.0.4/Dockerfile)

## What does the images contain and how does it work?

This images contents packed webvowl `*.war` file launched within [Apache Tomcat](http://tomcat.apache.org/) in [Linux 
alpine](https://hub.docker.com/_/alpine/) environment.

Additionally the image automatically converts all `owl` ontology file format into 
VOWL-dedicated `json` which might be presented by web server into the outside world.

The attached script detects changes of the `/data` directory using [inotify-tools](https://github.com/rvoicilas/inotify-tools/wiki).
In case of changed `owl`, `rdf` or `ttl` files it execute ([OWL2VOWL](https://github.com/VisualDataWeb/OWL2VOWL)) against them.

## How to use the images?

WebVOWL images are deployed into the public [Docker hub registry](https://hub.docker.com/r/abourdon/webvowl/), so the most simplest use might be:

```bash
docker run --name webvowl -v /some/directory:/data -p 8080:8080 -d abourdon/webvowl:latest
```

Once executed, WebVOWL instance can be reached by browsing the following URL:

    http://<docker host>:8080/webvowl/
    
Where `<docker host>` is your actual Docker host (`localhost` by default if using Docker native version). Note also the necessary trailing `/`.

If you want to run a specific WebVOWL version, simply change to its associated tag. For instance, if you want to use the [1.0.6](./1.0.6/Dockerfile) version, run:

```bash
docker run --name webvowl-1.0.6 -v /some/directory:/data -p 8080:8080 -d abourdon/webvowl:1.0.6
```

_Note: WebVOWL images are currently hosted by the [abourdon Docker repository](https://hub.docker.com/r/abourdon/) but will be updated soon to be hosted by the official VisualDataWeb one. See this [issue](https://github.com/VisualDataWeb/WebVOWL/issues/111) for more details._ 
