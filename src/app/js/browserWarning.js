/* Taken from here: http://stackoverflow.com/a/17907562 */
function getInternetExplorerVersion(){
  var ua,
    re,
    rv = -1;
  
  // check for edge
  var isEdge = /(?:\b(MS)?IE\s+|\bTrident\/7\.0;.*\s+rv:|\bEdge\/)(\d+)/.test(navigator.userAgent);
  if ( isEdge ) {
    rv = parseInt("12");
    return rv;
  }
  
  var isIE11 = /Trident.*rv[ :]*11\./.test(navigator.userAgent);
  if ( isIE11 ) {
    rv = parseInt("11");
    return rv;
  }
  if ( navigator.appName === "Microsoft Internet Explorer" ) {
    ua = navigator.userAgent;
    re = new RegExp("MSIE ([0-9]{1,}[\\.0-9]{0,})");
    if ( re.exec(ua) !== null ) {
      rv = parseFloat(RegExp.$1);
    }
  } else if ( navigator.appName === "Netscape" ) {
    ua = navigator.userAgent;
    re = new RegExp("Trident/.*rv:([0-9]{1,}[\\.0-9]{0,})");
    if ( re.exec(ua) !== null ) {
      rv = parseFloat(RegExp.$1);
    }
  }
  return rv;
}

function showBrowserWarningIfRequired(){
  var version = getInternetExplorerVersion();
  console.log("Browser Version =" + version);
  if ( version > 0 && version <= 11 ) {
    d3.select("#browserCheck").classed("hidden", false);
    d3.select("#killWarning").classed("hidden", true);
    d3.select("#optionsArea").classed("hidden", true);
    d3.select("#logo").classed("hidden", true);
  }
  if ( version == 12 ) {
    d3.select("#logo").classed("hidden", false);
    d3.select("#browserCheck").classed("hidden", false);
    // connect the button;
    var pb_kill = d3.select("#killWarning");
    pb_kill.on("click", function (){
      console.log("hide the warning please");
      d3.select("#browserCheck").classed("hidden", true);
      d3.select("#logo").style("padding", "10px");
    });
  }
  else {
    d3.select("#logo").classed("hidden", false);
    d3.select("#browserCheck").classed("hidden", true);
  }
  
}

module.exports = showBrowserWarningIfRequired;
showBrowserWarningIfRequired();