const socket = io();

socket.on('connect', () => {
    console.log('Connected to server');
});

socket.on('connect_error', (error) => {
    console.error('Connection Error:', error);
});

if (navigator.geolocation) {
    navigator.geolocation.watchPosition(
        (position) => {
            const { latitude, longitude } = position.coords;
            socket.emit('send-location', { latitude, longitude });
            console.log('Location sent');
        },
        (error) => {
            console.error('Geolocation Error:', error);
        },
        {
            enableHighAccuracy: true,
            timeout: 3000,
            maximumAge: 0,
        }
    );
} else {
    console.error('Geolocation is not supported by this browser.');
}

const map = L.map('map').setView([0, 0], 20);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: 'OpenStreetMap',
}).addTo(map);

const markers = {};
let lastUpdate = 0;

socket.on('receive-location', (data) => {
    const { id, latitude, longitude } = data;

    if (Date.now() - lastUpdate > 1000) { 
        map.setView([latitude, longitude], 20);
        lastUpdate = Date.now();
    }

    if (markers[id]) {
        markers[id].setLatLng([latitude, longitude]);
    } else {
        markers[id] = L.marker([latitude, longitude]).addTo(map);
    }
});

socket.on('user-disconnected', (id) => {
    if (markers[id]) {
        map.removeLayer(markers[id]);
        delete markers[id];
    }
});
