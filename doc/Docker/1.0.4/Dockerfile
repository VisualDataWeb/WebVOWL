FROM tomcat:8.0-jre8-alpine

ENV version 1.0.4

ADD OWL2VOWL-*.jar /usr/local/lib

RUN apk update \
    && apk upgrade \
    && apk add --no-cache curl inotify-tools \
    && cd webapps \
    && rm -rf $CATALINA_HOME/webapps/docs/ \
    && rm -rf $CATALINA_HOME/webapps/examples/ \
    && curl -O http://downloads.visualdataweb.de/webvowl_${version}.war \
    && mv webvowl_${version}.war webvowl.war \
    && ln -s /usr/local/lib/OWL2VOWL-*.jar /usr/local/lib/OWL2VOWL.jar 


ADD sbin/ /usr/local/sbin

VOLUME "/data"

ENTRYPOINT start.sh
