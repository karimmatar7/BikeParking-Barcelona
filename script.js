// Setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
const isLocal = window.location.hostname === "127.0.0.1" || window.location.hostname === "localhost";

const apiBase = isLocal
  ? "http://localhost:3000"
  : window.location.origin; 


// Controls
const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.1;
controls.autoRotate = true;
controls.autoRotateSpeed = 0.2;

// Lighting
scene.add(new THREE.AmbientLight(0xffffff, 0.4));
const light = new THREE.DirectionalLight(0xffffff, 0.8);
light.position.set(10, 20, 10);
scene.add(light);

// Camera
camera.position.set(0, 25, 30);
camera.lookAt(0, 0, 0);

// Map plane
const loader = new THREE.TextureLoader();
loader.load('assets/img/barcelona.png', texture => {
  const kaart = new THREE.Mesh(
    new THREE.PlaneGeometry(75, 50),
    new THREE.MeshBasicMaterial({ map: texture, transparent: true, opacity: 0.85 })
  );
  kaart.rotation.x = -Math.PI / 2;
  kaart.position.y = 0.01;
  scene.add(kaart);
});

// Tooltip
const tooltip = document.createElement('div');
tooltip.style.position = 'absolute';
tooltip.style.background = 'rgba(0,0,0,0.75)';
tooltip.style.color = '#fff';
tooltip.style.padding = '6px 10px';
tooltip.style.borderRadius = '4px';
tooltip.style.pointerEvents = 'none';
tooltip.style.fontFamily = 'sans-serif';
tooltip.style.fontSize = '13px';
tooltip.style.display = 'none';
document.body.appendChild(tooltip);

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
let mouseX = 0;
let mouseY = 0;
window.addEventListener('mousemove', event => {
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
  mouseX = event.clientX;
  mouseY = event.clientY;
});

// Legend
const legend = document.createElement('div');
legend.style.position = 'absolute';
legend.style.bottom = '10px';
legend.style.right = '10px';
legend.style.background = '#000a';
legend.style.color = '#fff';
legend.style.padding = '8px 10px';
legend.style.borderRadius = '6px';
legend.style.fontFamily = 'sans-serif';
legend.innerHTML = `
  <div><span style="color:#ff3333;">■</span> Less than 5</div>
  <div><span style="color:#ffaa00;">■</span> 5 to 9</div>
  <div><span style="color:#33cc33;">■</span> 10 or more</div>
`;
document.body.appendChild(legend);

// Info panel
const infoPanel = document.getElementById('infoPanel');
const panelTitle = document.getElementById('panelTitle');
const panelDistrict = document.getElementById('panelDistrict');
const panelAddress = document.getElementById('panelAddress');
const panelType = document.getElementById('panelType');
const trendCanvas = document.getElementById('trendChart');
let chartInstance = null;

function showInfoPanel(bar) {
  const { name, district, address, type, timeline } = bar.userData;
  infoPanel.style.display = 'block';
  panelTitle.textContent = name;
  panelDistrict.textContent = `District: ${district}`;
  panelAddress.textContent = `Address: ${address}`;
  panelType.textContent = `Type: ${type}`;

  if (chartInstance) chartInstance.destroy();
  const ctx = trendCanvas.getContext('2d');
  chartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels: timeline.map((_, i) => `T${i + 1}`),
      datasets: [{
        label: 'Bike Count',
        data: timeline,
        backgroundColor: 'rgba(0, 170, 255, 0.2)',
        borderColor: '#00aaff',
        borderWidth: 2,
        fill: true,
        pointRadius: 3
      }]
    },
    options: {
      responsive: false,
      plugins: { legend: { display: false } },
      scales: { y: { beginAtZero: true } }
    }
  });
}

// Data & rendering
let bars = [];
let currentTimeIndex = 0;
const maxTime = 6;
let allData = [];
const districtSet = new Set();
const typeSet = new Set();

