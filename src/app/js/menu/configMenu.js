module.exports = function (graph) {
    var configMenu = {},
        checkboxes = [];


    configMenu.setup = function () {
        var menuEntry= d3.select("#m_modes");
        menuEntry.on("mouseover",function(){
            var searchMenu=graph.options().searchMenu();
            searchMenu.hideSearchEntries();
        });
        addCheckBox("showZoomSlider","Show Zoom Slider","#zoomSliderOption",graph.options().zoomSlider().showSlider,0);
        addCheckBox("editorMode","Editor Mode (experimental)","#editMode",graph.editorMode,0);

    };


    function addCheckBox(identifier, modeName, selector,onChangeFunc,updateLvl) {
        var configOptionContainer = d3.select(selector)
            .append("div")
            .classed("checkboxContainer", true);
        var configCheckbox = configOptionContainer.append("input")
            .classed("moduleCheckbox", true)
            .attr("id", identifier + "ConfigCheckbox")
            .attr("type", "checkbox")
            .property("checked", onChangeFunc());


        configCheckbox.on("click", function (silent) {
            var isEnabled = configCheckbox.property("checked");
            onChangeFunc(isEnabled);
            if (silent !== true) {
                // updating graph when silent is false or the parameter is not given.
                if (updateLvl===1) {
                    graph.lazyRefresh();
                    //graph.redrawWithoutForce
                }
                if (updateLvl===2){
                    graph.update();
                }
                if (updateLvl===3){
                    graph.changeShapeAnimation();
                }
                if (updateLvl===4){
                    graph.changeThingMultiplication();
                }
            }

        });
        checkboxes.push(configCheckbox);
        configOptionContainer.append("label")
            .attr("for", identifier + "ConfigCheckbox")
            .text(modeName);
    }

    configMenu.setCheckBoxValue=function(identifier,value){
        for (var i = 0; i < checkboxes.length; i++) {
            var cbdId = checkboxes[i].attr("id");
            if (cbdId === identifier) {
                checkboxes[i].property("checked", value);
                break;
            }
        }
    };

    configMenu.getCheckBoxValue = function (id) {
        for (var i = 0; i < checkboxes.length; i++) {
            var cbdId = checkboxes[i].attr("id");
            if (cbdId === id) {
                return checkboxes[i].property("checked");
            }
        }
    };

    configMenu.updateSettings = function () {
        var silent = true;
        checkboxes.forEach(function (checkbox) {
            checkbox.on("click")(silent);
        });
    };


    return configMenu;
};
