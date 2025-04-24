const map = L.map('map', { maxZoom: 18}).setView([39, -98], 5);

// ESRI basemap using a public key (can be replaced later)
const layer = L.esri.Vector.vectorBasemapLayer("ArcGIS:Topographic", {
    apikey: "AAPK0bfa2556b4ac4284a310e6985efc4ae5pYNpvJ67IqNlYANJ4031LBMSxrep5AnzG6WREaLTdjqMGhyo5umNYpY1SMrqCGP4"
}).addTo(map)

//Load GeoJSON sample data
fetch('data/sample-data.geojson')
    .then(response => response.json())
    .then(data => {
        const geoJsonLayer = L.geoJSON(data, {
            onEachFeature: (feature, layer) => {
                const props = feature.properties || {}; //fallback to empty object
                
                const popupContent = `
                    <strong>${props.Title || 'NO TITLE'}</strong><br/>
                    <a href="${props.Link || '#'}" target="_blank">View Report</a>
                `;
                    layer.bindPopup(popupContent);
    }
        });

const cluster = L.markerClusterGroup();
cluster.addLayer(geoJsonLayer);
map.addLayer(cluster);
map.fitBounds(cluster.getBounds());
    });
