/**
 * Domain & Website Resolution Helper for SecureNet IDS Frontend
 * Maps IP addresses to human-readable website names and organizations.
 */

export const KNOWN_WEBSITES = {
  // Public DNS Providers
  '8.8.8.8': { website: 'Google DNS', domain: 'dns.google', category: 'DNS' },
  '8.8.4.4': { website: 'Google DNS', domain: 'dns.google', category: 'DNS' },
  '1.1.1.1': { website: 'Cloudflare DNS', domain: 'one.one.one.one', category: 'DNS' },
  '1.0.0.1': { website: 'Cloudflare DNS', domain: 'one.one.one.one', category: 'DNS' },
  '9.9.9.9': { website: 'Quad9 DNS', domain: 'quad9.net', category: 'DNS' },

  // Popular Services & Platforms
  '142.250.190.46': { website: 'YouTube / Google', domain: 'youtube.com', category: 'Streaming' },
  '172.217.16.206': { website: 'Google Search', domain: 'google.com', category: 'Search' },
  '142.250.190.78': { website: 'Gmail / Workspace', domain: 'mail.google.com', category: 'Email' },
  '185.199.108.153': { website: 'GitHub Platform', domain: 'github.com', category: 'Development' },
  '140.82.121.4': { website: 'GitHub Web', domain: 'github.com', category: 'Development' },
  '151.101.65.140': { website: 'Reddit Community', domain: 'reddit.com', category: 'Social Media' },
  '104.244.42.1': { website: 'X (Twitter)', domain: 'x.com', category: 'Social Media' },
  '157.240.22.35': { website: 'Instagram', domain: 'instagram.com', category: 'Social Media' },
  '157.240.1.35': { website: 'Facebook', domain: 'facebook.com', category: 'Social Media' },
  '13.107.42.14': { website: 'LinkedIn', domain: 'linkedin.com', category: 'Professional' },
  '52.94.233.129': { website: 'Amazon AWS', domain: 'amazon.com', category: 'E-Commerce' },
  '198.41.214.162': { website: 'Wikipedia', domain: 'wikipedia.org', category: 'Knowledge' },
  '104.16.132.229': { website: 'Cloudflare Edge', domain: 'cloudflare.com', category: 'CDN' },

  // Security Simulation / Threat IPs
  '185.220.101.5': { website: 'Tor Exit Node', domain: 'tor-exit-node.org', category: 'Anonymizer' },
  '45.33.32.156': { website: 'ScanMe Nmap', domain: 'scanme.nmap.org', category: 'Scanner' },
  '91.240.118.172': { website: 'Mirai C2 Tracker', domain: 'bot-c2-tracker.net', category: 'Botnet' },
  '198.51.100.22': { website: 'Recon Scanner', domain: 'recon-sensor.test', category: 'Scanner' },
  '203.0.113.88': { website: 'Exfiltration Sink', domain: 'data-exfil-sink.org', category: 'Exfiltration' }
};

/**
 * Resolve an IP address to a human-readable website name.
 * @param {string} ip - IP address
 * @param {string} fallbackWebsite - Optional fallback website name from backend packet
 * @returns {string} Human-readable website label
 */
export function getWebsiteName(ip, fallbackWebsite = null) {
  if (fallbackWebsite && fallbackWebsite !== ip && !fallbackWebsite.startsWith('Host (')) {
    return fallbackWebsite;
  }
  if (!ip || ip === 'Unknown') return 'Unknown Host';

  if (KNOWN_WEBSITES[ip]) {
    return KNOWN_WEBSITES[ip].website;
  }

  // Local / Private networks
  if (ip === '127.0.0.1' || ip === '::1' || ip.toLowerCase() === 'localhost') {
    return 'Localhost (Self)';
  }
  if (ip === '192.168.1.1' || ip === '10.0.0.1' || ip === '172.16.0.1') {
    return `Gateway Router (${ip})`;
  }
  if (ip.startsWith('192.168.') || ip.startsWith('10.') || ip.startsWith('172.16.')) {
    return `Local LAN Device (${ip})`;
  }

  return fallbackWebsite || `Host (${ip})`;
}

/**
 * Get domain name from IP or payload.
 */
export function getDomainName(ip, fallbackDomain = null) {
  if (fallbackDomain && fallbackDomain !== ip) return fallbackDomain;
  if (KNOWN_WEBSITES[ip]) return KNOWN_WEBSITES[ip].domain;
  return ip;
}
