// WebSocket connection for real-time data
let ws = null;
let reconnectTimeout = null;
let sampleCount = 0;
let predCount = 0;
let predRateInterval = null;
let lastPredTime = Date.now();
let historyItems = [];
const MAX_HISTORY = 20;

// DOM elements
const elements = {
    statusDot: document.getElementById('statusDot'),
    statusText: document.getElementById('statusText'),
    gestureName: document.getElementById('gestureName'),
    confidenceFill: document.getElementById('confidenceFill'),
    confidenceValue: document.getElementById('confidenceValue'),
    gdpValue: document.getElementById('gdpValue'),
    gdpBar: document.getElementById('gdpBar'),
    sampleCount: document.getElementById('sampleCount'),
    predRate: document.getElementById('predRate'),
    thumbBar: document.getElementById('thumbBar'),
    thumbVal: document.getElementById('thumbVal'),
    indexBar: document.getElementById('indexBar'),
    indexVal: document.getElementById('indexVal'),
    middleBar: document.getElementById('middleBar'),
    middleVal: document.getElementById('middleVal'),
    ringBar: document.getElementById('ringBar'),
    ringVal: document.getElementById('ringVal'),
    pinkyBar: document.getElementById('pinkyBar'),
    pinkyVal: document.getElementById('pinkyVal'),
    accelX: document.getElementById('accelX'),
    accelY: document.getElementById('accelY'),
    accelZ: document.getElementById('accelZ'),
    gyroX: document.getElementById('gyroX'),
    gyroY: document.getElementById('gyroY'),
    gyroZ: document.getElementById('gyroZ'),
    historyList: document.getElementById('historyList')
};

// Initialize WebSocket connection
function connectWebSocket() {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    
    try {
        ws = new WebSocket(wsUrl);
        
        ws.onopen = () => {
            console.log('WebSocket connected');
            updateStatus('connected', 'Connected');
            clearTimeout(reconnectTimeout);
        };
        
        ws.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                handleData(data);
            } catch (e) {
                console.error('Failed to parse message:', e);
            }
        };
        
        ws.onerror = (error) => {
            console.error('WebSocket error:', error);
            updateStatus('error', 'Connection Error');
        };
        
        ws.onclose = () => {
            console.log('WebSocket disconnected');
            updateStatus('disconnected', 'Disconnected');
            reconnectTimeout = setTimeout(connectWebSocket, 3000);
        };
    } catch (e) {
        console.error('Failed to create WebSocket:', e);
        updateStatus('error', 'Connection Failed');
        reconnectTimeout = setTimeout(connectWebSocket, 5000);
    }
}

// Update connection status
function updateStatus(status, text) {
    elements.statusDot.className = `status-dot ${status}`;
    elements.statusText.textContent = text;
}

// Handle incoming data
function handleData(data) {
    // Mark as connected when receiving data
    if (elements.statusDot.className !== 'status-dot connected') {
        updateStatus('connected', 'Connected');
    }
    
    sampleCount++;
    elements.sampleCount.textContent = sampleCount.toLocaleString();
    
    // Update gesture display
    if (data.label && data.label !== 'unknown') {
        elements.gestureName.textContent = data.label;
        predCount++;
        addToHistory(data.label);
        
        // Calculate confidence (inverse of meanD, normalized)
        const confidence = data.meanD ? Math.max(0, Math.min(100, 100 - data.meanD * 10)) : 0;
        updateConfidence(confidence);
    }
    
    // Update GDP (motion metric)
    if (data.gdp !== undefined) {
        const gdp = parseFloat(data.gdp);
        elements.gdpValue.textContent = gdp.toFixed(1);
        const gdpPercent = Math.min(100, (gdp / 50) * 100);
        elements.gdpBar.style.width = `${gdpPercent}%`;
    }
    
    // Update flex sensors
    updateFlexSensor('thumb', data.f1);
    updateFlexSensor('index', data.f2);
    updateFlexSensor('middle', data.f3);
    updateFlexSensor('ring', data.f4);
    updateFlexSensor('pinky', data.f5);
    
    // Update IMU data
    if (data.ax !== undefined) elements.accelX.textContent = parseFloat(data.ax).toFixed(2);
    if (data.ay !== undefined) elements.accelY.textContent = parseFloat(data.ay).toFixed(2);
    if (data.az !== undefined) elements.accelZ.textContent = parseFloat(data.az).toFixed(2);
    if (data.gx !== undefined) elements.gyroX.textContent = parseFloat(data.gx).toFixed(1);
    if (data.gy !== undefined) elements.gyroY.textContent = parseFloat(data.gy).toFixed(1);
    if (data.gz !== undefined) elements.gyroZ.textContent = parseFloat(data.gz).toFixed(1);
}

// Update flex sensor display
function updateFlexSensor(name, value) {
    if (value === undefined) return;
    
    const val = parseFloat(value);
    const percent = Math.max(0, Math.min(100, val * 100));
    
    elements[`${name}Bar`].style.width = `${percent}%`;
    elements[`${name}Val`].textContent = (val * 100).toFixed(0) + '%';
}

// Update confidence display
function updateConfidence(confidence) {
    elements.confidenceFill.style.width = `${confidence}%`;
    elements.confidenceValue.textContent = `${confidence.toFixed(0)}%`;
}

// Add gesture to history
function addToHistory(gesture) {
    const now = new Date();
    const timeStr = now.toLocaleTimeString();
    
    historyItems.unshift({ gesture, time: timeStr });
    
    if (historyItems.length > MAX_HISTORY) {
        historyItems.pop();
    }
    
    renderHistory();
}

// Render history list
function renderHistory() {
    if (historyItems.length === 0) {
        elements.historyList.innerHTML = '<div class="history-empty">Waiting for gestures...</div>';
        return;
    }
    
    elements.historyList.innerHTML = historyItems.map(item => `
        <div class="history-item">
            <span class="history-gesture">${item.gesture}</span>
            <span class="history-time">${item.time}</span>
        </div>
    `).join('');
}

// Calculate prediction rate
function updatePredRate() {
    const now = Date.now();
    const elapsed = (now - lastPredTime) / 1000;
    
    if (elapsed > 0) {
        const rate = predCount / elapsed;
        elements.predRate.textContent = rate.toFixed(1);
    }
    
    predCount = 0;
    lastPredTime = now;
}

// Fallback: Poll REST endpoint if WebSocket fails
let pollInterval = null;
function startPolling() {
    if (pollInterval) return;
    
    pollInterval = setInterval(async () => {
        try {
            const response = await fetch('/data');
            if (response.ok) {
                const data = await response.json();
                handleData(data);
            }
        } catch (e) {
            console.error('Polling error:', e);
        }
    }, 100); // 10 Hz polling
}

function stopPolling() {
    if (pollInterval) {
        clearInterval(pollInterval);
        pollInterval = null;
    }
}

// Initialize on page load
window.addEventListener('DOMContentLoaded', () => {
    console.log('EchoSign Web UI initialized');
    
    // Try WebSocket first
    connectWebSocket();
    
    // Start prediction rate calculation
    predRateInterval = setInterval(updatePredRate, 1000);
    
    // Fallback to polling after 5 seconds if no WebSocket
    setTimeout(() => {
        if (ws && ws.readyState !== WebSocket.OPEN) {
            console.log('WebSocket not connected, falling back to polling');
            startPolling();
        }
    }, 5000);
});

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    if (ws) ws.close();
    stopPolling();
    if (predRateInterval) clearInterval(predRateInterval);
});