import { connect } from "cloudflare:sockets";

// Variables
const rootDomain = "foolvpn.me"; // Ganti dengan domain utama kalian
const serviceName = "nautica"; // Ganti dengan nama workers kalian
const apiKey = ""; // Ganti dengan Global API key kalian (https://dash.cloudflare.com/profile/api-tokens)
const apiEmail = ""; // Ganti dengan email yang kalian gunakan
const accountID = ""; // Ganti dengan Account ID kalian (https://dash.cloudflare.com -> Klik domain yang kalian gunakan)
const zoneID = ""; // Ganti dengan Zone ID kalian (https://dash.cloudflare.com -> Klik domain yang kalian gunakan)
let isApiReady = false;
let prxIP = "";
let cachedPrxList = [];

// Constant
const horse = "dHJvamFu";
const flash = "dmxlc3M=";
const v2 = "djJyYXk=";
const neko = "Y2xhc2g=";

const APP_DOMAIN = `${serviceName}.${rootDomain}`;
const PORTS = [443, 80];
const PROTOCOLS = [atob(horse), atob(flash), "ss"];
const KV_PRX_URL = "https://raw.githubusercontent.com/FoolVPN-ID/Nautica/refs/heads/main/kvProxyList.json";
const PRX_BANK_URL = "https://raw.githubusercontent.com/FoolVPN-ID/Nautica/refs/heads/main/proxyList.txt";
const DNS_SERVER_ADDRESS = "8.8.8.8";
const DNS_SERVER_PORT = 53;
const PRX_HEALTH_CHECK_API = "https://id1.foolvpn.me/api/v1/check";
const CONVERTER_URL = "https://api.foolvpn.me/convert";
const DONATE_LINK = "https://trakteer.id/dickymuliafiqri/tip";
const BAD_WORDS_LIST =
  "https://gist.githubusercontent.com/adierebel/a69396d79b787b84d89b45002cb37cd6/raw/6df5f8728b18699496ad588b3953931078ab9cf1/kata-kasar.txt";
const PRX_PER_PAGE = 24;
const WS_READY_STATE_OPEN = 1;
const WS_READY_STATE_CLOSING = 2;
const CORS_HEADER_OPTIONS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET,HEAD,POST,OPTIONS",
  "Access-Control-Max-Age": "86400",
};

// HTML Template Class
class Document {
  constructor(request) {
    this.request = request;
    this.title = "";
    this.infos = [];
    this.prxs = [];
    this.pageButtons = [];
    this.hostname = request.headers.get("Host") || APP_DOMAIN;
  }

  setTitle(title) {
    this.title = title;
  }

  addInfo(info) {
    this.infos.push(info);
  }

  registerPrxs(prxInfo, prxUris) {
    this.prxs.push({
      info: prxInfo,
      uris: prxUris
    });
  }

  addPageButton(text, href, disabled = false) {
    this.pageButtons.push({
      text,
      href,
      disabled
    });
  }

