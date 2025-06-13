// === INISIALISASI PETA ===
var map = L.map('mapid').setView([-6.7063, 108.5571], 13);

// === TILE LAYER DARK ===
L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
  attribution: '&copy; OpenStreetMap contributors & CartoDB',
  subdomains: 'abcd',
  maxZoom: 19
}).addTo(map);

// === KONTROL TAMBAHAN ===
L.control.scale().addTo(map);
L.Control.geocoder({ defaultMarkGeocode: true }).addTo(map);

// === KONFIGURASI FILE SHP ===
const shpFiles = {
  Administrasi: 'ASSETS/Administrasi Kota Cirebon.geojson',
  Bangunan: 'ASSETS/Bangunan.geojson',
  JalanUtama: 'ASSETS/Jalan Utama.geojson',
  Kesehatan: 'ASSETS/Pendidikan.geojson',
  Pendidikan: 'ASSETS/Pendidikan.geojson',
  SaranaIbadah: 'ASSETS/Sarana Ibadah.geojson'
};

const shpIcons = {
  Administrasi: 'fas fa-administrative',
  Bangunan: 'fas fa-building',
  JalanUtama: 'fas fa-road',
  Kesehatan: 'fas fa-health',
  Pendidikan: 'fas fa-education',
  SaranaIbadah: 'fas fa-church'
};

const shpColors = {
  Administrasi: 'black',
  Bangunan: 'gray',
  JalanUtama: 'black',
  Kesehatan: 'green',
  Pendidikan: 'blue',
  SaranaIbadah: 'orange'
};

// === PENYIMPAN LAYER ===
const shpLayers = {};

// === BANGUN LAYER GEOJSON ===
function buildGeoLayer(key, data) {
  const color = shpColors[key];
  const icon = shpIcons[key];

  return L.geoJSON(data, {
    style: feature => ({
      color: color,
      weight: 2,
      fillOpacity: 0.4
    }),
    pointToLayer: (feature, latlng) => {
      return L.circleMarker(latlng, {
        radius: 6,
        color: color,
        fillOpacity: 0.8
      });
    },
    onEachFeature: (feature, layer) => {
      const props = feature.properties;
      let content = `<b><i class="${icon}"></i> ${props.name || 'Fitur'}</b><br>`;
      for (const p in props) {
        content += `${p}: ${props[p]}<br>`;
      }
      layer.bindPopup(content);
    }
  });
}

// === LOAD GEOJSON & SINKRON DENGAN CHECKBOX ===
for (const [key, path] of Object.entries(shpFiles)) {
  fetch(path)
    .then(res => res.json())
    .then(data => {
      const layer = buildGeoLayer(key, data);
      shpLayers[key] = layer;

      // Default ditampilkan di peta
      layer.addTo(map);

      // Sinkronisasi dengan checkbox kontrol layer
      const checkbox = document.getElementById(`layer-${key}`);
      if (checkbox) {
        checkbox.checked = true;
        checkbox.addEventListener("change", (e) => {
          e.target.checked ? layer.addTo(map) : map.removeLayer(layer);
        });
      }
    })
    .catch(err => console.error(`Error loading ${key}:`, err));
}

// === LEGEND / KETERANGAN PETA ===
const legend = L.control({ position: 'bottomright' });
legend.onAdd = function () {
  const div = L.DomUtil.create('div', 'legend');
  div.innerHTML = `
    <h4>Legenda</h4>
    ${Object.entries(shpColors).map(([key, color]) => `
      <div class="legend-item">
        <div class="legend-color" style="background:${color};"></div>
        ${key.charAt(0).toUpperCase() + key.slice(1)}
      </div>
    `).join('')}
  `;
  return div;
};
legend.addTo(map);

// === RESET VIEW & DARK MODE TOGGLE ===
const extraControl = L.control({ position: 'topright' });
extraControl.onAdd = function () {
  const div = L.DomUtil.create('div', 'info legend');
  div.innerHTML = `
    <button id="reset-view" class="control-btn">Reset View</button>
    <label style="margin-left:8px;">
      <input type="checkbox" id="dark-mode-toggle"> Dark Mode
    </label>
  `;
  L.DomEvent.disableClickPropagation(div);
  return div;
};
extraControl.addTo(map);

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('reset-view')?.addEventListener('click', () => {
    map.setView([-6.7063, 108.5571], 13);
  });

  document.getElementById('dark-mode-toggle')?.addEventListener('change', (e) => {
    document.body.classList.toggle('dark-mode', e.target.checked);
    map.getContainer().classList.toggle('dark-mode', e.target.checked);
  });
});

// === RESPONSIVE LAYOUT FIX ===
window.addEventListener('resize', () => map.invalidateSize());
