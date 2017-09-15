## What does the image contain and how does it work?

This image contents packed webvowl `*.war` file launched within Tomcat in *Linux 
alpine* environment. 

Additionally the image automatically converts all `owl` ontology file format into 
VOWL-dedicated `json` which might be presented by web server into the outside world.

The attached script detects changes of the `/data` directory using [inotify-tools](https://github.com/rvoicilas/inotify-tools/wiki).
In case of changed `owl`, `rdf` or `ttl` files it execute ([OWL2VOWL](https://github.com/VisualDataWeb/OWL2VOWL)) against them.


## How to use the image?

The most simplest use might be:

```
docker run --name some-webvowl -v /some/directory:/data -p 8080:8080 -d webvowl
```