  build() {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${this.title.replace(/<[^>]*>/g, '')} - Nautica VPN</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <style>
        * {
            font-family: 'Inter', sans-serif;
        }
        .glass-effect {
            background: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(20px);
            border: 1px solid rgba(255, 255, 255, 0.2);
        }
        .glass-card {
            background: rgba(255, 255, 255, 0.08);
            backdrop-filter: blur(25px);
            border: 1px solid rgba(255, 255, 255, 0.15);
            box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.2);
        }
        .gradient-bg {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 25%, #f093fb 50%, #f5576c 75%, #4facfe 100%);
            background-size: 400% 400%;
            animation: gradientShift 15s ease infinite;
        }
        .gradient-text {
            background: linear-gradient(135deg, #667eea, #764ba2, #f093fb, #f5576c, #4facfe);
            background-size: 400% 400%;
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            animation: gradientShift 8s ease infinite;
        }
        @keyframes gradientShift {
            0% { background-position: 0% 50% }
            50% { background-position: 100% 50% }
            100% { background-position: 0% 50% }
        }
        .copy-btn {
            transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
            background: linear-gradient(135deg, #667eea, #764ba2);
        }
        .copy-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 12px 25px -8px rgba(102, 126, 234, 0.4);
        }
        .copy-btn.copied {
            background: linear-gradient(135deg, #10b981, #059669);
        }
        .prx-card {
            transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
            background: rgba(255, 255, 255, 0.05);
            backdrop-filter: blur(20px);
            border: 1px solid rgba(255, 255, 255, 0.1);
        }
        .prx-card:hover {
            transform: translateY(-8px) scale(1.02);
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.4);
            border: 1px solid rgba(255, 255, 255, 0.3);
            background: rgba(255, 255, 255, 0.1);
        }
        .fade-in {
            animation: fadeInUp 0.8s ease-out;
        }
        .stagger-animation > * {
            opacity: 0;
            animation: fadeInUp 0.8s ease-out forwards;
        }
        @keyframes fadeInUp {
            from {
                opacity: 0;
                transform: translateY(30px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        .floating {
            animation: floating 3s ease-in-out infinite;
        }
        @keyframes floating {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-10px); }
        }
        .pulse-glow {
            animation: pulseGlow 2s ease-in-out infinite alternate;
        }
        @keyframes pulseGlow {
            from { box-shadow: 0 0 20px rgba(102, 126, 234, 0.4); }
            to { box-shadow: 0 0 30px rgba(102, 126, 234, 0.8); }
        }
        .config-input {
            background: rgba(255, 255, 255, 0.05);
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.2);
            transition: all 0.3s ease;
        }
        .config-input:focus {
            border-color: rgba(102, 126, 234, 0.8);
            box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }
        .nav-btn {
            transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
            background: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.2);
        }
        .nav-btn:hover {
            background: rgba(255, 255, 255, 0.2);
            transform: translateY(-2px);
            box-shadow: 0 10px 25px -5px rgba(255, 255, 255, 0.2);
        }
        .status-dot {
            width: 12px;
            height: 12px;
            border-radius: 50%;
            background: linear-gradient(135deg, #10b981, #34d399);
            box-shadow: 0 0 10px rgba(16, 185, 129, 0.5);
        }
        .particle {
            position: absolute;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 50%;
            pointer-events: none;
        }
    </style>
</head>
<body class="gradient-bg min-h-screen text-white overflow-x-hidden">
    <!-- Animated Background Particles -->
    <div id="particles-container" class="fixed inset-0 pointer-events-none"></div>
    
    <!-- Main Content -->
    <div class="relative z-10 container mx-auto px-4 py-8">
        <!-- Header -->
        <header class="text-center mb-16 fade-in">
            <div class="floating mb-6">
                <div class="glass-effect inline-flex items-center justify-center w-20 h-20 rounded-2xl mb-4 pulse-glow">
                    <i class="fas fa-shield-alt text-3xl gradient-text"></i>
                </div>
            </div>
            <h1 class="text-5xl md:text-6xl font-bold mb-6 gradient-text">${this.title}</h1>
            <p class="text-xl opacity-90 mb-8 max-w-2xl mx-auto leading-relaxed">
                Premium VPN service with advanced security and blazing fast speeds
            </p>
            
            <div class="flex flex-wrap justify-center gap-6 mb-8">
                ${this.infos.map((info, index) => `
                    <div class="glass-card px-6 py-3 rounded-2xl fade-in" style="animation-delay: ${index * 0.1 + 0.5}s">
                        <span class="font-semibold text-lg">${info}</span>
                    </div>
                `).join('')}
            </div>

            <div class="flex flex-wrap justify-center gap-4 mt-8 stagger-animation">
                <a href="/sub/0" class="nav-btn px-8 py-4 rounded-2xl font-semibold text-lg flex items-center space-x-3">
                    <i class="fas fa-list text-purple-300"></i>
                    <span>All Configurations</span>
                </a>
                <a href="/api/v1/myip" class="nav-btn px-8 py-4 rounded-2xl font-semibold text-lg flex items-center space-x-3">
                    <i class="fas fa-network-wired text-blue-300"></i>
                    <span>Check My IP</span>
                </a>
                <a href="${DONATE_LINK}" target="_blank" class="nav-btn px-8 py-4 rounded-2xl font-semibold text-lg flex items-center space-x-3">
                    <i class="fas fa-heart text-red-300"></i>
                    <span>Support Us</span>
                </a>
            </div>
        </header>

        <!-- Proxy List -->
        <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 mb-16 stagger-animation">
            ${this.prxs.map((prx, index) => `
                <div class="prx-card rounded-3xl p-8" style="animation-delay: ${index * 0.1}s">
                    <!-- Header -->
                    <div class="flex items-center justify-between mb-6">
                        <div class="flex items-center space-x-4">
                            <div class="status-dot"></div>
                            <div>
                                <h3 class="text-xl font-bold">${prx.info.prxIP}:${prx.info.prxPort}</h3>
                                <p class="text-sm opacity-80">Online & Secure</p>
                            </div>
                        </div>
                        <span class="text-3xl">${getFlagEmoji(prx.info.country)}</span>
                    </div>
                    
                    <!-- Info Grid -->
                    <div class="grid grid-cols-2 gap-4 mb-6">
                        <div class="glass-effect rounded-xl p-4 text-center">
                            <i class="fas fa-globe text-blue-300 mb-2"></i>
                            <p class="font-semibold">${prx.info.country}</p>
                            <p class="text-xs opacity-80">Country</p>
                        </div>
                        <div class="glass-effect rounded-xl p-4 text-center">
                            <i class="fas fa-building text-purple-300 mb-2"></i>
                            <p class="font-semibold truncate">${prx.info.org}</p>
                            <p class="text-xs opacity-80">Provider</p>
                        </div>
                    </div>

                    <!-- Configuration URIs -->
                    <div class="space-y-3">
                        <h4 class="font-semibold text-lg mb-4 flex items-center space-x-2">
                            <i class="fas fa-code text-green-300"></i>
                            <span>Configuration Links</span>
                        </h4>
                        ${prx.uris.map((uri, uriIndex) => `
                            <div class="flex group relative">
                                <input type="text" 
                                       value="${uri}" 
                                       readonly 
                                       class="config-input flex-1 px-4 py-3 rounded-l-2xl text-sm font-mono truncate pr-12">
                                <button onclick="copyConfig('${uri.replace(/'/g, "\\'")}', this)" 
                                        class="copy-btn px-6 rounded-r-2xl font-semibold transition-all duration-400 flex items-center space-x-2">
                                    <i class="fas fa-copy"></i>
                                    <span class="hidden sm:inline">Copy</span>
                                </button>
                                <div class="absolute inset-y-0 left-0 flex items-center pl-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <i class="fas fa-bolt text-yellow-300 text-sm"></i>
                                </div>
                            </div>
                        `).join('')}
                    </div>

                    <!-- Speed Indicator -->
                    <div class="mt-6 pt-4 border-t border-white/10">
                        <div class="flex items-center justify-between text-sm">
                            <span class="opacity-80">Connection Speed</span>
                            <div class="flex items-center space-x-2">
                                <div class="flex space-x-1">
                                    <div class="w-2 h-4 bg-green-400 rounded-full animate-pulse"></div>
                                    <div class="w-2 h-6 bg-green-400 rounded-full animate-pulse" style="animation-delay: 0.1s"></div>
                                    <div class="w-2 h-3 bg-green-400 rounded-full animate-pulse" style="animation-delay: 0.2s"></div>
                                </div>
                                <span class="font-semibold text-green-300">Fast</span>
                            </div>
                        </div>
                    </div>
                </div>
            `).join('')}
        </div>

