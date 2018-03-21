
module.exports =  function (graph) {
    /** variable defs **/
    var prefixRepresentationModule={};

    var currentPrefixModel;

    prefixRepresentationModule.updatePrefixModel=function(){
        currentPrefixModel=graph.options().prefixList();
    };




    function splitURLIntoBaseAndResource(fullURL){

        var splitedURL={base:"",resource:""};
        var resource,base;
        // check if there is a last hashTag
        if (fullURL.indexOf("#")>-1){
            console.log("THIS HAS a # inside it oO ");
            resource=fullURL.substring(fullURL.lastIndexOf('#')+1);
            base=fullURL.substring(0,fullURL.length-resource.length);


            // overwrite base if it is ontologyIri;
            if (base===graph.options().getGeneralMetaObjectProperty('iri')){
                base=":";
            }
            splitedURL.base=base;
            splitedURL.resource=resource;
        }else {
            resource = fullURL.substring(fullURL.lastIndexOf('/') + 1);
            base=fullURL.substring(0,fullURL.length-resource.length);
            // overwrite base if it is ontologyIri;
            if (base===graph.options().getGeneralMetaObjectProperty('iri')){
                base=":";
            }
            splitedURL.base=base;
            splitedURL.resource=resource;
        }
        return splitedURL;
    }

    prefixRepresentationModule.getPrefixRepresentationForFullURI=function(fullURL){
        prefixRepresentationModule.updatePrefixModel();
        var splittedURL=splitURLIntoBaseAndResource(fullURL);

        // lazy approach , for
        // loop over prefix model
        for (var name in currentPrefixModel){
            if (currentPrefixModel.hasOwnProperty(name)){
                // THIS IS CASE SENSITIVE!
                if (currentPrefixModel[name]===splittedURL.base){
                    return name+":"+splittedURL.resource;
                }
            }
        }

        if (splittedURL.base===":"){
            return ":"+splittedURL.resource;
        }

        return fullURL;
    };


    return prefixRepresentationModule;
};


