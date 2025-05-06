import QRCode from 'qrcode';

console.log('iniciou');

// Configurações
const TARGET_COORD = [-27.64060437944407, -52.26935943212417]; // Exemplo: São Paulo
const PRECISION = 0.001; // ~111 metros

// Elementos
const mapElement = document.getElementById('map');
const arScene = document.getElementById('ar-scene');
const statusElement = document.getElementById('status');

// Mapa Leaflet
const map = L.map(mapElement).setView(TARGET_COORD, 15);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
L.marker(TARGET_COORD).addTo(map);

// Inicializar AR
function setupARScene() {
    arScene.innerHTML = `
        <a-scene 
            embedded 
            arjs="sourceType: webcam; trackingMethod: best;"
            renderer="logarithmicDepthBuffer: true;">
            
            <a-entity
                id="qrcode-entity"
                geometry="primitive: plane; width: 5; height: 5"
                material="transparent: true; opacity: 0.8"
                gps-entity-place="latitude: ${TARGET_COORD[0]}; longitude: ${TARGET_COORD[1]}"
                look-at="[gps-camera]">
            </a-entity>

            <a-camera gps-camera rotation-reader></a-camera>
        </a-scene>
    `;

    // Gerar QR Code como textura
    const canvas = document.createElement('canvas');
    QRCode.toCanvas(canvas, 'ponto1', { width: 256 }, () => {
        const texture = new THREE.CanvasTexture(canvas);
        const qrEntity = document.getElementById('qrcode-entity');
        qrEntity.setAttribute('material', 'src', canvas.toDataURL());
    });

    arScene.style.display = 'block';
}

// Monitorar geolocalização
navigator.geolocation.watchPosition(
    position => {
        const userPos = [position.coords.latitude, position.coords.longitude];
        const distance = Math.sqrt(
            Math.pow(userPos[0] - TARGET_COORD[0], 2) +
            Math.pow(userPos[1] - TARGET_COORD[1], 2)
        );

        if (distance < PRECISION) {
            statusElement.textContent = "Posição correta! Aponte a câmera para o QRCode AR";
            setupARScene();
        } else {
            arScene.style.display = 'none';
            statusElement.textContent = "Aproxime-se do marcador no mapa";
        }
    },
    error => console.error(error),
    { enableHighAccuracy: true }
);