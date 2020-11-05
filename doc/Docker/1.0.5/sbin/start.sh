#!/bin/bash

DATA_DIR=/data
JAR_CMD=/usr/local/lib/OWL2VOWL.jar

catalina.sh start

inotifywait -rm --format "%f" -e modify,create --exclude 'log.txt' $DATA_DIR | while read filename ;
do
    if [[ ( ! ($filename =~ ^\.\# ||  $filename =~ ^\~ ) ) && ( ( $filename =~ \.owl$ || $filename =~ \.rdf$ ) || $filename =~ \.ttl$ ) ]]
    then
	cd $DATA_DIR
	java -jar $JAR_CMD -file $filename
    fi
done