        <!-- Pagination -->
        ${this.pageButtons.length > 0 ? `
            <div class="flex justify-center space-x-6 mb-16 fade-in">
                ${this.pageButtons.map((button, index) => `
                    <a href="${button.href}" 
                       class="${button.disabled ? 
                         'glass-effect opacity-50 cursor-not-allowed' : 
                         'nav-btn hover:scale-105 transform transition-all duration-300'} 
                         px-8 py-4 rounded-2xl font-semibold text-lg flex items-center space-x-3"
                         style="animation-delay: ${index * 0.2 + 0.5}s">
                        <i class="fas fa-${button.text.toLowerCase() === 'prev' ? 'arrow-left' : 'arrow-right'}"></i>
                        <span>${button.text}</span>
                    </a>
                `).join('')}
            </div>
        ` : ''}

        <!-- Stats Section -->
        <div class="glass-card rounded-3xl p-8 mb-16 fade-in">
            <div class="grid grid-cols-1 md:grid-cols-4 gap-6 text-center">
                <div>
                    <div class="text-3xl font-bold gradient-text mb-2">${this.prxs.length * 3}</div>
                    <div class="opacity-80">Total Configs</div>
                </div>
                <div>
                    <div class="text-3xl font-bold gradient-text mb-2">${new Set(this.prxs.map(p => p.info.country)).size}</div>
                    <div class="opacity-80">Countries</div>
                </div>
                <div>
                    <div class="text-3xl font-bold gradient-text mb-2">24/7</div>
                    <div class="opacity-80">Uptime</div>
                </div>
                <div>
                    <div class="text-3xl font-bold gradient-text mb-2">∞</div>
                    <div class="opacity-80">Bandwidth</div>
                </div>
            </div>
        </div>

        <!-- Footer -->
        <footer class="text-center border-t border-white/10 pt-12 fade-in">
            <div class="glass-card rounded-3xl p-8 max-w-4xl mx-auto">
                <div class="flex flex-col md:flex-row justify-between items-center space-y-6 md:space-y-0">
                    <div class="text-left">
                        <div class="flex items-center space-x-3 mb-3">
                            <div class="w-10 h-10 rounded-xl glass-effect flex items-center justify-center">
                                <i class="fas fa-shield-alt gradient-text"></i>
                            </div>
                            <div>
                                <h3 class="font-bold text-xl gradient-text">Nautica VPN</h3>
                                <p class="text-sm opacity-80">Secure & Fast VPN Service</p>
                            </div>
                        </div>
                        <p class="text-sm opacity-70 max-w-md">
                            Experience the next generation of VPN technology with advanced security features and lightning-fast connections.
                        </p>
                    </div>
                    <div class="flex space-x-6">
                        <a href="/api/v1/myip" class="w-12 h-12 rounded-xl glass-effect flex items-center justify-center hover:scale-110 transition-transform">
                            <i class="fas fa-network-wired text-blue-300"></i>
                        </a>
                        <a href="${DONATE_LINK}" target="_blank" class="w-12 h-12 rounded-xl glass-effect flex items-center justify-center hover:scale-110 transition-transform">
                            <i class="fas fa-heart text-red-300"></i>
                        </a>
                        <a href="https://github.com/FoolVPN-ID" target="_blank" class="w-12 h-12 rounded-xl glass-effect flex items-center justify-center hover:scale-110 transition-transform">
                            <i class="fab fa-github text-purple-300"></i>
                        </a>
                    </div>
                </div>
                <div class="mt-8 pt-6 border-t border-white/10 text-sm opacity-60">
                    <p>© 2024 Nautica VPN. All rights reserved. Powered by Cloudflare Workers.</p>
                </div>
            </div>
        </footer>
    </div>

    <script>
        // Particle Background Animation
        function createParticles() {
            const container = document.getElementById('particles-container');
            const particleCount = 50;
            
            for (let i = 0; i < particleCount; i++) {
                const particle = document.createElement('div');
                particle.className = 'particle';
                
                const size = Math.random() * 4 + 1;
                const posX = Math.random() * 100;
                const posY = Math.random() * 100;
                const delay = Math.random() * 5;
                const duration = Math.random() * 10 + 10;
                
                particle.style.width = `${size}px`;
                particle.style.height = `${size}px`;
                particle.style.left = `${posX}%`;
                particle.style.top = `${posY}%`;
                particle.style.animation = `floating ${duration}s ease-in-out ${delay}s infinite`;
                particle.style.opacity = Math.random() * 0.3 + 0.1;
                
                container.appendChild(particle);
            }
        }

        // Copy Configuration Function
        function copyConfig(text, button) {
            navigator.clipboard.writeText(text).then(() => {
                const originalText = button.innerHTML;
                
                button.classList.add('copied');
                button.innerHTML = '<i class="fas fa-check"></i><span class="hidden sm:inline">Copied!</span>';
                
                // Add confetti effect
                createConfetti(button);
                
                setTimeout(() => {
                    button.classList.remove('copied');
                    button.innerHTML = originalText;
                }, 2000);
            }).catch(err => {
                console.error('Failed to copy: ', err);
                showNotification('Failed to copy configuration', 'error');
            });
        }

        // Confetti Effect
        function createConfetti(element) {
            const rect = element.getBoundingClientRect();
            const count = 20;
            
            for (let i = 0; i < count; i++) {
                const confetti = document.createElement('div');
                confetti.className = 'particle';
                confetti.style.background = `hsl(${Math.random() * 360}, 100%, 60%)`;
                confetti.style.width = '6px';
                confetti.style.height = '6px';
                confetti.style.left = `${rect.left + rect.width / 2}px`;
                confetti.style.top = `${rect.top + rect.height / 2}px`;
                confetti.style.position = 'fixed';
                confetti.style.zIndex = '1000';
                
                document.body.appendChild(confetti);
                
                const angle = Math.random() * Math.PI * 2;
                const velocity = 2 + Math.random() * 2;
                const vx = Math.cos(angle) * velocity;
                const vy = Math.sin(angle) * velocity;
                
                let posX = rect.left + rect.width / 2;
                let posY = rect.top + rect.height / 2;
                
                function animate() {
                    posX += vx;
                    posY += vy;
                    vy += 0.1; // gravity
                    
                    confetti.style.left = `${posX}px`;
                    confetti.style.top = `${posY}px`;
                    confetti.style.opacity = 1 - (posY - rect.top) / 300;
                    
                    if (posY < window.innerHeight && confetti.style.opacity > 0) {
                        requestAnimationFrame(animate);
                    } else {
                        confetti.remove();
                    }
                }
                
                animate();
            }
        }

        // Notification System
        function showNotification(message, type = 'success') {
            const notification = document.createElement('div');
            notification.className = `fixed top-4 right-4 glass-card px-6 py-4 rounded-2xl font-semibold transform translate-x-full transition-transform duration-300 z-50 ${
                type === 'error' ? 'text-red-300' : 'text-green-300'
            }`;
            notification.innerHTML = `
                <div class="flex items-center space-x-3">
                    <i class="fas fa-${type === 'error' ? 'exclamation-triangle' : 'check-circle'}"></i>
                    <span>${message}</span>
                </div>
            `;
            
            document.body.appendChild(notification);
            
            setTimeout(() => {
                notification.style.transform = 'translateX(0)';
            }, 100);
            
            setTimeout(() => {
                notification.style.transform = 'translateX(100%)';
                setTimeout(() => notification.remove(), 300);
            }, 3000);
        }

        // Stagger animation for cards
        function initializeAnimations() {
            const staggerElements = document.querySelectorAll('.stagger-animation > *');
            staggerElements.forEach((el, index) => {
                el.style.animationDelay = `${index * 0.1}s`;
            });
        }

        // Initialize everything when page loads
        document.addEventListener('DOMContentLoaded', () => {
            createParticles();
            initializeAnimations();
            
            // Add hover effects to cards
            const cards = document.querySelectorAll('.prx-card');
            cards.forEach(card => {
                card.addEventListener('mouseenter', () => {
                    card.style.transform = 'translateY(-8px) scale(1.02)';
                });
                card.addEventListener('mouseleave', () => {
                    card.style.transform = 'translateY(0) scale(1)';
                });
            });
        });

        // Intersection Observer for fade-in animations
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.animationPlayState = 'running';
                }
            });
        }, observerOptions);

        // Observe all fade-in elements
        document.querySelectorAll('.fade-in').forEach(el => {
            el.style.animationPlayState = 'paused';
            observer.observe(el);
        });
    </script>