fetch(`${apiBase}/bike-parking`)
  .then(response => response.json())
  .then(apiData => {
    const records = apiData.result.records;

    const latTop = 41.515;
    const latBottom = 41.260;
    const lonLeft = 1.950;
    const lonRight = 2.330;
    const mapWidth = 75;
    const mapHeight = 50;
    const districtCounters = {};

    allData = records
      .filter(r => r.geo_epgs_4326_lat && r.geo_epgs_4326_lon)
      .map(record => {
        const lat = parseFloat(record.geo_epgs_4326_lat);
        const lon = parseFloat(record.geo_epgs_4326_lon);
        const district = record.addresses_district_name || "Onbekend";
        const name = record.name || "Onbekend";
        const address = (record.addresses_road_name || "") + " " + (record.addresses_start_street_number || "");
        const type = record.secondary_filters_name || "Onbekend";

        districtSet.add(district);
        typeSet.add(type);

        if (!districtCounters[district]) districtCounters[district] = 0;
        const count = districtCounters[district]++;
        const offsetX = (count % 3) * 0.4;
        const offsetZ = Math.floor(count / 3) * 0.4;

        const x = ((lon - lonLeft) / (lonRight - lonLeft) - 0.5) * mapWidth + offsetX;
        const z = -((lat - latBottom) / (latTop - latBottom) - 0.5) * mapHeight + offsetZ;

        const timeline = Array.from({ length: maxTime }, () => Math.floor(Math.random() * 15));

        return { name, district, address, type, x, z, timeline };
      });

    districtSet.forEach(d => {
      const opt = document.createElement('option');
      opt.value = d;
      opt.textContent = d;
      document.getElementById('districtSelect').appendChild(opt);
    });

    typeSet.forEach(t => {
      const opt = document.createElement('option');
      opt.value = t;
      opt.textContent = t;
      document.getElementById('typeSelect').appendChild(opt);
    });

    renderBars();
    setInterval(updateBars, 3000);
  });

function renderBars() {
  const districtFilter = document.getElementById('districtSelect').value;
  const typeFilter = document.getElementById('typeSelect').value;

  allData.forEach((d, i) => {
    const shouldShow =
      (districtFilter === 'all' || d.district === districtFilter) &&
      (typeFilter === 'all' || d.type === typeFilter);

    let bar = bars[i];
    if (!bar) {
      const value = d.timeline[currentTimeIndex];
      const height = value / 2;
      const color = value < 5 ? 0xff3333 : value < 10 ? 0xffaa00 : 0x33cc33;
      const material = new THREE.MeshStandardMaterial({ color });
      bar = new THREE.Mesh(new THREE.BoxGeometry(0.4, height, 0.4), material);
      bar.position.set(d.x, height / 2, d.z);
      bar.userData = { ...d, value };
      scene.add(bar);
      bars[i] = bar;
    }

    bar.visible = shouldShow;
  });
}

function updateBars() {
  currentTimeIndex = (currentTimeIndex + 1) % maxTime;

  bars.forEach(bar => {
    if (!bar.visible) return;

    const value = bar.userData.timeline[currentTimeIndex];
    const newHeight = value / 2;
    bar.scale.y = newHeight / (bar.geometry.parameters.height || 1);
    bar.position.y = newHeight / 2;
    bar.userData.value = value;

    const color = value < 5 ? 0xff3333 : value < 10 ? 0xffaa00 : 0x33cc33;
    bar.material.color.set(color);
  });
}

// Reset View
const resetBtn = document.getElementById('resetView');
resetBtn.addEventListener('click', () => {
  camera.position.set(0, 25, 30);
  controls.target.set(0, 0, 0);
  controls.update();
});

// Auto-zoom on district change
document.getElementById('districtSelect').addEventListener('change', () => {
  renderBars();
  const selected = districtSelect.value;
  if (selected !== 'all') {
    const relevant = allData.filter(d => d.district === selected);
    if (relevant.length > 0) {
      const avgX = relevant.reduce((sum, d) => sum + d.x, 0) / relevant.length;
      const avgZ = relevant.reduce((sum, d) => sum + d.z, 0) / relevant.length;
      controls.target.set(avgX, 0, avgZ);
      camera.position.set(avgX, 25, avgZ + 25);
      controls.update();
    }
  }
});

document.getElementById('typeSelect').addEventListener('change', renderBars);

// Animation loop
function animate() {
  requestAnimationFrame(animate);
  controls.update();
  raycaster.setFromCamera(mouse, camera);
  const visibleBars = bars.filter(b => b.visible);
  const intersects = raycaster.intersectObjects(visibleBars);

  bars.forEach(bar => {
    const value = bar.userData.value;
    const baseColor = value < 5 ? 0xff3333 : value < 10 ? 0xffaa00 : 0x33cc33;
    bar.material.color.set(baseColor);
  });

  if (intersects.length > 0) {
    const bar = intersects[0].object;
    bar.material.color.set(0x00aaff);
    const { name, value, district, type } = bar.userData;

    tooltip.innerHTML = `<strong>${name}</strong><br/>District: ${district}<br/>Type: ${type}<br/>Count: ${value}`;
    tooltip.style.left = mouseX + 10 + 'px';
    tooltip.style.top = mouseY + 10 + 'px';
    tooltip.style.display = 'block';

    showInfoPanel(bar);
  } else {
    tooltip.style.display = 'none';
  }

  renderer.render(scene, camera);
}

animate();