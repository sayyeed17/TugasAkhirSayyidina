// === INISIALISASI PETA ===
const map = L.map('mapid').setView([-6.7063, 108.5571], 13);

// === TILE LAYER (DARK) ===
L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
  attribution: '&copy; OpenStreetMap contributors & CartoDB',
  subdomains: 'abcd',
  maxZoom: 19
}).addTo(map);

// === KONTROL TAMBAHAN ===
L.control.scale().addTo(map);
L.Control.geocoder({ defaultMarkGeocode: true }).addTo(map);

// === STYLE PER LAYER DUMMY ===
const layerStyle = {
  bangunan: { color: 'red', weight: 2 },
  faskes: { color: 'green', weight: 2 },
  pemerintah: { color: 'blue', weight: 2 },
  lahan: { color: 'orange', weight: 2, fillOpacity: 0.4 },
  jalan: { color: 'gray', weight: 2 }
};

// === DUMMY DATA GEOJSON ===
const dummyFeature = (name, desc, coords) => ({
  type: "Feature",
  properties: { name, description: desc },
  geometry: { type: "Point", coordinates: coords }
});

const bangunanData = { type: "FeatureCollection", features: [ dummyFeature("Kantor Walikota", "Gedung Pemerintahan", [108.558, -6.7065]) ] };
const faskesData = { type: "FeatureCollection", features: [ dummyFeature("RSUD Gunung Jati", "Fasilitas Kesehatan", [108.5605, -6.709]) ] };
const pemerintahData = { type: "FeatureCollection", features: [ dummyFeature("Kantor Kecamatan", "Instansi Pemerintah", [108.554, -6.703]) ] };
const lahanData = { type: "FeatureCollection", features: [{
    type: "Feature", properties: { name: "Zona Industri", description: "Area penggunaan industri" },
    geometry: { type: "Polygon", coordinates: [[[108.556, -6.705], [108.558, -6.705], [108.558, -6.703], [108.556, -6.703], [108.556, -6.705]]] }
}] };
const jalanData = { type: "FeatureCollection", features: [{
    type: "Feature", properties: { name: "Jl. Cipto Mangunkusumo", description: "Jalan Utama Kota" },
    geometry: { type: "LineString", coordinates: [[108.552, -6.710], [108.559, -6.705]] }
}] };

// === HIGHLIGHT FEATURE ===
function highlightFeature(e) {
  const layer = e.target;
  layer.setStyle({ weight: 4, color: '#FFD166', dashArray: '', fillOpacity: 0.7 });
}
function resetHighlight(e) {
  const layer = e.target;
  geojson.resetStyle(layer);
}

// === LAYER BUILDER ===
const buildLayer = (data, style, icon) => L.geoJSON(data, {
  style: style,
  pointToLayer: (f, latlng) => L.circleMarker(latlng, { radius: 6, color: style.color }),
  onEachFeature: (f, l) => {
    l.bindPopup(`<b><i class="${icon}"></i> ${f.properties.name}</b><br>${f.properties.description}`);
    l.on({ mouseover: highlightFeature, mouseout: resetHighlight });
  }
});

const bangunanLayer = buildLayer(bangunanData, layerStyle.bangunan, 'fas fa-building');
const faskesLayer = buildLayer(faskesData, layerStyle.faskes, 'fas fa-hospital');
const pemerintahLayer = buildLayer(pemerintahData, layerStyle.pemerintah, 'fas fa-landmark');
const lahanLayer = L.geoJSON(lahanData, {
  style: layerStyle.lahan,
  onEachFeature: (f, l) => {
    l.bindPopup(`<b><i class="fas fa-industry"></i> ${f.properties.name}</b><br>${f.properties.description}`);
    l.on({ mouseover: highlightFeature, mouseout: resetHighlight });
  }
});
const jalanLayer = L.geoJSON(jalanData, {
  style: layerStyle.jalan,
  onEachFeature: (f, l) => {
    l.bindPopup(`<b><i class="fas fa-road"></i> ${f.properties.name}</b><br>${f.properties.description}`);
    l.on({ mouseover: highlightFeature, mouseout: resetHighlight });
  }
});