</body>
</html>`;
  }
}

// ... (rest of the code remains exactly the same as previous version)
// [All the other functions: getKVPrxList, getPrxList, reverseWeb, getAllConfig, export default, websocketHandler, protocolSniffer, handleTCPOutBound, handleUDPOutbound, makeReadableWebSocketStream, readSsHeader, readFlashHeader, readHorseHeader, remoteSocketToWS, safeCloseWebSocket, checkPrxHealth, base64ToArrayBuffer, arrayBufferToHex, shuffleArray, reverse, getFlagEmoji, CloudflareApi class]
// ... (semua fungsi lainnya tetap sama persis dengan versi sebelumnya)

async function getKVPrxList(kvPrxUrl = KV_PRX_URL) {
  if (!kvPrxUrl) {
    throw new Error("No URL Provided!");
  }

  const kvPrx = await fetch(kvPrxUrl);
  if (kvPrx.status == 200) {
    return await kvPrx.json();
  } else {
    return {};
  }
}

async function getPrxList(prxBankUrl = PRX_BANK_URL) {
  /**
   * Format:
   *
   * <IP>,<Port>,<Country ID>,<ORG>
   * Contoh:
   * 1.1.1.1,443,SG,Cloudflare Inc.
   */
  if (!prxBankUrl) {
    throw new Error("No URL Provided!");
  }

  const prxBank = await fetch(prxBankUrl);
  if (prxBank.status == 200) {
    const text = (await prxBank.text()) || "";

    const prxString = text.split("\n").filter(Boolean);
    cachedPrxList = prxString
      .map((entry) => {
        const [prxIP, prxPort, country, org] = entry.split(",");
        return {
          prxIP: prxIP || "Unknown",
          prxPort: prxPort || "Unknown",
          country: country || "Unknown",
          org: org || "Unknown Org",
        };
      })
      .filter(Boolean);
  }

  return cachedPrxList;
}

async function reverseWeb(request, target, targetPath) {
  const targetUrl = new URL(request.url);
  const targetChunk = target.split(":");

  targetUrl.hostname = targetChunk[0];
  targetUrl.port = targetChunk[1]?.toString() || "443";
  targetUrl.pathname = targetPath || targetUrl.pathname;

  const modifiedRequest = new Request(targetUrl, request);

  modifiedRequest.headers.set("X-Forwarded-Host", request.headers.get("Host"));

  const response = await fetch(modifiedRequest);

  const newResponse = new Response(response.body, response);
  for (const [key, value] of Object.entries(CORS_HEADER_OPTIONS)) {
    newResponse.headers.set(key, value);
  }
  newResponse.headers.set("X-Proxied-By", "Cloudflare Worker");

  return newResponse;
}

function getAllConfig(request, hostName, prxList, page = 0) {
  const startIndex = PRX_PER_PAGE * page;

  try {
    const uuid = crypto.randomUUID();

    // Build URI
    const uri = new URL(`${atob(horse)}://${hostName}`);
    uri.searchParams.set("encryption", "none");
    uri.searchParams.set("type", "ws");
    uri.searchParams.set("host", hostName);

    // Build HTML
    const document = new Document(request);
    document.setTitle("Welcome to <span class='text-blue-500 font-semibold'>Nautica</span>");
    document.addInfo(`Total: ${prxList.length}`);
    document.addInfo(`Page: ${page}/${Math.floor(prxList.length / PRX_PER_PAGE)}`);

    for (let i = startIndex; i < startIndex + PRX_PER_PAGE; i++) {
      const prx = prxList[i];
      if (!prx) break;

      const { prxIP, prxPort, country, org } = prx;

      uri.searchParams.set("path", `/${prxIP}-${prxPort}`);

      const prxs = [];
      for (const port of PORTS) {
        uri.port = port.toString();
        uri.hash = `${i + 1} ${getFlagEmoji(country)} ${org} WS ${port == 443 ? "TLS" : "NTLS"} [${serviceName}]`;
        for (const protocol of PROTOCOLS) {
          // Special exceptions
          if (protocol === "ss") {
            uri.username = btoa(`none:${uuid}`);
            uri.searchParams.set(
              "plugin",
              `${atob(v2)}-plugin${
                port == 80 ? "" : ";tls"
              };mux=0;mode=websocket;path=/${prxIP}-${prxPort};host=${hostName}`
            );
          } else {
            uri.username = uuid;
            uri.searchParams.delete("plugin");
          }

          uri.protocol = protocol;
          uri.searchParams.set("security", port == 443 ? "tls" : "none");
          uri.searchParams.set("sni", port == 80 && protocol == atob(flash) ? "" : hostName);

          // Build VPN URI
          prxs.push(uri.toString());
        }
      }
      document.registerPrxs(
        {
          prxIP,
          prxPort,
          country,
          org,
        },
        prxs
      );
    }

    // Build pagination
    document.addPageButton("Prev", `/sub/${page > 0 ? page - 1 : 0}`, page > 0 ? false : true);
    document.addPageButton("Next", `/sub/${page + 1}`, page < Math.floor(prxList.length / 10) ? false : true);

    return document.build();
  } catch (error) {
    return `An error occurred while generating the ${atob(flash).toUpperCase()} configurations. ${error}`;
  }
}

