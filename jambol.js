import { connect } from "cloudflare:sockets";

// Variables
const rootDomain = "gpj2.dpdns.org"; // Ganti dengan domain utama kalian
const serviceName = "tes"; // Ganti dengan nama workers kalian
const apiKey = "e1d2b64d4da5e42f24c88535f12f21bc84d06"; // Ganti dengan Global API key kalian (https://dash.cloudflare.com/profile/api-tokens)
const apiEmail = "paoandest@gmail.com"; // Ganti dengan email yang kalian gunakan
const accountID = "723b4d7d922c6af940791b5624a7cb05"; // Ganti dengan Account ID kalian (https://dash.cloudflare.com -> Klik domain yang kalian gunakan)
const zoneID = "143d6f80528eae02e7a909f85e5320ab"; // Ganti dengan Zone ID kalian (https://dash.cloudflare.com -> Klik domain yang kalian gunakan)
const ownerPassword = ".";
let isApiReady = false;
let prxIP = "";
let cachedPrxList = [];

// Constant
const WHATSAPP_NUMBER = "082339191527";
const TELEGRAM_USERNAME = "sampiiii";
const horse = "dHJvamFu";
const flash = "dmxlc3M=";
const v2 = "djJyYXk=";
const neko = "Y2xhc2g=";

const APP_DOMAIN = serviceName + '.' + rootDomain;
const PORTS = [443, 80];
const PROTOCOLS = [atob(horse), atob(flash), "ss"];
const PRX_BANK_URL = "https://raw.githubusercontent.com/jaka2m/botak/refs/heads/main/cek/proxyList.txt";
// const DOH_URL = "https://1.1.1.1/dns-query";
// const DOH_URL = "https://8.8.8.8/dns-query";
const DOH_URL = "https://1.1.1.1/dns-query";
const PRX_HEALTH_CHECK_API = "https://geovpn.vercel.app/check";
const CONVERTER_URL = "https://api.foolvpn.me/convert";
const DONATE_LINK = "https://github.com/jaka1m/project/raw/main/BAYAR.jpg";
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

