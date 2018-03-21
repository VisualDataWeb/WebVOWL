
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
        if (fullURL.indexOf("#")){
            resource=fullURL.substring(fullURL.lastIndexOf('#')+1);
            base=fullURL.substring(0,fullURL.length-resource.length);
            splitedURL.base=base;
            splitedURL.resource=resource;
        }else {
            resource = fullURL.substring(fullURL.lastIndexOf('/') + 1);
            base=fullURL.substring(0,fullURL.length-resource.length);
            splitedURL.base=base;
            splitedURL.resource=resource;
        }
        return splitedURL;
    }

    prefixRepresentationModule.getPrefixRepresentationForFullURI=function(fullURL){
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
        return fullURL;
    };


    return prefixRepresentationModule;
};