export default {
  async fetch(request, env, ctx) {
    try {
      const url = new URL(request.url);
      const upgradeHeader = request.headers.get("Upgrade");

      // Gateway check
      if (apiKey && apiEmail && accountID && zoneID) {
        isApiReady = true;
      }

      // Handle prx client
      if (upgradeHeader === "websocket") {
        const prxMatch = url.pathname.match(/^\/(.+[:=-]\d+)$/);

        if (url.pathname.length == 3 || url.pathname.match(",")) {
          // Contoh: /ID, /SG, dll
          const prxKeys = url.pathname.replace("/", "").toUpperCase().split(",");
          const prxKey = prxKeys[Math.floor(Math.random() * prxKeys.length)];
          const kvPrx = await getKVPrxList();

          prxIP = kvPrx[prxKey][Math.floor(Math.random() * kvPrx[prxKey].length)];

          return await websocketHandler(request);
        } else if (prxMatch) {
          prxIP = prxMatch[1];
          return await websocketHandler(request);
        }
      }

      if (url.pathname.startsWith("/sub")) {
        const page = url.pathname.match(/^\/sub\/(\d+)$/);
        const pageIndex = parseInt(page ? page[1] : "0");
        const hostname = request.headers.get("Host");

        // Queries
        const countrySelect = url.searchParams.get("cc")?.split(",");
        const prxBankUrl = url.searchParams.get("prx-list") || env.PRX_BANK_URL;
        let prxList = (await getPrxList(prxBankUrl)).filter((prx) => {
          // Filter prxs by Country
          if (countrySelect) {
            return countrySelect.includes(prx.country);
          }

          return true;
        });

        const result = getAllConfig(request, hostname, prxList, pageIndex);
        return new Response(result, {
          status: 200,
          headers: { "Content-Type": "text/html;charset=utf-8" },
        });
      } else if (url.pathname.startsWith("/check")) {
        const target = url.searchParams.get("target").split(":");
        const result = await checkPrxHealth(target[0], target[1] || "443");

        return new Response(JSON.stringify(result), {
          status: 200,
          headers: {
            ...CORS_HEADER_OPTIONS,
            "Content-Type": "application/json",
          },
        });
      } else if (url.pathname.startsWith("/api/v1")) {
        const apiPath = url.pathname.replace("/api/v1", "");

        if (apiPath.startsWith("/domains")) {
          if (!isApiReady) {
            return new Response("Api not ready", {
              status: 500,
            });
          }

          const wildcardApiPath = apiPath.replace("/domains", "");
          const cloudflareApi = new CloudflareApi();

          if (wildcardApiPath == "/get") {
            const domains = await cloudflareApi.getDomainList();
            return new Response(JSON.stringify(domains), {
              headers: {
                ...CORS_HEADER_OPTIONS,
              },
            });
          } else if (wildcardApiPath == "/put") {
            const domain = url.searchParams.get("domain");
            const register = await cloudflareApi.registerDomain(domain);

            return new Response(register.toString(), {
              status: register,
              headers: {
                ...CORS_HEADER_OPTIONS,
              },
            });
          }
        } else if (apiPath.startsWith("/sub")) {
          const filterCC = url.searchParams.get("cc")?.split(",") || [];
          const filterPort = url.searchParams.get("port")?.split(",") || PORTS;
          const filterVPN = url.searchParams.get("vpn")?.split(",") || PROTOCOLS;
          const filterLimit = parseInt(url.searchParams.get("limit")) || 10;
          const filterFormat = url.searchParams.get("format") || "raw";
          const fillerDomain = url.searchParams.get("domain") || APP_DOMAIN;

          const prxBankUrl = url.searchParams.get("prx-list") || env.PRX_BANK_URL;
          const prxList = await getPrxList(prxBankUrl)
            .then((prxs) => {
              // Filter CC
              if (filterCC.length) {
                return prxs.filter((prx) => filterCC.includes(prx.country));
              }
              return prxs;
            })
            .then((prxs) => {
              // shuffle result
              shuffleArray(prxs);
              return prxs;
            });

          const uuid = crypto.randomUUID();
          const result = [];
          for (const prx of prxList) {
            const uri = new URL(`${atob(horse)}://${fillerDomain}`);
            uri.searchParams.set("encryption", "none");
            uri.searchParams.set("type", "ws");
            uri.searchParams.set("host", APP_DOMAIN);

            for (const port of filterPort) {
              for (const protocol of filterVPN) {
                if (result.length >= filterLimit) break;

                uri.protocol = protocol;
                uri.port = port.toString();
                if (protocol == "ss") {
                  uri.username = btoa(`none:${uuid}`);
                  uri.searchParams.set(
                    "plugin",
                    `${atob(v2)}-plugin${port == 80 ? "" : ";tls"};mux=0;mode=websocket;path=/${prx.prxIP}-${
                      prx.prxPort
                    };host=${APP_DOMAIN}`
                  );
                } else {
                  uri.username = uuid;
                }

                uri.searchParams.set("security", port == 443 ? "tls" : "none");
                uri.searchParams.set("sni", port == 80 && protocol == atob(flash) ? "" : APP_DOMAIN);
                uri.searchParams.set("path", `/${prx.prxIP}-${prx.prxPort}`);

                uri.hash = `${result.length + 1} ${getFlagEmoji(prx.country)} ${prx.org} WS ${
                  port == 443 ? "TLS" : "NTLS"
                } [${serviceName}]`;
                result.push(uri.toString());
              }
            }
          }

          let finalResult = "";
          switch (filterFormat) {
            case "raw":
              finalResult = result.join("\n");
              break;
            case atob(v2):
              finalResult = btoa(result.join("\n"));
              break;
            case atob(neko):
            case "sfa":
            case "bfr":
              const res = await fetch(CONVERTER_URL, {
                method: "POST",
                body: JSON.stringify({
                  url: result.join(","),
                  format: filterFormat,
                  template: "cf",
                }),
              });
              if (res.status == 200) {
                finalResult = await res.text();
              } else {
                return new Response(res.statusText, {
                  status: res.status,
                  headers: {
                    ...CORS_HEADER_OPTIONS,
                  },
                });
              }
              break;
          }

          return new Response(finalResult, {
            status: 200,
            headers: {
              ...CORS_HEADER_OPTIONS,
            },
          });
        } else if (apiPath.startsWith("/myip")) {
          return new Response(
            JSON.stringify({
              ip:
                request.headers.get("cf-connecting-ipv6") ||
                request.headers.get("cf-connecting-ip") ||
                request.headers.get("x-real-ip"),
              colo: request.headers.get("cf-ray")?.split("-")[1],
              ...request.cf,
            }),
            {
              headers: {
                ...CORS_HEADER_OPTIONS,
              },
            }
          );
        }
      }

      const targetReversePrx = env.REVERSE_PRX_TARGET || "example.com";
      return await reverseWeb(request, targetReversePrx);
    } catch (err) {
      return new Response(`An error occurred: ${err.toString()}`, {
        status: 500,
        headers: {
          ...CORS_HEADER_OPTIONS,
        },
      });
    }
  },
};

