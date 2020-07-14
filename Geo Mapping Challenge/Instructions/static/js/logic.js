// earthquake geojson
let queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/2.5_month.geojson";
// API link to fetch geojson data of earthquakes
var APIlink_plates = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json";


//define a function to scale the magnitdue
function markerSize(magnitude) {
    return magnitude * 3;
};

// Get request to the query URL
d3.json(queryUrl, function(data) {
    // Send the data.features object to the createEarthquakes function
   console.log(data);
   createEarthquakes(data.features);
   
    // Setting the number of 'ticks' or frames that will be displayed on the map
    steps: 2000
  });

// Get request to the plates URL
d3.json(APIlink_plates, function(data) {
    // Send the data features object to the createEarthquakes function
   console.log(data);
   createPlates(data);
});


  // function on magnitude color
  function adjustColor(magnitude){
    let GreenScaler = 300 - Math.round(magnitude * 40)
    return `rgb(66, ${GreenScaler}, 88)`
  }


  function createEarthquakes(earthquakeData){  
  // Define a function to run once for each feature 
  // Give each feature a popup describing the place and time of the earthquake
  function onEachQuake(feature, layer) {
    layer.bindPopup("<h3>" + feature.properties.place +
      "</h3><hr><p>" + new Date(feature.properties.time) + "</p>" + 
      "</h3><hr><p>" + "Magnitude: " + feature.properties.mag + "</p>");
    
        };

  // Create a GeoJSON layer containing the features array on the earthquakeData object
  // Run the onEachQuake function once for each piece of data in the array
  let earthquakes = L.geoJSON(earthquakeData, {
    pointToLayer: function(geoJsonPoint, latlng){
        return L.circleMarker(latlng, { radius: markerSize(geoJsonPoint.properties.mag) });
    },

    style: function (geoJsonFeature) {
        return {
            fillColor: adjustColor(geoJsonFeature.properties.mag),
            fillOpacity: 0.7,
            weight: 0.1,
            color: 'black'

        }
    },

    onEachQuake: onEachQuake,
    
  });

// Send earthquakes layer to the createMap function
createMap(earthquakes);

};


// create a layer group for faultlines

let tectonicplates = new L.LayerGroup();

function createPlates(PlateData){
    function onEachPlate(feature, layer){
        layer.bindPopup("<h3> Plate A: " + feature.properties.PlateA + "Plate B: " + feature.properties.PlateB +  "</h3>");
          };
    L.geoJSON(PlateData,{
        color: "#F26157",
        weight: 1.5
        }).addTo(tectonicplates);

        // add layer to map
      tectonicplates.addTo(map)
    };


    var API_KEY = "pk.eyJ1IjoieWxpa2hvbmluYSIsImEiOiJja2NqaXR3dTcwdWlkMndvZWN6dDRzdGEyIn0.pS9YGytyxAc8YOrfQxHgMQ"; 

function createMap(earthquakes){
    console.log('creating map...');

    let accessToken = "access_token={API_KEY}";

    let streetmap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/light-v9/tiles/256/{z}/{x}/{y}?access_token={accessToken}", {
      accessToken: API_KEY
    }),
    
     darkMap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/dark-v9/tiles/256/{z}/{x}/{y}?access_token={accessToken}", {
      accessToken: API_KEY
    }),
    
     highContrastMap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/outdoors-v10/tiles/256/{z}/{x}/{y}?access_token={accessToken}", {
      accessToken: API_KEY
    }),
    
     SatelliteMap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/satellite-v9/tiles/256/{z}/{x}/{y}?access_token={accessToken}", {
      accessToken: API_KEY
    });



    let baseMaps = {
        "Street Map": streetmap,
        "Dark map": darkMap,
        "Satellite map": SatelliteMap,
        "High Contrast map": highContrastMap
    };

    //console.log("baseMaps", baseMaps)
    
    let overlayMaps = {
        Earthquakes: earthquakes,
        "Tectonic Plates": tectonicplates 
        
    };
    //console.log('overlayMaps', overlayMaps)

    // Create a map object
    let myMap = L.map("map", {
      center: [37.09, -95.71],
      zoom: 5,
      layers: [streetmap, earthquakes]
    });

    // Create a layer control
  // Pass in baseMaps and overlayMaps
  // Add the layer control to the map
    L.control.layers(baseMaps, overlayMaps).addTo(myMap);

    
    // create legend
    let legend = L.control({position:"bottomleft"});

    legend.onAdd = function(map) {

        let div = L.DomUtil.create('div'),
            // the magintude keys to be displayed on DOM   
            keys = [0, 1, 2, 3, 4, 5, 6],
            labels = [];

        div.innerHTML += "<h5 style='margin:2px background-color: bisque;'>Magnitude</h5>"
        
        for (let i = 0; i < keys.length; i++){
            div.innerHTML += '<i style="width:10px; height:10px; margin-right:5px; background-color:'+ adjustColor(keys[i]) + '">___</i>' + 
            keys[i] + (keys[i + 1] ? '&ndash;' + keys[i + 1] + '<br>': '+');
        }
    
        return div;

    };
    legend.addTo(myMap);


};