async function getKVPrxList(kvPrxUrl) {
  if (!kvPrxUrl) {
    return {};
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
        const [prxIP, prxPort, country, org] = entry.split(",").map(item => item.trim());
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

async function generateSubscription(
  {
    countryCodes = [],
    limit = 10,
    vpnType = null,
    ports = null,
    bug = null,
    useWildcard = false,
    prxBankUrl = null,
    domain = null
  }
) {
    const filterVPN = vpnType ? [vpnType] : PROTOCOLS;
    const filterPort = ports || PORTS;
    const filterCC = countryCodes;
    const filterLimit = limit;
    
    const baseHost = domain || APP_DOMAIN;
    const address = bug || baseHost;
    const sniHost = useWildcard && bug ? bug + '.' + baseHost : baseHost;

    const prxList = await getPrxList(prxBankUrl || PRX_BANK_URL)
        .then((prxs) => {
          if (filterCC.length) {
            return prxs.filter((prx) => filterCC.includes(prx.country));
          }
          return prxs;
        })
        .then((prxs) => {
          shuffleArray(prxs);
          return prxs;
        });

    const uuid = crypto.randomUUID();
    const result = [];
    for (const prx of prxList) {
        const uri = new URL(atob(horse) + '://' + address);
        uri.searchParams.set("encryption", "none");
        uri.searchParams.set("type", "ws");
        uri.searchParams.set("host", sniHost);

        for (const port of filterPort) {
          for (const protocol of filterVPN) {
            if (result.length >= filterLimit) break;

            uri.protocol = protocol;
            uri.port = port.toString();
            if (protocol == "ss") {
              uri.username = btoa('none:' + uuid);
              uri.searchParams.set(
                "plugin",
                atob(v2) + '-plugin' + (port == 80 ? "" : ";tls") + ';mux=0;mode=websocket;path=/Free-VPN-Geo-Project/' + prx.prxIP + '-' +
                  prx.prxPort +
                ';host=' + sniHost
              );
            } else {
              uri.username = uuid;
              uri.searchParams.delete("plugin");
            }

            uri.searchParams.set("security", port == 443 ? "tls" : "none");
            uri.searchParams.set("sni", port == 80 && protocol == atob(flash) ? "" : sniHost);
            uri.searchParams.set("path", '/Free-VPN-Geo-Project/' + prx.prxIP + '-' + prx.prxPort);

            uri.hash = (result.length + 1) + ' ' + getFlagEmoji(prx.country) + ' ' + prx.org + ' WS ' + (port == 443 ? "TLS" : "NTLS") + ' [' + serviceName + ']';
            result.push(uri.toString());
          }
          if (result.length >= filterLimit) break;
        }
        if (result.length >= filterLimit) break;
    }
    
    return result;
}

function getAllConfig(request, hostName, prxList, page = 0, selectedProtocol = null, selectedPort = null, wildcardDomains = [], rootDomain) {
    const startIndex = PRX_PER_PAGE * page;
    const totalProxies = prxList.length;
    const totalPages = Math.ceil(totalProxies / PRX_PER_PAGE) || 1;

    try {
        const uuid = crypto.randomUUID();

        // If a custom host is selected, the host/SNI will be a combination.
        // Otherwise, it's just the application's domain.
        const effectiveHost = hostName === APP_DOMAIN ? APP_DOMAIN : hostName + '.' + APP_DOMAIN;

        // Build URI
        // The address is the selected host (e.g., ava.game.naver.com or the app domain)
        const uri = new URL(atob(horse) + '://' + hostName);
        uri.searchParams.set("encryption", "none");
        uri.searchParams.set("type", "ws");
        uri.searchParams.set("host", effectiveHost);

        // Build HTML
        const document = new Document(request, wildcardDomains, rootDomain, startIndex);
        document.setTitle("Free Vless Trojan SS");
        document.setTotalProxy(totalProxies);
        document.setPage(page + 1, totalPages);

        for (let i = startIndex; i < startIndex + PRX_PER_PAGE; i++) {
            const prx = prxList[i];
            if (!prx) break;

            const { prxIP, prxPort, country, org } = prx;

            uri.searchParams.set("path", '/Free-VPN-Geo-Project/' + prxIP + '-' + prxPort);

            const protocolsToUse = selectedProtocol && selectedProtocol !== 'all' ? [selectedProtocol] : PROTOCOLS;
            const portsToUse = selectedPort && selectedPort !== 'all' ? [parseInt(selectedPort)] : PORTS;

            const prxs = [];
            for (const port of portsToUse) {
                uri.port = port.toString();
                uri.hash = (i + 1) + ' ' + getFlagEmoji(country) + ' ' + org + ' WS ' + (port == 443 ? "TLS" : "NTLS") + ' [' + serviceName + ']';
                for (const protocol of protocolsToUse) {
                    // Special exceptions
                    if (protocol === "ss") {
                        uri.username = btoa('none:' + uuid);
                        uri.searchParams.set(
                            "plugin",
                            atob(v2) + '-plugin' +
                                (port == 80 ? "" : ";tls") +
                            ';mux=0;mode=websocket;path=/Free-VPN-Geo-Project/' + prxIP + '-' + prxPort + ';host=' + effectiveHost
                        );
                    } else {
                        uri.username = uuid;
                        uri.searchParams.delete("plugin");
                    }

                    uri.protocol = protocol;
                    uri.searchParams.set("security", port == 443 ? "tls" : "none");
                    uri.searchParams.set("sni", port == 80 && protocol == atob(flash) ? "" : effectiveHost);

                    // Build VPN URI
                    prxs.push(uri.toString());
                }
            }
            document.registerProxies(
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
        const showingFrom = totalProxies > 0 ? startIndex + 1 : 0;
        const showingTo = Math.min(startIndex + PRX_PER_PAGE, totalProxies);
        document.setPaginationInfo('Showing ' + showingFrom + ' to ' + showingTo + ' of ' + totalProxies + ' Proxies');

        // Prev button
        document.addPageButton("Prev", '/sub/' + (page > 0 ? page - 1 : 0), page === 0);


        // Numbered buttons

        // Next button
        document.addPageButton("Next", '/sub/' + (page < totalPages - 1 ? page + 1 : page), page >= totalPages - 1);

        return document.build();
    } catch (error) {
        return 'An error occurred while generating the ' + atob(flash).toUpperCase() + ' configurations. ' + error;
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
        const prxMatch = url.pathname.match(
          /^\/Free-VPN-Geo-Project\/(.+[:=-]\d+)$/
        );

        if (url.pathname.length == 3 || url.pathname.match(",")) {
          // Contoh: /ID, /SG, dll
          const prxKeys = url.pathname.replace("/", "").toUpperCase().split(",");
          const prxKey = prxKeys[Math.floor(Math.random() * prxKeys.length)];
          const kvPrx = await getKVPrxList(env.KV_PRX_URL);

          prxIP = kvPrx[prxKey][Math.floor(Math.random() * kvPrx[prxKey].length)];
        } else if (prxMatch) {
          prxIP = prxMatch[1];
        } else {
          prxIP = "";
        }
        return await websocketHandler(request);
      }

      if (url.pathname.startsWith("/sub/v2rayng")) {
        const vpnType = url.searchParams.get("type");
        const bug = url.searchParams.get("bug");
        const useTls = url.searchParams.get("tls") === "true";
        const countryCodes = url.searchParams.get("country")?.toUpperCase().split(",");
        const limit = parseInt(url.searchParams.get("limit")) || 10;
        const prxBankUrl = url.searchParams.get("prx-list") || env.PRX_BANK_URL;

        let ports;
        if (url.searchParams.has("tls")) {
            ports = useTls ? [443] : [80];
        } else {
            ports = PORTS;
        }

        const result = await generateSubscription({
            countryCodes: countryCodes || [],
            limit: limit,
            vpnType: vpnType,
            ports: ports,
            bug: bug,
            prxBankUrl: prxBankUrl
        });
        
        return new Response(result.join("\n"), {
            status: 200,
            headers: { ...CORS_HEADER_OPTIONS, "Content-Type": "text/plain;charset=utf-8" },
        });
      } else if (url.pathname.startsWith("/api/v1/sub")) {
        const filterCC = url.searchParams.get("cc")?.split(",") || [];
        const filterPort = url.searchParams.get("port")?.split(",").map(p => parseInt(p)) || PORTS;
        const filterVPN = url.searchParams.get("vpn")?.split(",") || PROTOCOLS;
        const filterLimit = parseInt(url.searchParams.get("limit")) || 10;
        const filterFormat = url.searchParams.get("format") || "raw";
        const bug = url.searchParams.get("bug");
        const useWildcard = url.searchParams.get("wc") === 'true';
        const domain = url.searchParams.get("domain") || APP_DOMAIN;
        const prxBankUrl = url.searchParams.get("prx-list") || env.PRX_BANK_URL;

        const result = await generateSubscription({
            countryCodes: filterCC,
            limit: filterLimit,
            vpnType: filterVPN,
            ports: filterPort,
            bug: bug,
            useWildcard: useWildcard,
            domain: domain,
            prxBankUrl: prxBankUrl
        });

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
                        headers: { ...CORS_HEADER_OPTIONS },
                    });
                }
                break;
        }

        return new Response(finalResult, {
            status: 200,
            headers: { ...CORS_HEADER_OPTIONS },
        });
      } else if (url.pathname.startsWith("/sub")) {
        const page = url.pathname.match(/^\/sub\/(\d+)$/);
        const pageIndex = parseInt(page ? page[1] : "0");

        // Queries
        const hostname = url.searchParams.get("host") || APP_DOMAIN;
        const countrySelect = url.searchParams.get("cc")?.toUpperCase();
        const selectedProtocol = url.searchParams.get("vpn");
        const selectedPort = url.searchParams.get("port");
        const searchKeywords = url.searchParams.get("search")?.toLowerCase() || "";
        const prxBankUrl = url.searchParams.get("prx-list") || env.PRX_BANK_URL;
        let prxList = (await getPrxList(prxBankUrl)).filter((prx) => {
          // Filter prxs by Country
          if (countrySelect && countrySelect !== 'ALL') {
            if (prx.country !== countrySelect) return false;
          }

          // Filter by search keywords
          if (searchKeywords) {
              const { prxIP, prxPort, country, org } = prx;
              if (
                  !prxIP.toLowerCase().includes(searchKeywords) &&
                  !prxPort.toLowerCase().includes(searchKeywords) &&
                  !country.toLowerCase().includes(searchKeywords) &&
                  !org.toLowerCase().includes(searchKeywords)
              ) {
                  return false;
              }
          }

          return true;
        });

        const cloudflareApi = new CloudflareApi();
        const wildcardDomains = await cloudflareApi.getDomainList();

        const result = getAllConfig(request, hostname, prxList, pageIndex, selectedProtocol, selectedPort, wildcardDomains, rootDomain);
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
          } else if (wildcardApiPath.startsWith("/delete")) {
            const domainId = url.searchParams.get("id");
            const password = url.searchParams.get("password");

            if (password !== ownerPassword) {
              return new Response("Unauthorized", {
                status: 401,
                headers: { ...CORS_HEADER_OPTIONS },
              });
            }

            if (!domainId) {
              return new Response("Domain ID is required", {
                status: 400,
                headers: { ...CORS_HEADER_OPTIONS },
              });
            }

            const result = await cloudflareApi.deleteDomain(domainId);
            return new Response(result.toString(), {
              status: result,
              headers: { ...CORS_HEADER_OPTIONS },
            });
          }
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
        } else if (apiPath.startsWith("/stats")) {
          if (!isApiReady) {
              return new Response("API not ready", { status: 500 });
          }
          const cloudflareApi = new CloudflareApi();
          const stats = await cloudflareApi.getStats();
          if (stats) {
              return new Response(JSON.stringify(stats), {
                  headers: { ...CORS_HEADER_OPTIONS, 'Content-Type': 'application/json' },
              });
          }
          return new Response("Could not fetch stats", { status: 500 });
        } else if (apiPath.startsWith("/countries")) {
            await getPrxList(env.PRX_BANK_URL);
            const countries = [...new Set(cachedPrxList.map(p => p.country))].filter(Boolean);
            return new Response(JSON.stringify(countries.sort()), {
                headers: { ...CORS_HEADER_OPTIONS, 'Content-Type': 'application/json' },
            });
        }
      } else if (url.pathname === "/kuota") {
        const html = "";
        return new Response(html, {
            status: 200,
            headers: { 'Content-Type': 'text/html;charset=utf-8' },
        });
      } else if (url.pathname.startsWith("/linksub")) {
        const linksubHTML = `
<!DOCTYPE html>
<html lang="en" class="dark">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Subscription Link Generator</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    
    <style>
        root {
            --color-primary: #00d4ff;
            --color-secondary: #00bfff;
            --color-background: #020d1a;
            --color-card: rgba(0, 212, 255, 0.1);
            --color-text: #e0f4f4;
            --transition: all 0.3s ease;
        }

        body {
            display: flex;
            background: url('https://raw.githubusercontent.com/bitzblack/ip/refs/heads/main/shubham-dhage-5LQ_h5cXB6U-unsplash.jpg') no-repeat center center fixed;
            background-size: cover;
            justify-content: center;
            align-items: flex-start;
            color: var(--color-text);
            min-height: 100vh;
            font-family: 'Arial', sans-serif;
            overflow-y: auto;
        }

        .blur-background {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: -1;
            perspective: 1000px;
        }

        .blur-background::before {
            content: '';
            position: absolute;
            top: 5%;
            left: 10%;
            width: 450px;
            height: 450px;
            background: rgba(168, 85, 247, 0.5);
            border-radius: 50%;
            filter: blur(200px);
            opacity: 0.8;
            transform: translateZ(-300px);
        }

        .blur-background::after {
            content: '';
            position: absolute;
            bottom: 10%;
            right: 15%;
            width: 550px;
            height: 550px;
            background: rgba(59, 130, 246, 0.45);
            border-radius: 50%;
            filter: blur(220px);
            opacity: 0.7;
            transform: translateZ(-400px);
        }

        .container {
            width: 100%;
            max-width: 500px;
            padding: 2rem;
            max-height: 90vh;
            overflow-y: auto;
        }

        .main-title {
            color: #ffffff;
            text-shadow: 0 0 5px #a855f7, 0 0 10px rgba(168, 85, 247, 0.5);
            letter-spacing: 1px;
        }

        .form-input, .form-select {
            background-color: #1a2035;
            border: 1px solid #374151;
            color: #f8fafc;
            box-shadow: inset 0 3px 5px rgba(0, 0, 0, 0.5), 0 1px 1px rgba(255, 255, 255, 0.05);
            transition: all 0.2s;
        }
        .form-input:focus, .form-select:focus {
            outline: none;
            border-color: #6366f1;
            box-shadow: inset 0 3px 5px rgba(0, 0, 0, 0.5), 0 0 0 3px rgba(99, 102, 241, 0.5);
        }

        .btn-generate {
            background-image: linear-gradient(90deg, #a855f7, #3b82f6);
            background-size: 200% 100%;
            transition: all 0.4s ease-in-out;
            box-shadow: 0 15px 30px rgba(139, 92, 246, 0.4);
            transform: translateY(0);
        }
        .btn-generate:hover {
            background-position: right center;
            box-shadow: 0 20px 40px rgba(139, 92, 246, 0.6);
            transform: translateY(-5px);
        }
        .btn-generate:active {
            transform: translateY(0);
            box-shadow: 0 5px 10px rgba(139, 92, 246, 0.3);
        }

        .result-box {
            background-color: #1e293b;
            border: 1px solid #374151;
            box-shadow: inset 0 2px 5px rgba(0, 0, 0, 0.5);
            color: #c0c0c0;
        }

        .card {
            background: var(--color-card);
            border-radius: 16px;
            padding: 2rem;
            box-shadow: 0 10px 30px rgba(0, 212, 255, 0.1);
            backdrop-filter: blur(10px);
            border: 1px solid rgba(0, 212, 255, 0.2);
            transition: var(--transition);
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5), inset 0 0 10px rgba(255, 255, 255, 0.05);
            transform: perspective(1500px) rotateX(3deg) rotateY(-1deg) translateZ(10px);
            transition: all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
        }

        .card:hover {
            box-shadow: 0 20px 60px rgba(0, 212, 255, 0.3);
        }
    </style>
    <style>
.navbarconten {
    width: 100%;
    overflow-x: auto; /* Mengaktifkan scroll horizontal */
    margin-bottom: 0px;
    border: 1px solid #000; /* Border dengan warna abu-abu */
    border-radius: 10px; /* Membuat sudut melengkung */
    padding: 0px; /* Memberi jarak antara border dan konten */
    background-color: rgba(0, 0, 0, 0.82); /* Warna latar belakang */
    box-shadow: 0 0 15px rgba(255, 255, 255, 0.6), /* Glow putih */
              0 0 30px rgba(0, 150, 255, 0.5);   /* Glow biru */

    }
      .navbar {
            position: fixed;
            top: 60%;
            left: -80px; /* Awalnya disembunyikan */
            transform: translateY(-50%);
            width: 80px;
            background: ;
            color: white;
            padding: 10px 0;
            transition: left 0.3s ease-in-out;
            z-index: 1000;
            border-radius: 0 10px 10px 0;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 10px;
        }

        /* Saat navbar terbuka */
        .navbar.show {
            left: 0;
        }

        .navbar a img {
            width: 40px;
        }
        
        .navbar a {
            display: block;
            color: white;
            text-decoration: none;
            padding: 10px 20px;
        }
        .navbar a:hover {
            background: ;
        }
        
        /* Tombol Toggle */
        .toggle-btn {
            position: absolute;
            top: 60%;
            right: -30px; /* Posisi tombol di tengah kanan navbar */
            transform: translateY(-50%);
            background: ;
            border: none;
            cursor: pointer;
            z-index: 1001;
            padding: 10px;
            border-radius: 0 10px 10px 0;
            transition: right 0.3s ease-in-out;
        }

        .toggle-btn img {
            width: 20px; /* Ukuran gambar lebih kecil */
            height: 150px; /* Ukuran gambar lebih kecil */
        }

        /* Saat navbar terbuka, tombol ikut bergeser */
        .navbar.show .toggle-btn {
            right: -29px;
        }
        
</style>
</head>
<body>
    <div class="blur-background"></div>
    <div class="container">
    	<div class="card">
            <h1 class="text-4xl font-extrabold text-center mb-10 main-title">
                <i class="fas fa-satellite-dish mr-3 text-indigo-400"></i>Subs Link
            </h1>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div>
                    <label for="format" class="block mb-2 text-sm font-semibold text-gray-400">Format</label>
                    <select id="format" class="form-select p-3 rounded-lg w-full">
                        <option value="v2ray">V2RAY</option>
                        <option value="sfa">SFA</option>
                        <option value="bfr">BFR</option>
                        <option value="raw">RAW</option>
                        <option value="clash">CLASH</option>
                    </select>
                </div>
                <div>
                    <label for="vpn" class="block mb-2 text-sm font-semibold text-gray-400">VPN Protocol</label>
                    <select id="vpn" class="form-select p-3 rounded-lg w-full">
                        <option value="vless">VLESS</option>
                        <option value="trojan">TROJAN</option>
                        <option value="ss">SHADOWSOCKS</option>
                    </select>
                </div>
                <div>
                    <label for="tls" class="block mb-2 text-sm font-semibold text-gray-400">TLS/Port</label>
                    <select id="tls" class="form-select p-3 rounded-lg w-full">
                        <option value="true">True (443) - Secure</option>
                        <option value="false">False (80) - Regular</option>
                    </select>
                </div>
                <div>
                    <label for="wildcard" class="block mb-2 text-sm font-semibold text-gray-400">Wildcard/WC</label>
                    <select id="wildcard" class="form-select p-3 rounded-lg w-full">
                        <option value="false">False</option>
                        <option value="true">True</option>
                    </select>
                </div>
                <div class="md:col-span-2">
                    <label for="bug" class="block mb-2 text-sm font-semibold text-gray-400">Bug Host <span class="text-xs italic text-gray-500">(e.g., ava.game.naver.com)</span></label>
                    <input type="text" id="bug" class="form-input p-3 rounded-lg" placeholder="Masukkan Bug Host Anda...">
                </div>
                <div>
                    <label for="country" class="block mb-2 text-sm font-semibold text-gray-400">Country (CC)</label>
                    <select id="country" class="form-select p-3 rounded-lg w-full">
                        <option value="">All Countries</option>
                    </select>
                </div>
                <div>
                    <label for="limit" class="block mb-2 text-sm font-semibold text-gray-400">Limit</label>
                    <input type="number" id="limit" class="form-input p-3 rounded-lg" value="10" min="1">
                </div>
            </div>

            <div class="text-center mt-10">
                <button id="generate-btn" class="btn-generate w-full md:w-auto px-10 py-3 rounded-xl uppercase tracking-wider">
                    <i class="fas fa-rocket mr-2"></i> GENERATE
                </button>
            </div>

            <div class="mt-10">
                <label class="block mb-3 text-sm font-semibold text-gray-400">Generated Link:</label>
                <div id="result" class="result-box p-4 text-sm break-all">Your link will appear here...</div>
                <div class="text-right mt-3">
                    <button id="copy-btn" class="text-sm text-indigo-300 hover:text-indigo-200 font-semibold transition duration-200" style="display: none;">
                        <i class="fas fa-copy mr-1"></i> Copy Link
                    </button>
                </div>
            </div>
    	</div>
    </div>
    
<div class="navbar" id="navbar">
    <div class="toggle-btn" id="menu-btn" onclick="toggleNavbar()">
        <img src="https://geoproject.biz.id/social/buka.png" alt="Toggle Menu">
    </div>
    <div class="navbarconten text-center">
        <span>
            <a href="/linksub" target="_self" rel="noopener noreferrer">
                <img src="https://geoproject.biz.id/social/linksub.png" alt="menu" width="40" class="mt-1">
            </a>
        </span>
        <!-- <span>-->
        <span>
            <a href="/checker" target="_self" rel="noopener noreferrer">
                <img src="https://geoproject.biz.id/social/vpn.png" alt="menu" width="40" class="mt-1">
            </a>
        </span> 
        <span>
            <a href="https://t.me/VLTRSSbot" target="_blank" rel="noopener noreferrer">
                <img src="https://geoproject.biz.id/social/bot.png" alt="menu" width="40" class="mt-1">
            </a>
        </span>
        <span>
            <a href="/sub" target="_self" rel="noopener noreferrer">
                <img src="https://geoproject.biz.id/social/home.png" alt="menu" width="40" class="mt-1">
            </a>
        </span>
    </div>
</div>
<script>
    function toggleNavbar() {
        const navbar = document.getElementById("navbar");
        const menuBtn = document.getElementById("menu-btn").querySelector('img');

        if (navbar.classList.contains("show")) {
            navbar.classList.remove("show");
            menuBtn.src = "https://geoproject.biz.id/social/buka.png";
        } else {
            navbar.classList.add("show");
            menuBtn.src = "https://geoproject.biz.id/social/tutup.png";
        }
    }
</script>
    <script>
        document.addEventListener('DOMContentLoaded', async () => {
            const countrySelect = document.getElementById('country');
            
            // Fetch proxy list to populate country dropdown
            try {
                const response = await fetch('/api/v1/countries'); 
                if (!response.ok) throw new Error('Failed to fetch country list');
                
                const countries = await response.json();
                
                countries.forEach(cc => {
                    const option = document.createElement('option');
                    option.value = cc;
                    option.textContent = cc;
                    countrySelect.appendChild(option);
                });
            } catch (error) {
                console.error("Could not populate countries:", error);
                countrySelect.innerHTML = '<option value="">Could not load countries</option>';
            }

            document.getElementById('generate-btn').addEventListener('click', () => {
                const format = document.getElementById('format').value;
                const vpn = document.getElementById('vpn').value;
                const port = document.getElementById('tls').value === 'true' ? '443' : '80';
                const bug = document.getElementById('bug').value;
                const wc = document.getElementById('wildcard').value;
                const cc = document.getElementById('country').value;
                const limit = document.getElementById('limit').value;

                const params = new URLSearchParams();
                params.set('format', format);
                params.set('limit', limit);
                if (vpn) params.set('vpn', vpn);
                if (port) params.set('port', port);
                if (bug) params.set('bug', bug);
                if (wc) params.set('wc', wc);
                if (cc) params.set('cc', cc);

                const link = window.location.protocol + '//' + window.location.host + '/api/v1/sub?' + params.toString();
                
                document.getElementById('result').textContent = link;
            });
        });
    </script>
</body>
</html>`;
        return new Response(linksubHTML, { headers: { 'Content-Type': 'text/html;charset=utf-8' } });
      } else if (url.pathname.startsWith("/convert")) {
        const targetUrl = "https://jaka9m.github.io/web";
		const requestUrl = new URL(request.url);
		let path = requestUrl.pathname.replace("/convert", "");
		if (path === "" || path === "/") {
			path = "/index.html";
		}

        const newUrl = targetUrl + path;
        const newRequest = new Request(newUrl, {
            method: request.method,
            headers: request.headers,
            body: request.body,
            redirect: 'follow'
        });

        const response = await fetch(newRequest);
        const contentType = response.headers.get('content-type') || '';

        if (contentType.includes('text/html')) {
            let body = await response.text();
            
            // Rewrite absolute URLs
            body = body.replace(/https:\/\/jaka9m\.github\.io\/web/g, 'https://' + APP_DOMAIN + '/convert');
            
            // Rewrite root-relative URLs
            body = body.replace(/(src|href)="\//g, '$1="/convert/');

            return new Response(body, {
                status: response.status,
                statusText: response.statusText,
                headers: response.headers
            });
        }
        
        return new Response(response.body, {
            status: response.status,
            statusText: response.statusText,
            headers: response.headers
        });
      }

      const targetReversePrx = env.REVERSE_PRX_TARGET || "example.com";
      return await reverseWeb(request, targetReversePrx);
    } catch (err) {
      return new Response('An error occurred: ' + err.toString(), {
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

	let addressLog = '';
	let portLog = '';
	const log = (info, event) => {
		console.log('[' + addressLog + ':' + portLog + '] ' + info, event || '');
	};
	const earlyDataHeader = request.headers.get('sec-websocket-protocol') || '';

	const readableWebSocketStream = makeReadableWebSocketStream(webSocket, earlyDataHeader, log);

	let remoteSocketWrapper = {
		value: null,
	};
	let udpOutboundWriter = null;
	let isDNS = false;

	// process readableWebSocketStream
	readableWebSocketStream.pipeTo(new WritableStream({
		async write(chunk, controller) {
			if (isDNS) {
				if (udpOutboundWriter) {
					return udpOutboundWriter(chunk);
				}
				// It should not reach here.
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
			} else if (protocol === 'ss') {
				protocolHeader = readSsHeader(chunk);
			} else {
				throw new Error('Unknown Protocol!');
			}

			addressLog = protocolHeader.addressRemote;
			portLog = protocolHeader.portRemote + ' -> ' + (protocolHeader.isUDP ? 'UDP' : 'TCP');

			if (protocolHeader.hasError) {
				throw new Error(protocolHeader.message);
			}

			if (protocolHeader.isUDP) {
				if (protocolHeader.portRemote === 53) {
					isDNS = true;
					const udpOutbound = await handleUDPOutbound(webSocket, protocolHeader.version, log);
					udpOutboundWriter = udpOutbound.write;
					udpOutboundWriter(protocolHeader.rawClientData);
					return;
				} else {
					throw new Error('UDP only support for DNS port 53');
				}
			}
			handleTCPOutBound(remoteSocketWrapper, protocolHeader.addressRemote, protocolHeader.portRemote, protocolHeader.rawClientData, webSocket, protocolHeader.version, log);
		},
		close() {
			log('readableWebSocketStream is close');
		},
		abort(reason) {
			log('readableWebSocketStream is abort', JSON.stringify(reason));
		},
	})).catch((err) => {
		log('readableWebSocketStream pipeTo error', err);
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
    log('connected to ' + address + ':' + port);
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

async function handleUDPOutbound(webSocket, responseHeader, log) {
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
          const resp = await fetch(DOH_URL, {
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
            log('doh success and dns message length is ' + udpSize);
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
      log('ReadableStream was canceled, due to ' + reason);
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
        message: 'Invalid addressType for SS: ' + addressType,
      };
  }

  if (!addressValue) {
    return {
      hasError: true,
      message: 'Destination address empty, address type is: ' + addressType,
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
      message: 'command ' + cmd + ' is not supported',
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
        message: 'invild  addressType is ' + addressType,
      };
  }
  if (!addressValue) {
    return {
      hasError: true,
      message: 'addressValue is empty, addressType is ' + addressType,
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
        message: 'invalid addressType is ' + addressType,
      };
  }

  if (!addressValue) {
    return {
      hasError: true,
      message: 'address is empty, addressType is ' + addressType,
    };
  }

  const portIndex = addressValueIndex + addressLength;
  const portBuffer = dataBuffer.slice(portIndex, portIndex + 2);
  const portRemote = new DataView(portBuffer).getUint16(0);
  
  let rawClientData;
  if (isUDP) {
      // For UDP, Trojan packet is: [DST.PORT | 2] [LENGTH | 2] [CRLF | 2] [PAYLOAD]
      // The new handler expects a stream of [LENGTH | 2] [PAYLOAD]
      // We need to extract the payload and prepend the length.
      const payloadLength = new DataView(dataBuffer.slice(portIndex + 2, portIndex + 4)).getUint16(0);
      const payload = dataBuffer.slice(portIndex + 6, portIndex + 6 + payloadLength);
      
      const packet = new Uint8Array(2 + payload.byteLength);
      new DataView(packet.buffer).setUint16(0, payload.byteLength);
      packet.set(new Uint8Array(payload), 2);
      rawClientData = packet.buffer;
  } else {
    rawClientData = dataBuffer.slice(portIndex + 4);
  }

  return {
    hasError: false,
    addressRemote: addressValue,
    addressType: addressType,
    portRemote: portRemote,
    rawDataIndex: portIndex + 4,
    rawClientData: rawClientData,
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
          log('remoteConnection!.readable is close with hasIncomingData is ' + hasIncomingData);
        },
        abort(reason) {
          console.error('remoteConnection!.readable abort', reason);
        },
      })
    )
    .catch((error) => {
      console.error('remoteSocketToWS has exception ', error.stack || error);
      safeCloseWebSocket(webSocket);
    });
  if (hasIncomingData === false && retry) {
    log('retry');
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
  const req = await fetch(PRX_HEALTH_CHECK_API + '?ip=' + prxIP + ':' + prxPort);
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
    this.bearer = 'Bearer ' + apiKey;
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
    const url = 'https://api.cloudflare.com/client/v4/accounts/' + this.accountID + '/workers/domains';
    const res = await fetch(url, {
      headers: {
        ...this.headers,
      },
    });

    if (res.status == 200) {
      const respJson = await res.json();

      return respJson.result
        .filter((data) => data.service == serviceName)
        .map((data) => ({ id: data.id, hostname: data.hostname }));
    }

    return [];
  }

  async registerDomain(domain) {
    domain = domain.toLowerCase();
    const registeredDomains = await this.getDomainList();

    if (!domain.endsWith(rootDomain)) return 400;
    if (registeredDomains.includes(domain)) return 409;

    try {
      const domainTest = await fetch('https://' + domain.replaceAll("." + APP_DOMAIN, ""));
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

    const url = 'https://api.cloudflare.com/client/v4/accounts/' + this.accountID + '/workers/domains';
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

  async deleteDomain(domainId) {
    const url = 'https://api.cloudflare.com/client/v4/accounts/' + this.accountID + '/workers/domains/' + domainId;
    const res = await fetch(url, {
      method: "DELETE",
      headers: {
        ...this.headers,
      },
    });

    return res.status;
  }

  async getStats() {
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const query = 'query { viewer { accounts(filter: {accountTag: "' + this.accountID + '"}) { httpRequests1dGroups(limit: 1, filter: {date_gt: "' + yesterday + '"}) { sum { requests bytes } } } } }';

    const res = await fetch("https://api.cloudflare.com/client/v4/graphql", {
        method: 'POST',
        headers: {
            ...this.headers,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query }),
    });

    if (res.status === 200) {
        const respJson = await res.json();
        const data = respJson.data.viewer.accounts[0].httpRequests1dGroups[0].sum;
        return {
            requests: data.requests,
            bandwidth: data.bytes,
        };
    }
    return null;
  }
}


/*
let baseHTML = `
...
`;

class Document {
...
}
*/