async function websocketHandler(request) {
  const webSocketPair = new WebSocketPair();
  const [client, webSocket] = Object.values(webSocketPair);

  webSocket.accept();

  let addressLog = "";
  let portLog = "";
  const log = (info, event) => {
    console.log(`[${addressLog}:${portLog}] ${info}`, event || "");
  };
  const earlyDataHeader = request.headers.get("sec-websocket-protocol") || "";

  const readableWebSocketStream = makeReadableWebSocketStream(webSocket, earlyDataHeader, log);

  let remoteSocketWrapper = {
    value: null,
  };
  let isDNS = false;
  let udpStreamWriter = null;

  readableWebSocketStream
    .pipeTo(
      new WritableStream({
        async write(chunk, controller) {
          if (isDNS) {
            if (!udpStreamWriter) {
              udpStreamWriter = handleUDPOutbound(webSocket, null, log);
            }
            udpStreamWriter.write(chunk);
            return;
          }
          if (remoteSocketWrapper.value) {
            const writer = remoteSocketWrapper.value.writable.getWriter();
            await writer.write(chunk);
            writer.releaseLock();
            return;
          }

          const protocol = await protocolSniffer(chunk);
          let protocolHeader;

          if (protocol === atob(horse)) {
            protocolHeader = readHorseHeader(chunk);
          } else if (protocol === atob(flash)) {
            protocolHeader = readFlashHeader(chunk);
          } else if (protocol === "ss") {
            protocolHeader = readSsHeader(chunk);
          } else {
            throw new Error("Unknown Protocol!");
          }

          addressLog = protocolHeader.addressRemote;
          portLog = `${protocolHeader.portRemote} -> ${protocolHeader.isUDP ? "UDP" : "TCP"}`;

          if (protocolHeader.hasError) {
            throw new Error(protocolHeader.message);
          }

          if (protocolHeader.isUDP) {
            if (protocolHeader.portRemote === 53) {
              isDNS = true;
              udpStreamWriter = handleUDPOutbound(webSocket, protocolHeader.version, log);
              if (protocolHeader.rawClientData && protocolHeader.rawClientData.byteLength > 0) {
                udpStreamWriter.write(protocolHeader.rawClientData);
              }
              return;
            } else {
              throw new Error("UDP only support for DNS port 53");
            }
          }

          handleTCPOutBound(
            remoteSocketWrapper,
            protocolHeader.addressRemote,
            protocolHeader.portRemote,
            protocolHeader.rawClientData,
            webSocket,
            protocolHeader.version,
            log
          );
        },
        close() {
          log(`readableWebSocketStream is close`);
        },
        abort(reason) {
          log(`readableWebSocketStream is abort`, JSON.stringify(reason));
        },
      })
    )
    .catch((err) => {
      log("readableWebSocketStream pipeTo error", err);
    });

  return new Response(null, {
    status: 101,
    webSocket: client,
  });
}

async function protocolSniffer(buffer) {
  if (buffer.byteLength >= 62) {
    const horseDelimiter = new Uint8Array(buffer.slice(56, 60));
    if (horseDelimiter[0] === 0x0d && horseDelimiter[1] === 0x0a) {
      if (horseDelimiter[2] === 0x01 || horseDelimiter[2] === 0x03 || horseDelimiter[2] === 0x7f) {
        if (horseDelimiter[3] === 0x01 || horseDelimiter[3] === 0x03 || horseDelimiter[3] === 0x04) {
          return atob(horse);
        }
      }
    }
  }

  const flashDelimiter = new Uint8Array(buffer.slice(1, 17));
  // Hanya mendukung UUID v4
  if (arrayBufferToHex(flashDelimiter).match(/^[0-9a-f]{8}[0-9a-f]{4}4[0-9a-f]{3}[89ab][0-9a-f]{3}[0-9a-f]{12}$/i)) {
    return atob(flash);
  }

  return "ss"; // default
}

async function handleTCPOutBound(
  remoteSocket,
  addressRemote,
  portRemote,
  rawClientData,
  webSocket,
  responseHeader,
  log
) {
  async function connectAndWrite(address, port) {
    const tcpSocket = connect({
      hostname: address,
      port: port,
    });
    remoteSocket.value = tcpSocket;
    log(`connected to ${address}:${port}`);
    const writer = tcpSocket.writable.getWriter();
    await writer.write(rawClientData);
    writer.releaseLock();

    return tcpSocket;
  }

  async function retry() {
    const tcpSocket = await connectAndWrite(
      prxIP.split(/[:=-]/)[0] || addressRemote,
      prxIP.split(/[:=-]/)[1] || portRemote
    );
    tcpSocket.closed
      .catch((error) => {
        console.log("retry tcpSocket closed error", error);
      })
      .finally(() => {
        safeCloseWebSocket(webSocket);
      });
    remoteSocketToWS(tcpSocket, webSocket, responseHeader, null, log);
  }

  const tcpSocket = await connectAndWrite(addressRemote, portRemote);

  remoteSocketToWS(tcpSocket, webSocket, responseHeader, retry, log);
}

function handleUDPOutbound(webSocket, responseHeader, log) {
  let isVlessHeaderSent = false;
  const transformStream = new TransformStream({
    start(controller) {},
    transform(chunk, controller) {
      for (let index = 0; index < chunk.byteLength; ) {
        const lengthBuffer = chunk.slice(index, index + 2);
        const udpPakcetLength = new DataView(lengthBuffer).getUint16(0);
        const udpData = new Uint8Array(chunk.slice(index + 2, index + 2 + udpPakcetLength));
        index = index + 2 + udpPakcetLength;
        controller.enqueue(udpData);
      }
    },
    flush(controller) {},
  });
  
  transformStream.readable
    .pipeTo(
      new WritableStream({
        async write(chunk) {
          const resp = await fetch("https://1.1.1.1/dns-query", {
            method: "POST",
            headers: {
              "content-type": "application/dns-message",
            },
            body: chunk,
          });
          const dnsQueryResult = await resp.arrayBuffer();
          const udpSize = dnsQueryResult.byteLength;
          const udpSizeBuffer = new Uint8Array([(udpSize >> 8) & 0xff, udpSize & 0xff]);
          if (webSocket.readyState === WS_READY_STATE_OPEN) {
            log(`doh success and dns message length is ${udpSize}`);
            if (isVlessHeaderSent) {
              webSocket.send(await new Blob([udpSizeBuffer, dnsQueryResult]).arrayBuffer());
            } else {
              webSocket.send(await new Blob([responseHeader, udpSizeBuffer, dnsQueryResult]).arrayBuffer());
              isVlessHeaderSent = true;
            }
          }
        },
      })
    )
    .catch((error) => {
      log("dns udp has error" + error);
    });

  const writer = transformStream.writable.getWriter();

  return {
    write(chunk) {
      writer.write(chunk);
    },
  };
}

