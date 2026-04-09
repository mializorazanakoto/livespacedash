const API_URL = 'https://lldev.thespacedevs.com/2.2.0/launch/upcoming/?limit=10';

// Global state
let nextLaunchDate = null;

// Initialize the dashboard
document.addEventListener('DOMContentLoaded', () => {
    createStars();
    fetchLaunches();
});

/**
 * Starry background generator
 */
function createStars() {
    const container = document.getElementById('starsContainer');
    const count = 150;
    
    for (let i = 0; i < count; i++) {
        const star = document.createElement('div');
        star.className = 'star';
        
        const x = Math.random() * 100;
        const y = Math.random() * 100;
        const size = Math.random() * 2 + 1;
        const duration = Math.random() * 3 + 2;
        
        star.style.left = `${x}%`;
        star.style.top = `${y}%`;
        star.style.width = `${size}px`;
        star.style.height = `${size}px`;
        star.style.setProperty('--duration', `${duration}s`);
        
        container.appendChild(star);
    }
}

/**
 * Fetch data from Launch Library 2
 */
async function fetchLaunches() {
    try {
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error('Orbital uplink failed');
        
        const data = await response.json();
        const launches = data.results;

        if (launches.length > 0) {
            setupFeaturedLaunch(launches[0]);
            renderLaunchGrid(launches.slice(1));
        }
    } catch (error) {
        console.error('Launch fetch error:', error);
        document.getElementById('heroMissionName').textContent = 'Uplink Error. Check Telemetry.';
    }
}

/**
 * Setup the main hero launch
 */
function setupFeaturedLaunch(launch) {
    const missionName = launch.name.split('|')[1] || launch.name;
    document.getElementById('heroMissionName').textContent = missionName;
    
    nextLaunchDate = new Date(launch.net).getTime();
    
    const detailsContainer = document.getElementById('heroDetails');
    detailsContainer.innerHTML = `
        <div style="font-size: 1.1rem; color: var(--text-secondary); margin-top: 1rem;">
            <strong>${launch.rocket.configuration.full_name}</strong> &bull; ${launch.pad.location.name}
        </div>
    `;

    // Start countdown
    setInterval(updateCountdown, 1000);
    updateCountdown();
}

/**
 * Update the countdown timer
 */
function updateCountdown() {
    if (!nextLaunchDate) return;

    const now = new Date().getTime();
    const distance = nextLaunchDate - now;

    if (distance < 0) {
        document.getElementById('countdown').innerHTML = "LIFTOFF!";
        return;
    }

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    document.getElementById('days').textContent = days.toString().padStart(2, '0');
    document.getElementById('hours').textContent = hours.toString().padStart(2, '0');
    document.getElementById('minutes').textContent = minutes.toString().padStart(2, '0');
    document.getElementById('seconds').textContent = seconds.toString().padStart(2, '0');
}

/**
 * Render items in the grid
 */
function renderLaunchGrid(launches) {
    const grid = document.getElementById('launchGrid');
    grid.innerHTML = '';

    launches.forEach(launch => {
        const dateStr = new Date(launch.net).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });

        const missionName = launch.name.split('|')[1]?.trim() || launch.name;
        const rocketName = launch.rocket.configuration.full_name;
        const location = launch.pad.location.name;
        const imageUrl = launch.image || 'https://images.unsplash.com/photo-1517976487492-5750f3195933?auto=format&fit=crop&q=80&w=1000';

        const card = document.createElement('div');
        card.className = 'launch-card';
        card.innerHTML = `
            <div class="card-image" style="background-image: url('${imageUrl}')"></div>
            <div class="card-date">${dateStr}</div>
            <h3 class="card-title">${missionName}</h3>
            <div class="card-info">
                <span>🚀 ${rocketName}</span>
                <span>📍 ${location}</span>
            </div>
            <div class="badge">${launch.status.name}</div>
        `;

        grid.appendChild(card);
    });
}
