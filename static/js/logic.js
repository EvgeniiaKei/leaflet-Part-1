let Sydney = [-33.54, 150.57];
let mapZoomlevel = 3;

// All earthquakes past 7 days
// Store our USGS API endpoint as queryUrl.
const url = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";
// Once we get a response, send the data.features object to the createFeatures function.
d3.json(url).then(function(data) {
    createFeatures(data.features);
});

// CREATING FEATURES FUNCTIONS
function createFeatures(earthquakeData) {

    // Define a function that we want to run once for each feature in the features array.
    // Give each feature a popup that describes the place and time of the earthquake.
    function onEachFeature(feature, layer) {
        layer.bindPopup(`<h3>${"Magnitude: "}${feature.properties.mag}${" Depth: "}${feature.geometry.coordinates[2]}<p>${"Location: "}${feature.properties.place}
            </p></h3><hr><p>${"Date & Time: "}${new Date(feature.properties.time)}</p>`);
    }

    //This function determines the radius of the earthquake marker based on its magnitude.
    // Earthquakes with a magnitude of 0 will be plotted with a radius of 1.
    function getRadius(magnitude) { return magnitude * 4 }

    // Changing marker to Circle marker, size depends on magnitude & color depends on depth 
     let earthquakes = L.geoJSON(earthquakeData, {
        pointToLayer: function(feature, latlng) {
            return new L.CircleMarker(latlng, {
                opacity: 1,
                fillOpacity: 0.8,
                fillColor: getColor(feature.geometry.coordinates[2]),
                radius: getRadius(feature.properties.mag),
                color: "black",
                stroke: true,
                weight: 0.5
            });
        },
        onEachFeature: onEachFeature
    });

    // Send our earthquakes layer to the createMap function/
    createMap(earthquakes);
}


// Creating Color palette based on depth & creating the legend
// This function determines the color of the circle based on the depth of the earthquake.
function getColor(depth) {
    if (depth < 10) { return "#ff0000" }
    if (depth < 30) { return "#d4ee00" }
    if (depth < 50) { return "#b1c700" }
    if (depth < 70) { return "#8ea000" }
    if (depth < 90) { return "#6b7800" }
    return "#485100";

}

// Create a legend control object.
let legend = L.control({ position: "bottomright" });

// Define function when legend is added
legend.onAdd = function() {
    let div = L.DomUtil.create("div", "info legend");
    let depth = [-10, 10, 30, 50, 70, 90];
        div.innerHTML += "<h3 style='text-align: center'>Depth(km)</h3>"
    
    // Loop through depth, and create a new legend object
    for (let i = 0; i < depth.length; i++) {
        div.innerHTML += '<i style="background:' + getColor(depth[i] + 1) + '"></i> ' + depth[i] + (depth[i + 1] ? '&ndash;' + depth[i + 1] + '<br>' : '+');
    }
        return div;
};

// CREATING MAP FUNCTION with layers & objects
function createMap(earthquakes) {

    // Create the base Street Map layers.
    let street = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    })

    // Create the Topographic Map layers.
    let topo = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
        attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
    });

    // Create a baseMaps object.
    let baseMaps = { "Street Map": street, "Topographic Map": topo };

    // Create an overlay object.
    let overlayMaps = { Earthquakes: earthquakes };

    // Create our map, giving it the streetmap and earthquakes layers to display on load.
    let myMap = L.map("map", { center: Sydney, zoom: mapZoomlevel, layers: [street, earthquakes] });

    // Add the layer control to the map. 
    // Pass it our baseMaps and overlayMaps.   
    L.control.layers(baseMaps, overlayMaps, { collapsed: false }).addTo(myMap);
    legend.addTo(myMap);



};