function makeReadableWebSocketStream(webSocketServer, earlyDataHeader, log) {
  let readableStreamCancel = false;
  const stream = new ReadableStream({
    start(controller) {
      webSocketServer.addEventListener("message", (event) => {
        if (readableStreamCancel) {
          return;
        }
        const message = event.data;
        controller.enqueue(message);
      });
      webSocketServer.addEventListener("close", () => {
        safeCloseWebSocket(webSocketServer);
        if (readableStreamCancel) {
          return;
        }
        controller.close();
      });
      webSocketServer.addEventListener("error", (err) => {
        log("webSocketServer has error");
        controller.error(err);
      });
      const { earlyData, error } = base64ToArrayBuffer(earlyDataHeader);
      if (error) {
        controller.error(error);
      } else if (earlyData) {
        controller.enqueue(earlyData);
      }
    },

    pull(controller) {},
    cancel(reason) {
      if (readableStreamCancel) {
        return;
      }
      log(`ReadableStream was canceled, due to ${reason}`);
      readableStreamCancel = true;
      safeCloseWebSocket(webSocketServer);
    },
  });

  return stream;
}

function readSsHeader(ssBuffer) {
  const view = new DataView(ssBuffer);

  const addressType = view.getUint8(0);
  let addressLength = 0;
  let addressValueIndex = 1;
  let addressValue = "";

  switch (addressType) {
    case 1:
      addressLength = 4;
      addressValue = new Uint8Array(ssBuffer.slice(addressValueIndex, addressValueIndex + addressLength)).join(".");
      break;
    case 3:
      addressLength = new Uint8Array(ssBuffer.slice(addressValueIndex, addressValueIndex + 1))[0];
      addressValueIndex += 1;
      addressValue = new TextDecoder().decode(ssBuffer.slice(addressValueIndex, addressValueIndex + addressLength));
      break;
    case 4:
      addressLength = 16;
      const dataView = new DataView(ssBuffer.slice(addressValueIndex, addressValueIndex + addressLength));
      const ipv6 = [];
      for (let i = 0; i < 8; i++) {
        ipv6.push(dataView.getUint16(i * 2).toString(16));
      }
      addressValue = ipv6.join(":");
      break;
    default:
      return {
        hasError: true,
        message: `Invalid addressType for SS: ${addressType}`,
      };
  }

  if (!addressValue) {
    return {
      hasError: true,
      message: `Destination address empty, address type is: ${addressType}`,
    };
  }

  const portIndex = addressValueIndex + addressLength;
  const portBuffer = ssBuffer.slice(portIndex, portIndex + 2);
  const portRemote = new DataView(portBuffer).getUint16(0);
  return {
    hasError: false,
    addressRemote: addressValue,
    addressType: addressType,
    portRemote: portRemote,
    rawDataIndex: portIndex + 2,
    rawClientData: ssBuffer.slice(portIndex + 2),
    version: null,
    isUDP: portRemote == 53,
  };
}

function readFlashHeader(buffer) {
  const version = new Uint8Array(buffer.slice(0, 1));
  let isUDP = false;

  const optLength = new Uint8Array(buffer.slice(17, 18))[0];

  const cmd = new Uint8Array(buffer.slice(18 + optLength, 18 + optLength + 1))[0];
  if (cmd === 1) {
  } else if (cmd === 2) {
    isUDP = true;
  } else {
    return {
      hasError: true,
      message: `command ${cmd} is not supported`,
    };
  }
  const portIndex = 18 + optLength + 1;
  const portBuffer = buffer.slice(portIndex, portIndex + 2);
  const portRemote = new DataView(portBuffer).getUint16(0);

  let addressIndex = portIndex + 2;
  const addressBuffer = new Uint8Array(buffer.slice(addressIndex, addressIndex + 1));

  const addressType = addressBuffer[0];
  let addressLength = 0;
  let addressValueIndex = addressIndex + 1;
  let addressValue = "";
  switch (addressType) {
    case 1: // For IPv4
      addressLength = 4;
      addressValue = new Uint8Array(buffer.slice(addressValueIndex, addressValueIndex + addressLength)).join(".");
      break;
    case 2: // For Domain
      addressLength = new Uint8Array(buffer.slice(addressValueIndex, addressValueIndex + 1))[0];
      addressValueIndex += 1;
      addressValue = new TextDecoder().decode(buffer.slice(addressValueIndex, addressValueIndex + addressLength));
      break;
    case 3: // For IPv6
      addressLength = 16;
      const dataView = new DataView(buffer.slice(addressValueIndex, addressValueIndex + addressLength));
      const ipv6 = [];
      for (let i = 0; i < 8; i++) {
        ipv6.push(dataView.getUint16(i * 2).toString(16));
      }
      addressValue = ipv6.join(":");
      break;
    default:
      return {
        hasError: true,
        message: `invild  addressType is ${addressType}`,
      };
  }
  if (!addressValue) {
    return {
      hasError: true,
      message: `addressValue is empty, addressType is ${addressType}`,
    };
  }

  return {
    hasError: false,
    addressRemote: addressValue,
    addressType: addressType,
    portRemote: portRemote,
    rawDataIndex: addressValueIndex + addressLength,
    rawClientData: buffer.slice(addressValueIndex + addressLength),
    version: new Uint8Array([version[0], 0]),
    isUDP: isUDP,
  };
}

