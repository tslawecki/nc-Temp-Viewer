/**
 * Created by tslawecki on 9/15/2017.
 */


//
// OUTLINE:
//
// ----- (Select lake)
//
// ----- (Set resolution)
//
// ----- (Set critical temperature)
//

// ----- Read latest time
//
function getTimeInfo(url) {
    var timeIndex = 0;
    var timeStamp = "a time";
    return ([timeIndex, timeStamp]);

}

// ----- Read results
//

function textFileToArray(filename) {
    var reader = (window.XMLHttpRequest != null )
        ? new XMLHttpRequest()
        : new ActiveXObject("Microsoft.XMLHTTP");
    reader.open("GET", filename, false);
    reader.send();
    return ( reader.responseText.split(/\r?\n/) );
}

const depthsStart = 5;
const tempsStart = 96;
var depths = [];
var temperatures = [];

function getResults(url) {
    // !!!!! TEMPORARY READ FROM STATIC FILE
    // !!!!! REPLACE WITH xmlHTTPRequest

    var responseText = textFileToArray('data/Lake_Erie_-_Nowcast_-_3D_-_Current_Year_best.ncd.txt');

    var strDepthsSplit;
    strDepthsSplit = responseText[depthsStart].replace(/]/g, '[').split("[");
    if (strDepthsSplit[0] != "depth") {
        alert("Expected 'depth[][]', found '" + responseText[depthsStart] + "'!");
    }
    else {
        for (i = 0; i < strDepthsSplit[1]; i++) {
            depths.push(responseText[depthsStart + 1 + i].split(",").slice(1, strDepthsSplit[3]));
        }
    }


}

// ----- Translate from sigma coordinate to actual depths and interpolate temperatures, calculate depth to critical
//
// ----- Display
//
// ----- Respond to UI
//

// ----- MAIN

var timeInfo = getTimeInfo();
getResults("");
