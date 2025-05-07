let cluster, allData;
const manifestURL = "data/manifest.json";
const map = L.map("map", { maxZoom: 18 }).setView([39, -98], 5);

// ESRI basemap using a public key (can be replaced later)
const layer = L.esri.Vector.vectorBasemapLayer("ArcGIS:Topographic", {
  apikey:
    "AAPK0bfa2556b4ac4284a310e6985efc4ae5pYNpvJ67IqNlYANJ4031LBMSxrep5AnzG6WREaLTdjqMGhyo5umNYpY1SMrqCGP4",
}).addTo(map);

function onEachFeature(feature, layer) {
  const props = feature.properties ?? {};

  const html = Object.entries(props)
    .map(([k, v]) => {
      if (k.toLowerCase() === "link") {
        return `<strong>${k}:</strong> <a href="${v}" target="_blank">${v}</a>`;
      }
      if (Array.isArray(v)) {
        return `<strong>${k}:</strong> ${v.join(", ")}`;
      }
      return `<strong>${k}:</strong> ${v}`;
    })
    .join("<br>");

  if (layer instanceof L.FeatureGroup) {
    layer.eachLayer((child) => child.bindPopup(html));
  } else {
    layer.bindPopup(html);
  }
}

//Load GeoJSON sample data
// fetch("data/sample-data.geojson")
//   .then((r) => r.json())
//   .then((data) => {
//     allData = data
//   };

fetch(manifestURL)
  .then((r) => r.json())
  .then((list) => Promise.all(list.map((u) => fetch(u).then((r) => r.json()))))
  .then((collections) => {
    allData = {
      type: "FeatureCollection",
      features: collections.flatMap((c) => c.features ?? []),
    };

    // cluster = L.markerClusterGroup();
    cluster = L.LayerGroup();
    map.addLayer(cluster);

    const bound = L.latLngBounds([]);
    if (cluster.getLayers().length) bound.extend(cluster.getBounds());
    if (bound.isValid()) map.fitBounds(bound);
  });

function runSearch() {
  if (!allData || !cluster) return;

  const q = document.getElementById("search").value.trim().toLowerCase();
  cluster.clearLayers();

  const matches = (f) =>
    q === "" || (f.properties?.Title || "").toLowerCase().includes(q);

  const pts = L.geoJSON(allData, {
    filter: (f) =>
      ["Point", "MultiPoint"].includes(f.geometry.type) && matches(f),
    onEachFeature,
    pointToLayer: (_, latlng) => L.marker(latlng),
  });

  cluster.addLayer(pts);

  const b = L.latLngBounds([]);
  if (cluster.getLayers().length) b.extend(cluster.getBounds());
  if (b.isValid()) map.fitBounds(b);
}

document.getElementById("searchBtn").addEventListener("click", runSearch);
document.getElementById("search").addEventListener("keyup", (e) => {
  if (e.key === "Enter") runSearch();
});
