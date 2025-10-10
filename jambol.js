export default {
  async fetch(request) {
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Andre Cell</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700&family=Turret+Road:wght@700&display=swap" rel="stylesheet">
    <style>
        body {
            background-color: #0d1117;
            color: #c9d1d9;
            font-family: 'Orbitron', sans-serif;
        }
        .cyber-glow {
            text-shadow: 0 0 5px #00e0b7, 0 0 10px #00e0b7, 0 0 15px #00e0b7;
            color: #00e0b7;
        }
        .cyber-panel {
            background-color: rgba(22, 27, 34, 0.8);
            border: 1px solid #30363d;
            backdrop-filter: blur(5px);
            -webkit-backdrop-filter: blur(5px);
            box-shadow: 0 0 15px rgba(0, 224, 183, 0.1);
        }
        .cyber-button {
            background-color: transparent;
            border: 1px solid #00e0b7;
            color: #00e0b7;
            transition: all 0.3s ease;
            font-family: 'Turret Road', cursive;
            text-transform: uppercase;
        }
        .cyber-button:hover {
            background-color: rgba(0, 224, 183, 0.2);
            box-shadow: 0 0 15px rgba(0, 224, 183, 0.5);
        }
        .cyber-input {
            background-color: rgba(13, 17, 23, 0.5);
            border: 1px solid #30363d;
            color: #c9d1d9;
        }
        .cyber-input::placeholder {
            color: #8b949e;
        }
        .loading-text > p {
            font-family: 'Courier New', Courier, monospace;
            white-space: pre;
        }
    </style>
</head>
<body class="min-h-screen flex flex-col items-center justify-center p-4">

    <div class="w-full max-w-6xl mx-auto">
        <div class="text-center mb-4">
            <p class="text-xs uppercase">SELAMAT DATANG WAHAI PEMUJA GRATISAN 🤣 DAH PAKE AJA LAH GAES :v - SUPPORT UDP RELAY UNTUK GAMING</p>
        </div>
        <div class="cyber-panel rounded-lg p-4 mb-4 text-left text-xs loading-text">
            <p>ANDRE CELL SYSTEM</p>
            <p>CYBER PUNK LOADING SEQUENCE</p>
            <p class="text-green-400">> Initializing MASTER ANDRE CELL Proxy System...</p>
            <p class="text-green-400">> UDP Relay Activated for Gaming Support</p>
            <p class="text-green-400">> Booting secure connection protocol...</p>
        </div>

        <h1 class="text-5xl font-bold text-center my-6 cyber-glow" style="font-family: 'Turret Road', cursive;">MASTER ANDRE CELL</h1>
        
        <div class="text-center mb-6">
            <p class="text-sm">Modern Internet Cepat dan berkualitas dan terjaga dengan maksimal.</p>
            <p class="text-xs text-gray-400">High Performance Secure Connection Fast Setup UDP Gaming Support</p>
        </div>


        <div class="grid md:grid-cols-3 gap-4 mb-8">
            <div class="cyber-panel rounded-lg p-4 text-center">
                <p class="font-bold">WIB (Jakarta)</p>
                <p class="text-2xl" id="time-wib">00:00:00</p>
            </div>
            <div class="cyber-panel rounded-lg p-4 text-center">
                <p class="font-bold">WITA (Makassar)</p>
                <p class="text-2xl" id="time-wita">00:00:00</p>
            </div>
            <div class="cyber-panel rounded-lg p-4 text-center">
                <p class="font-bold">WIT (Jayapura)</p>
                <p class="text-2xl" id="time-wit">00:00:00</p>
            </div>
        </div>

        <div class="grid md:grid-cols-1 lg:grid-cols-3 gap-8">
            <div class="cyber-panel rounded-lg p-6 lg:col-span-2">
                <h2 class="text-xl font-semibold mb-4 cyber-glow">Connection Setup</h2>
                <div class="space-y-4">
                    <div class="grid grid-cols-2 gap-4 text-sm">
                        <p>UUID Generating...</p>
                        <p>Active Country Loading...</p>
                        <p>Server Loading...</p>
                        <p>Status <span class="text-green-400">● Active</span> Checking...</p>
                    </div>
                    <div class="flex gap-2">
                        <input type="text" placeholder="bug.com" class="w-full cyber-input rounded p-2">
                        <button class="cyber-button rounded px-4 py-2">Apply</button>
                    </div>
                    <button class="cyber-button rounded w-full px-4 py-2">Custom</button>
                    <textarea class="w-full cyber-input rounded p-2 h-24 text-xs" readonly>// Configuration will be generated here...</textarea>
                    <div class="flex gap-2">
                        <button class="cyber-button rounded px-4 py-2">Refresh</button>
                        <button class="cyber-button rounded px-4 py-2">Copy</button>
                        <button class="cyber-button rounded px-4 py-2">vless</button>
                    </div>
                </div>
            </div>

            <div class="cyber-panel rounded-lg p-6">
                <h2 class="text-xl font-semibold mb-4 cyber-glow">Connection Status</h2>
                <div class="space-y-4 text-sm">
                    <p>Current Ping: <span class="text-yellow-400">-- ms</span></p>
                    <p>Last Check: <span class="text-gray-400">Never</span></p>
                    <p>Server Uptime: <span class="text-gray-400">Calculating...</span></p>
                    <p>UDP Relay: <span class="text-green-400">● Active for Gaming</span></p>
                    <div class="flex gap-2 pt-4">
                        <button class="cyber-button rounded w-full py-2">Test Ping</button>
                        <button class="cyber-button rounded w-full py-2">Auto Ping</button>
                    </div>
                </div>
            </div>
        </div>
        
        <div class="cyber-panel rounded-lg p-6 mt-8">
            <h2 class="text-xl font-semibold mb-4 cyber-glow">Proxy Management</h2>
            <div class="flex justify-between items-center text-sm mb-4">
                 <p>Active Proxy: <span class="text-gray-400">Loading...</span></p>
                 <p>Proxy Pool: <span class="text-gray-400">Loading...</span></p>
                 <p>Auto Rotation: <span class="text-green-400">● Active (60s)</span></p>
            </div>
            <div class="h-32 cyber-input rounded p-2 overflow-y-auto text-xs">
                Loading proxy list...
            </div>
             <div class="flex gap-2 mt-4">
                <button class="cyber-button rounded px-4 py-2">Rotate</button>
                <button class="cyber-button rounded px-4 py-2">Refresh</button>
            </div>
        </div>

        <footer class="text-center mt-8 text-xs text-gray-500">
            <p>MASTER ANDRE CELL • Modern Internet Cepat dan berkualitas dan terjaga dengan maksimal.</p>
            <p class="font-bold">Powered by ANDRE CELL SYSTEM</p>
            <p>©®copyright by ANDRE CELL SYSTEM</p>
            <p>Secure proxy system with UDP relay support for gaming and real-time monitoring</p>
            <p class="text-green-400 mt-2">Operation completed successfully!</p>
        </footer>
    </div>

    <script>
        function updateClocks() {
            const now = new Date();

            // WIB (UTC+7)
            const wibTime = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Jakarta' }));
            const wibHours = wibTime.getHours().toString().padStart(2, '0');
            const wibMinutes = wibTime.getMinutes().toString().padStart(2, '0');
            const wibSeconds = wibTime.getSeconds().toString().padStart(2, '0');
            document.getElementById('time-wib').textContent = wibHours + ':' + wibMinutes + ':' + wibSeconds;

            // WITA (UTC+8)
            const witaTime = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Makassar' }));
            const witaHours = witaTime.getHours().toString().padStart(2, '0');
            const witaMinutes = witaTime.getMinutes().toString().padStart(2, '0');
            const witaSeconds = witaTime.getSeconds().toString().padStart(2, '0');
            document.getElementById('time-wita').textContent = witaHours + ':' + witaMinutes + ':' + witaSeconds;

            // WIT (UTC+9)
            const witTime = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Jayapura' }));
            const witHours = witTime.getHours().toString().padStart(2, '0');
            const witMinutes = witTime.getMinutes().toString().padStart(2, '0');
            const witSeconds = witTime.getSeconds().toString().padStart(2, '0');
            document.getElementById('time-wit').textContent = witHours + ':' + witMinutes + ':' + witSeconds;
        }

        setInterval(updateClocks, 1000);
        updateClocks(); // Initial call
    </script>
</body>
</html>
    `;
    return new Response(html, {
      headers: { 'Content-Type': 'text/html;charset=utf-8' },
    });
  },
};