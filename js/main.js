const map = L.map('map', { maxZoom: 18}).setView([39, -98], 5);

// ESRI basemap using a public key (can be replaced later)
const layer = L.esri.Vector.vectorBasemapLayer("ArcGIS:Topographic", {
    apikey: "AAPK0bfa2556b4ac4284a310e6985efc4ae5pYNpvJ67IqNlYANJ4031LBMSxrep5AnzG6WREaLTdjqMGhyo5umNYpY1SMrqCGP4"
}).addTo(map)

//Load GeoJSON sample data
fetch('data/sample-data.geojson')
    .then(r => r.json())
    .then(data => {

        const points = L.geoJSON(data, {
            filter: f => f.geometry.type == 'Point',
            onEachFeature,
            pointToLayer: (f, latlng) => L.marker(latlng)
        });
        const cluster = L.markerClusterGroup().addLayer(points);
        map.addLayer(cluster);
        
        const polys = L.geoJSON(data, {
            filter: f => f.geometry.type !=='Point'
            onEachFeature: 
            style: {color: 'steelblue', weight: 1, fillOpacity: 0.2}
        });
        map.addLayer(polys);

        map.fitBounds(L.featureGroung([cluster, polys]).getBounds());
    });