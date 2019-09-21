//  json links
earthquake_url = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson"
tectomic_url = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json"

// get json response
d3.json(earthquake_url, function(response) {
    createFeatures(response.features);
});

// create function for markers
function createFeatures(feature) {

    function onEachFeature (feature, layer) {
            layer.bindPopup("<h3 Location: " + feature.properties.place +
            "<br> Magnitude: " + feature.properties.mag +
            "</h3><hr><p>" + new Date(feature.properties.time) +"</p>");
    }

    function getRadius(magnitude) {
        return magnitude * 20000;
    }
    function getColor(magnitude) {
        return magnitude > 5 ? '#ff3333' :
               magnitude > 4 ? '#ff6633' :
               magnitude > 3 ? '#ff9933' :
               magnitude > 2 ? '#ffcc33' :
               magnitude > 1 ? '#ffff33' :
                           '#ccff33';
    }

    var earthquakes = L.geoJson(feature, {
        pointToLayer: function(feature, coord) {
            return L.circle(coord,
                {radius: getRadius(feature.properties.mag),
                fillColor: getColor(feature.properties.mag),
                fillOpacity: .7,
                stroke: true,
                color: "blue",
                weight:.5
            });
        },
        onEachFeature: onEachFeature
    });

    createMap(earthquakes);
}

function createMap(earthquakes) {
  // Define outdoormap, satellitemap, and grayscalemap layers
  var outdoors = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.outdoors",
    accessToken: API_KEY
  });

  var satellite = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.satellite",
    accessToken: API_KEY
  });

  var grayscale = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.light",
    accessToken: API_KEY
  });

    var baseMaps = {
        "Satellite" : satellite,
        "Grayscale": grayscale,
        "Outdoors": outdoors
        };

    var  faultline = new L.LayerGroup();

    var overlays = {
        "Fault Lines": faultline,
        "Earthquakes": earthquakes
        };

    var myMap = L.map("map", {
        center: [36.78, -119.25],
        zoom: 5,
        layers: [
                satellite, 
                earthquakes, 
                faultline
            ]
        });

    d3.json(tectomic_url, function(tectoData) {
        L.geoJson(tectoData, {
                color: "orange",
                weight: 2
        })
        .addTo(faultline)
    });

    L.control.layers(baseMaps, overlays, {
        collapsed: true
    }).addTo(myMap);

    function getColor(grade) {
        return grade > 5 ? '#ff3333' :
               grade > 4 ? '#ff6633' :
               grade > 3 ? '#ff9933' :
               grade > 2 ? '#ffcc33' :
               grade > 1 ? '#ffff33' :
                           '#ccff33';

    };

    var legend = L.control({
            position: "bottomright"
        });

    legend.onAdd = function (myMap) {

        var div = L.DomUtil.create("div", "legend"),
                grades = [0, 1, 2, 3, 4, 5],
                labels = [];

        for (var i = 0; i < grades.length; i++) {
            div.innerHTML += '<i style = "background: ' + getColor(grades[i] + 1) 
                + '"></i> ' + grades[i] + (grades[i+1] ? '&ndash;' 
                + grades[i+1] + '<br>' : '+');
            }

        return div;
        };

        legend.addTo(myMap);
    }

    


