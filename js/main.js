let cluster, allData;
const manifestURL = "data/manifest.json";
const map = L.map("map", { maxZoom: 18 }).setView([39, -98], 5);

// ESRI basemap using a public key (can be replaced later)
const layer = L.esri.Vector.vectorBasemapLayer("ArcGIS:Topographic", {
  apikey:
    "AAPK0bfa2556b4ac4284a310e6985efc4ae5pYNpvJ67IqNlYANJ4031LBMSxrep5AnzG6WREaLTdjqMGhyo5umNYpY1SMrqCGP4",
}).addTo(map);

function onEachFeature(feature, layer) {
  const p = feature.properties || {};
  const html = `
        <strong>${p.Title || "No title"}<strong><br/>
        <a href="${p.Link || "#"}" target="_blank">View Report</a>
    `;
  layer.bindPopup(html);
}

//Load GeoJSON sample data
fetch("data/sample-data.geojson")
  .then((r) => r.json())
  .then((data) => {
    allData = data;

fetch(manifestURL)
  .then(r => r.json())
  .then(list => Promise.all(list.map(u => fetch(u).then(r => r.json()))))
  .then(collections => {
    allData = {
      type: "FeatureCollection",
      features: collections.flatMap(c => c.features ?? [])
    };
    
    cluster = L.markerClusterGroup();
    map.addLayer(cluster);

    const bound = L.latLngBounds([]);
    if (cluster.getLayers().length) bound.extend(cluster.getBounds());
    if (polys.getLayers().length) bound.extend(polys.getBounds());
    if (bound.isValid()) map.fitBounds(bound);
  });

function runSearch() {
  const q = document.getElementById("search").value.trim().toLowerCase();

  cluster.clearLayers();
  map.removeLayer(polys);
  cluster.clearLayers();

  const matches = f =>
    q === "" || (f.properties?.Title || "").toLowerCase().includes(q);

  const pts = L.geoJSON(allData, {
    filter: f => f.geometry.type === "Point" && matches(f),
    onEachFeature,
    pointToLayer: (f, latlng) => L.marker(latlng),
  });
  cluster.addLayer(pts);

  polys = L.geoJSON(allData, {
    filter: f => f.geometry.type !== "Point" && matches(f),
    onEachFeature,
    style: { color: "steelblue", weight: 1, fillOpacity: 0.2 },
  });
  map.addLayer(polys);

  const b = L.latLngBounds([]);
  if (cluster.getLayers().length) b.extend(cluster.getBounds());
  if (polys.getLayers().length)   b.extend(polys.getBounds());
  if (b.isValid()) map.fitBounds(b);
}

document
  .getElementById("searchBtn")
  .addEventListener("click", runSearch);
document
  .getElementById("search")
  .addEventListener("keyup", e => { if (e.key === "Enter") runSearch(); });