function readHorseHeader(buffer) {
  const dataBuffer = buffer.slice(58);
  if (dataBuffer.byteLength < 6) {
    return {
      hasError: true,
      message: "invalid request data",
    };
  }

  let isUDP = false;
  const view = new DataView(dataBuffer);
  const cmd = view.getUint8(0);
  if (cmd == 3) {
    isUDP = true;
  } else if (cmd != 1) {
    throw new Error("Unsupported command type!");
  }

  let addressType = view.getUint8(1);
  let addressLength = 0;
  let addressValueIndex = 2;
  let addressValue = "";
  switch (addressType) {
    case 1: // For IPv4
      addressLength = 4;
      addressValue = new Uint8Array(dataBuffer.slice(addressValueIndex, addressValueIndex + addressLength)).join(".");
      break;
    case 3: // For Domain
      addressLength = new Uint8Array(dataBuffer.slice(addressValueIndex, addressValueIndex + 1))[0];
      addressValueIndex += 1;
      addressValue = new TextDecoder().decode(dataBuffer.slice(addressValueIndex, addressValueIndex + addressLength));
      break;
    case 4: // For IPv6
      addressLength = 16;
      const dataView = new DataView(dataBuffer.slice(addressValueIndex, addressValueIndex + addressLength));
      const ipv6 = [];
      for (let i = 0; i < 8; i++) {
        ipv6.push(dataView.getUint16(i * 2).toString(16));
      }
      addressValue = ipv6.join(":");
      break;
    default:
      return {
        hasError: true,
        message: `invalid addressType is ${addressType}`,
      };
  }

  if (!addressValue) {
    return {
      hasError: true,
      message: `address is empty, addressType is ${addressType}`,
    };
  }

  const portIndex = addressValueIndex + addressLength;
  const portBuffer = dataBuffer.slice(portIndex, portIndex + 2);
  const portRemote = new DataView(portBuffer).getUint16(0);
  return {
    hasError: false,
    addressRemote: addressValue,
    addressType: addressType,
    portRemote: portRemote,
    rawDataIndex: portIndex + 4,
    rawClientData: dataBuffer.slice(portIndex + 4),
    version: null,
    isUDP: isUDP,
  };
}

async function remoteSocketToWS(remoteSocket, webSocket, responseHeader, retry, log) {
  let header = responseHeader;
  let hasIncomingData = false;
  await remoteSocket.readable
    .pipeTo(
      new WritableStream({
        start() {},
        async write(chunk, controller) {
          hasIncomingData = true;
          if (webSocket.readyState !== WS_READY_STATE_OPEN) {
            controller.error("webSocket.readyState is not open, maybe close");
          }
          if (header) {
            webSocket.send(await new Blob([header, chunk]).arrayBuffer());
            header = null;
          } else {
            webSocket.send(chunk);
          }
        },
        close() {
          log(`remoteConnection!.readable is close with hasIncomingData is ${hasIncomingData}`);
        },
        abort(reason) {
          console.error(`remoteConnection!.readable abort`, reason);
        },
      })
    )
    .catch((error) => {
      console.error(`remoteSocketToWS has exception `, error.stack || error);
      safeCloseWebSocket(webSocket);
    });
  if (hasIncomingData === false && retry) {
    log(`retry`);
    retry();
  }
}

function safeCloseWebSocket(socket) {
  try {
    if (socket.readyState === WS_READY_STATE_OPEN || socket.readyState === WS_READY_STATE_CLOSING) {
      socket.close();
    }
  } catch (error) {
    console.error("safeCloseWebSocket error", error);
  }
}

async function checkPrxHealth(prxIP, prxPort) {
  const req = await fetch(`${PRX_HEALTH_CHECK_API}?ip=${prxIP}:${prxPort}`);
  return await req.json();
}

// Helpers
function base64ToArrayBuffer(base64Str) {
  if (!base64Str) {
    return { error: null };
  }
  try {
    base64Str = base64Str.replace(/-/g, "+").replace(/_/g, "/");
    const decode = atob(base64Str);
    const arryBuffer = Uint8Array.from(decode, (c) => c.charCodeAt(0));
    return { earlyData: arryBuffer.buffer, error: null };
  } catch (error) {
    return { error };
  }
}

function arrayBufferToHex(buffer) {
  return [...new Uint8Array(buffer)].map((x) => x.toString(16).padStart(2, "0")).join("");
}

function shuffleArray(array) {
  let currentIndex = array.length;

  // While there remain elements to shuffle...
  while (currentIndex != 0) {
    // Pick a remaining element...
    let randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
  }
}

function reverse(s) {
  return s.split("").reverse().join("");
}

function getFlagEmoji(isoCode) {
  const codePoints = isoCode
    .toUpperCase()
    .split("")
    .map((char) => 127397 + char.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
}

// CloudflareApi Class
class CloudflareApi {
  constructor() {
    this.bearer = `Bearer ${apiKey}`;
    this.accountID = accountID;
    this.zoneID = zoneID;
    this.apiEmail = apiEmail;
    this.apiKey = apiKey;

    this.headers = {
      Authorization: this.bearer,
      "X-Auth-Email": this.apiEmail,
      "X-Auth-Key": this.apiKey,
    };
  }

  async getDomainList() {
    const url = `https://api.cloudflare.com/client/v4/accounts/${this.accountID}/workers/domains`;
    const res = await fetch(url, {
      headers: {
        ...this.headers,
      },
    });

    if (res.status == 200) {
      const respJson = await res.json();

      return respJson.result.filter((data) => data.service == serviceName).map((data) => data.hostname);
    }

    return [];
  }

  async registerDomain(domain) {
    domain = domain.toLowerCase();
    const registeredDomains = await this.getDomainList();

    if (!domain.endsWith(rootDomain)) return 400;
    if (registeredDomains.includes(domain)) return 409;

    try {
      const domainTest = await fetch(`https://${domain.replaceAll("." + APP_DOMAIN, "")}`);
      if (domainTest.status == 530) return domainTest.status;

      const badWordsListRes = await fetch(BAD_WORDS_LIST);
      if (badWordsListRes.status == 200) {
        const badWordsList = (await badWordsListRes.text()).split("\n");
        for (const badWord of badWordsList) {
          if (domain.includes(badWord.toLowerCase())) {
            return 403;
          }
        }
      } else {
        return 403;
      }
    } catch (e) {
      return 400;
    }

    const url = `https://api.cloudflare.com/client/v4/accounts/${this.accountID}/workers/domains`;
    const res = await fetch(url, {
      method: "PUT",
      body: JSON.stringify({
        environment: "production",
        hostname: domain,
        service: serviceName,
        zone_id: this.zoneID,
      }),
      headers: {
        ...this.headers,
      },
    });

    return res.status;
  }
}
