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
const criticalTemperatureCelsius = 16.67; // Temperature threshold of interest
const criticalDepthMeters = 13;        // Depth threshold of interest

var depths = [];
var temperatures = [];
var criticalDepths = [];
var transect;
var rows = 0;
var columns = 0;
var layers = 0;

function getResults(url) {
    // !!!!! TEMPORARY READ FROM STATIC FILE
    // !!!!! REPLACE WITH xmlHTTPRequest

    var responseText = textFileToArray('data/Lake_Erie_-_Nowcast_-_3D_-_Current_Year_best.ncd.txt');

    var strDepthsSplit = responseText[depthsStart].replace(/]/g, '[').split("[");
    if (strDepthsSplit[0] != "depth") {
        alert("Expected 'depth[][]', found '" + responseText[depthsStart] + "'!");
    }
    else {

        // Read depths

        rows = parseInt(strDepthsSplit[1]);
        columns = parseInt(strDepthsSplit[3]);

        for (i = 0; i < rows; i++) {
            depths.push(responseText[depthsStart + 1 + i].replace(/ /g, '').split(",").slice(1, columns));
        }

        // Check for temperatures

        var tempsStart = depthsStart + parseInt(strDepthsSplit[1]) + 2;
        var strTempsSplit = responseText[tempsStart].replace(/]/g, '[').split("[");
        if (strTempsSplit[0] != "temp") {
            alert("Expected 'temp[][]', found '" + responseText[tempsStart] + "'!");
        }
        else {

            // Read temperatures

            layers = parseInt(strTempsSplit[3]);
            for (i = 0; i < layers; i++) {
                var layer = [];
                for (j = 0; j < rows; j++) {
                    tempsStart++;
                    layer.push(responseText[tempsStart].replace(/ /g, '').split(",").slice(1, columns));
                }
                temperatures.push(layer);
            }

            // Build depth to critical temperature

            for (var i = 0; i < rows; i++) {
                for (var j = 0; j < columns - 1; j++) {
                    var result;
                    if (depths[i][j] == "0.0")
                        result = null;
                    else if (temperatures[0][i][j] < 14.44)
                        result = 0.0;
                    else if (temperatures[layers - 1][i][j] > criticalTemperatureCelsius)
                        result = 66;
                    else {
                        for (var k = 0; (k < columns) && (temperatures[k][i][j] > criticalTemperatureCelsius); k++) ;
                        result = depths[i][j] * k / 20;
                    }
                    criticalDepths.push([j, i, result]);
                }
            }

            // Build example transect

            transect = buildTransect(22, 55, 50, 100);
            transect = buildTransect(22, 9, 33, 23);
            transect = buildTransect(67,121,55,152);

        }

    }

}

// ----- Build profile at (r,c) for transect
//

function addProfile(result, r, c, count) {

    if (depths[r][c] > 0.0) {
        result.push([count, 0, temperatures[0][r][c]]);
        for (var d = 1; d < 66; d++) {
            var sigma = (d / depths[r][c]);
            if (sigma >= 0.95) {
                value = null;
            }
            else {
                var sigmaIndex = Math.floor(sigma * 20);
                value = parseFloat(temperatures[sigmaIndex][r][c])
                    + (20 * sigma - sigmaIndex) * (temperatures[sigmaIndex + 1][r][c] - temperatures[sigmaIndex][r][c]);
                }
            result.push([count, d, value])
        }
    }

    return result;
}

// ----- Build transect
//

function buildTransect(r1, c1, r2, c2) {

    var result = [];
    var dr = r2 - r1;
    var dc = c2 - c1;
    var c, r;
    if (dr > dc) {
        c = c1;
        for (r = r1; r <= r2; r++) {
            result = addProfile(result, r, Math.floor(c + 0.5), r - r1);
            c += dc / dr;
        }
    }
    else {
        r = r1;
        for (c = c1; c <= c2; c++) {
            result = addProfile(result, Math.floor(r + 0.5), c, c - c1);
            r += dr / dc;
        }
    }
    //alert(result);
    return result;
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
