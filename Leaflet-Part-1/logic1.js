// store URL  as queryURL
var dataURL = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_month.geojson";


// Performing  a GET request to the dataURL from https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_month.geojson
d3.json(dataURL).then(function(data){
    // after a  response, forward the data.features and data.features object to the createFeatures function.
    createFeatures(data.features);
  });
    

function createFeatures(earthquakeData, platesData){

    // provide each feature in a popup form describing the place and time of the earthquakes
    function onEachFeature(feature, layer){
        layer.bindPopup(`<h3>Where: ${feature.properties.place}</h3><hr><p>Time: ${new Date(feature.properties.time)}</p><hr><p>Magnitude: ${feature.properties.mag}</p><hr><p>Number of "Felt" Reports: ${feature.properties.felt}`);
    }

    // Creating a GeoJSON layer containing the features array on the earthquakeData object
    function createCircleMarker(feature, latlng){
       let options = {
        radius:feature.properties.mag*5,
        fillColor: chooseColor(feature.properties.mag),
        color: chooseColor(feature.properties.mag),
        weight: 1,
        opacity: 0.7,
        fillOpacity: 0.45
       } 
       return L.circleMarker(latlng,options);
    }
    // Creating a variable for earthquakes to accommodate latlng, each feature to popup, and cicrle radius/color/weight/opacity
    let earthquakes = L.geoJSON(earthquakeData, {
        onEachFeature: onEachFeature,
        pointToLayer: createCircleMarker
    });

    // provide earthquakes layer to the createMap function
    createMap(earthquakes);
}

// reflection of Earthquake magnitudes  using color schemes
function chooseColor(mag){
    switch(true){
        case(0.1<= mag && mag <= 4.0):
            return "#007abc";
        case (4 <= mag && mag <=8.0):
            return "#19BC00";
        case (8.0 <= mag && mag <=12):
            return "#B3BC00";
        case (12 <= mag && mag <= 16):
            return "#7D00BC";
        case (16 <= mag && mag <=20):
            return "#BC0600";
        default:
            return "#EDFFAE";
    }
}

// providing legend for describing the map
let legend = L.control({position: 'bottomright'});

legend.onAdd = function() {
    var div = L.DomUtil.create('div', 'info legend');
    var grades = [0.1, 4.0, 8.0, 12.0, 16.0, 20.0];
    var labels = [];
    var legendInfo = "<h4>Magnitude</h4>";

    div.innerHTML = legendInfo

    // coloring the label and legend  based on the magnitude using  looping
    for (var i = 0; i < grades.length; i++) {
          labels.push('<ul style="background-color:' + chooseColor(grades[i] + 1) + '"> <span>' + grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '' : '+') + '</span></ul>');
        }

      // add each label list item to the div under the <ul> tag
      div.innerHTML += "<ul>" + labels.join("") + "</ul>";
    
    return div;
  };


// Creating a map
function createMap(earthquakes) {
   // Define outdoors and graymap layers
   let streetstylemap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 15,
    id: "outdoors-v11",
    accessToken: API_KEY
  })

  let graymap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 20,
    id: "light-v10",
    accessToken: API_KEY
  });

  // Define a baseMaps object to store our base layers
  let baseMaps = {
    "Outdoors": streetstylemap,
    "Grayscale": graymap
  };

  // Creating overlay object to store our overlay layer
  let overlayMaps = {
    Earthquakes: earthquakes
  };

  // Creating the map, to provide the streetmap and earthquakes layers  display 
  let myMap = L.map("map", {
    center: [
      39.8282, -98.5795
    ],
    zoom: 4,
    layers: [streetstylemap, earthquakes]
  });
  // Add the layer control to the map
  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
  }).addTo(myMap);
  legend.addTo(myMap);
}