// === ADD DEFAULT LAYERS ===
bangunanLayer.addTo(map);
lahanLayer.addTo(map);

// === TOGGLE DUMMY LAYERS ===
const checkboxLayers = {
  "layer-bangunan": bangunanLayer,
  "layer-faskes": faskesLayer,
  "layer-pemerintah": pemerintahLayer,
  "layer-lahan": lahanLayer,
  "layer-jalan": jalanLayer
};
Object.keys(checkboxLayers).forEach(id => {
  const el = document.getElementById(id);
  if (el) {
    el.addEventListener("change", (e) => {
      e.target.checked ? checkboxLayers[id].addTo(map) : map.removeLayer(checkboxLayers[id]);
    });
  }
});

// === LOAD GEOJSON SHP KAMU ===
const shpFiles = {
  administrasi: 'C:\Kuliah tapi di c\SEMESTER 4\WEBGIS\Project UAS\Data SHP\Administrasi Kota Cirebon.geojson',
  bangunan: 'Data SHP/Bangunan.geojson',
  jalan: 'Data SHP/Jalan Utama.geojson',
  kesehatan: 'Data SHP/kesehatan.geojson',
  pendidikan: 'Data SHP/Pendidikan.geojson',
  ibadah: 'Data SHP/Sarana Ibadah.geojson'
};

const shpColors = {
  administrasi: 'purple',
  bangunan: 'red',
  jalan: 'gray',
  kesehatan: 'green',
  pendidikan: 'blue',
  ibadah: 'orange'
};

const shpLayers = {};

for (const [key, path] of Object.entries(shpFiles)) {
  fetch(path)
    .then(res => res.json())
    .then(data => {
      shpLayers[key] = L.geoJSON(data, {
        style: feature => ({
          color: shpColors[key],
          weight: 2,
          fillOpacity: 0.4
        }),
        pointToLayer: (feature, latlng) => {
          return L.circleMarker(latlng, {
            radius: 6,
            color: shpColors[key],
            fillOpacity: 0.8
          });
        },
        onEachFeature: (feature, layer) => {
          const props = feature.properties;
          let content = '<b>Informasi:</b><br>';
          for (const prop in props) {
            content += `${prop}: ${props[prop]}<br>`;
          }
          layer.bindPopup(content);
        }
      }).addTo(map);
    })
    .catch(err => console.error('Error loading', key, err));
}

// === LEGEND ===
const legend = L.control({ position: 'bottomright' });
legend.onAdd = function () {
  const div = L.DomUtil.create('div', 'legend');
  div.innerHTML = `
    <h4>Legenda</h4>
    <div class="legend-item"><div class="legend-color" style="background:blue;"></div> Pemerintahan</div>
    <div class="legend-item"><div class="legend-color" style="background:purple;"></div> Administrasi</div>
    <div class="legend-item"><div class="legend-color" style="background:red;"></div> Bangunan Penting</div>
    <div class="legend-item"><div class="legend-color" style="background:green;"></div> Fasilitas Kesehatan</div>
    <div class="legend-item"><div class="legend-color" style="background:blue;"></div> Fasilitas Pendidikan</div>
    <div class="legend-item"><div class="legend-color" style="background:orange;"></div> Sarana Ibadah</div>
    <div class="legend-item"><div class="legend-color" style="background:gray;"></div> Jalan Utama</div>
  `;
  return div;
};
legend.addTo(map);

// === RESET VIEW & DARK MODE CONTROL ===
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
  const resetBtn = document.getElementById('reset-view');
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      map.setView([-6.7063, 108.5571], 13);
    });
  }

  const darkToggle = document.getElementById('dark-mode-toggle');
  if (darkToggle) {
    darkToggle.addEventListener('change', (e) => {
      document.body.classList.toggle('dark-mode', e.target.checked);
      map.getContainer().classList.toggle('dark-mode', e.target.checked);
    });
  }
});

// === RESPONSIVE RESIZE ===
window.addEventListener('resize', () => {
  map.invalidateSize();
});
