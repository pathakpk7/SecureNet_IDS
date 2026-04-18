import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import '../styles/pages/cyber-landing.css';

gsap.registerPlugin(ScrollTrigger);

const CyberLanding = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const canvasRef = useRef(null);
  const nodesRef = useRef([]);

  // Network Visualization Engine
  useEffect(() => {
    const canvas = document.getElementById("network-canvas");
    if (!canvas) return;
    
    const ctx = canvas.getContext("2d");

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const nodes = nodesRef.current;

    // Initialize nodes with flow
    for (let i = 0; i < 40; i++) {
      const angle = (i / 40) * Math.PI * 2;
      nodes.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        z: Math.random() * 1, // depth (0–1)
        vx: Math.cos(angle) * 0.5,
        vy: Math.sin(angle) * 0.5,
        vy: 0,
        type: Math.random() > 0.8 ? "threat" : "normal"
      });
    }

    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Sort nodes by depth for proper rendering
      nodes.sort((a, b) => a.z - b.z);

      nodes.forEach((node, i) => {
        node.x += node.vx;
        node.y += node.vy;

        // Depth-based rendering
        const scale = 0.5 + node.z * 0.5;
        const alpha = 0.3 + node.z * 0.7;

        // draw node with glow
        ctx.beginPath();
        ctx.arc(node.x, node.y, 2 * scale, 0, Math.PI * 2);
        
        // Glow effect
        ctx.shadowBlur = 10;
        ctx.shadowColor = node.type === "threat" ? "#ff3366" : "#00ffff";
        
        ctx.fillStyle = node.type === "threat" ? "#ff3366" : "#00ffff";
        ctx.globalAlpha = alpha;
        ctx.fill();
        
        // Reset shadow
        ctx.shadowBlur = 0;
        ctx.globalAlpha = 1;

        // draw intelligent connections
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = node.x - nodes[j].x;
          const dy = node.y - nodes[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const opacity = 1 - dist / 120;

          ctx.strokeStyle = node.type === "threat" || nodes[j].type === "threat"
            ? `rgba(255,50,80,${opacity})` 
            : `rgba(0,255,255,${opacity})`;
          ctx.beginPath();
          ctx.moveTo(node.x, node.y);
          ctx.lineTo(nodes[j].x, nodes[j].y);
          ctx.stroke();
        }

        // boundary bounce
        if (node.x < 0 || node.x > canvas.width) node.vx *= -1;
        if (node.y < 0 || node.y > canvas.height) node.vy *= -1;
      });

      // Attack pulse effect
      if (attackPulse > 0) {
        nodes.forEach(n => {
          n.vx += (Math.random() - 0.5) * 2;
          n.vy += (Math.random() - 0.5) * 2;
        });
        attackPulse *= 0.95;
      }

      requestAnimationFrame(draw);
    }

    draw();

    return () => {
      // Cleanup handled by GSAP context
    };
  }, []);

  // Network Reaction to Scroll
  useEffect(() => {
    ScrollTrigger.create({
      trigger: ".scene-3",
      start: "top center",
      onEnter: () => {
        nodes.forEach(n => {
          n.vx *= 3;
          n.vy *= 3;
        });
      },
      onLeaveBack: () => {
        nodes.forEach(n => {
          n.vx *= 0.3;
          n.vy *= 0.3;
        });
      }
    });
  }, []);

  // Cyber Intelligence Systems
  let attackPulse = 0;
  let activeThreats = [];
  let gctx = null;
  let wctx = null;

  // Geo Attack Map
  useEffect(() => {
    const geoCanvas = document.getElementById("geo-canvas");
    if (!geoCanvas) return;
    
    const gctx = geoCanvas.getContext("2d");

    geoCanvas.width = window.innerWidth;
    geoCanvas.height = window.innerHeight;

    // Pseudo world locations (simulate regions)
    const locations = [
      { x: 0.2, y: 0.3 }, // US
      { x: 0.5, y: 0.4 }, // EU
      { x: 0.7, y: 0.6 }, // Asia
      { x: 0.6, y: 0.7 }  // India
    ];

    function drawGeo() {
      gctx.clearRect(0, 0, geoCanvas.width, geoCanvas.height);

      locations.forEach((loc) => {
        const x = loc.x * geoCanvas.width;
        const y = loc.y * geoCanvas.height;

        gctx.beginPath();
        gctx.arc(x, y, 4, 0, Math.PI * 2);
        gctx.fillStyle = "#00ffff";
        gctx.fill();
      });

      // Attack lines
      for (let i = 0; i < locations.length; i++) {
        const a = locations[i];
        const b = locations[(i + 1) % locations.length];

        gctx.strokeStyle = "rgba(255,50,80,0.3)";
        gctx.beginPath();
        gctx.moveTo(a.x * geoCanvas.width, a.y * geoCanvas.height);
        gctx.lineTo(b.x * geoCanvas.width, b.y * geoCanvas.height);
        gctx.stroke();
      }

      requestAnimationFrame(drawGeo);
    }

    drawGeo();
  }, []);

  // Real-Time Threat Highlighting
  useEffect(() => {
    const networkCanvas = document.getElementById("network-canvas");
    if (!networkCanvas) return;
    
    const ctx = networkCanvas.getContext("2d");

    function drawThreats() {
      activeThreats.forEach((t, i) => {
        ctx.beginPath();
        ctx.arc(t.x, t.y, 6, 0, Math.PI * 2);
        ctx.fillStyle = "red";
        ctx.fill();

        t.life -= 0.02;
        if (t.life <= 0) activeThreats.splice(i, 1);
      });
    }

    // Random threat spawning
    function spawnThreat() {
      const node = nodes[Math.floor(Math.random() * nodes.length)];
      activeThreats.push({ ...node, life: 1 });
    }

    setInterval(() => {
      if (Math.random() > 0.98) spawnThreat();
      drawThreats();
    }, 2000);

  }, []);

  // AI Prediction Wave
  useEffect(() => {
    const waveCanvas = document.getElementById("ai-wave");
    if (!waveCanvas) return;
    
    const wctx = waveCanvas.getContext("2d");

    waveCanvas.width = window.innerWidth;
    waveCanvas.height = 200;

    let time = 0;

    function drawWave() {
      wctx.clearRect(0, 0, waveCanvas.width, waveCanvas.height);

      wctx.beginPath();

      for (let x = 0; x < waveCanvas.width; x++) {
        const y =
          Math.sin(x * 0.01 + time) * 20 +
          Math.sin(x * 0.02 + time * 0.5) * 10 +
          100;

        wctx.lineTo(x, y);
      }

      // Prediction spikes
      if (Math.random() > 0.98) {
        wctx.strokeStyle = "#ff3366";
      } else {
        wctx.strokeStyle = "#00ffff";
      }

      wctx.stroke();

      time += 0.05;
      requestAnimationFrame(drawWave);
    }

    drawWave();
  }, []);

  // Attack Pulse System
  const triggerAttack = () => {
    attackPulse = 1;
  };

  // Mouse Interaction
  useEffect(() => {
    const handleMouseMove = (e) => {
      nodes.forEach(n => {
        const dx = e.clientX - n.x;
        const dy = e.clientY - n.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 150) {
          n.vx += dx * 0.0001;
          n.vy += dy * 0.0001;
        }
      });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // GSAP Scroll System
  useEffect(() => {
    const ctx = gsap.context(() => {

      // PARALLAX MOTION WITH DEPTH
      gsap.to(".layer-back", {
        y: 300,
        scale: 1.2,
        scrollTrigger: {
          scrub: true
        }
      });

      gsap.to(".layer-mid", {
        y: 150,
        scale: 1.1,
        scrollTrigger: {
          scrub: true
        }
      });

      gsap.to(".layer-front", {
        y: 50,
        scale: 1.05,
        scrollTrigger: {
          scrub: true
        }
      });

      // CAMERA EFFECT
      gsap.to(".cyber-container", {
        rotateX: 5,
        rotateY: 5,
        scrollTrigger: {
          scrub: true
        }
      });

      // CORE TRANSFORMATION
      gsap.to(".cyber-core", {
        scale: 2.2,
        rotation: 360,
        scrollTrigger: {
          trigger: ".scene-1",
          start: "top top",
          end: "bottom top",
          scrub: true
        }
      });

      // SCENE REVEAL
      gsap.utils.toArray(".scene").forEach((scene) => {
        gsap.from(scene, {
          opacity: 0,
          y: 120,
          scrollTrigger: {
            trigger: scene,
            start: "top 85%",
            end: "top 30%",
            scrub: true
          }
        });
      });

      // TIMELINE ANIMATION
      gsap.from(".timeline-item", {
        x: -120,
        opacity: 0,
        stagger: 0.3,
        scrollTrigger: {
          trigger: ".scene-5",
          start: "top center"
        }
      });

      // Attack Pulse Trigger
      ScrollTrigger.create({
        trigger: ".scene-3",
        start: "top center",
        onEnter: () => triggerAttack()
      });

    // Threat Intensity Triggers
    ScrollTrigger.create({
      trigger: ".scene-3",
      start: "top center",
      onEnter: () => {
        activeThreats.length = 0;
        for (let i = 0; i < 10; i++) spawnThreat();
      },
      onLeaveBack: () => {
        activeThreats = [];
      }
    });
  });

    return () => ctx.revert();
  }, []);

  return (
    <div className="cyber-container">
      {/* Parallax Layers */}
      <div className="parallax-layer layer-back"></div>
      <div className="parallax-layer layer-mid"></div>
      <div className="parallax-layer layer-front"></div>
      
      <div className="cyber-core"></div>
      <canvas id="network-canvas"></canvas>
      <canvas id="geo-canvas"></canvas>
      <canvas id="ai-wave"></canvas>

      {/* Scene 1 - Hero */}
      <section className="scene scene-1">
        <div className="hero-content">
          <div className="hero-text">
            <h1 className="hero-title">
              <span className="glitch">SecureNet</span>
              <span className="hero-subtitle">IDS</span>
            </h1>
            <p className="hero-description">
              Next-Generation Threat Detection & Response
            </p>
          </div>
          <div className="hero-cta">
            <Link to="/login" className="cta-button glass">
              Launch Dashboard
            </Link>
            <Link to="/signup" className="cta-button secondary">
              Get Started
            </Link>
          </div>
        </div>
        
        {/* Animated background */}
        <div className="hero-grid" />
        <div className="hero-pulse" />
      </section>

      {/* Scene 2 - Problem */}
      <section className="scene scene-2">
        <div className="container">
          <h2 className="section-title">The Cyber Threat Landscape</h2>
          <div className="threat-list">
            <div className="threat-item">
              <span className="threat-icon">🔥</span>
              <h3>Rising Attacks</h3>
              <p>Cyber attacks increase by 38% annually. Traditional security systems can't keep pace.</p>
            </div>
            <div className="threat-item">
              <span className="threat-icon">⚡</span>
              <h3>Zero-Day Exploits</h3>
              <p>Unknown vulnerabilities bypass conventional defenses in seconds.</p>
            </div>
            <div className="threat-item">
              <span className="threat-icon">🎯</span>
              <h3>Advanced Threats</h3>
              <p>AI-powered attacks adapt and evolve faster than human response.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Scene 3 - Activation */}
      <section className="scene scene-3">
        <div className="container">
          <h2 className="section-title">Intelligent Defense Activation</h2>
          <div className="activation-steps">
            <div className="step">
              <h3>01 Detect</h3>
              <p>AI-powered threat identification in milliseconds</p>
            </div>
            <div className="step">
              <h3>02 Analyze</h3>
              <p>Predictive threat assessment and risk scoring</p>
            </div>
            <div className="step">
              <h3>03 Respond</h3>
              <p>Automated incident response and neutralization</p>
            </div>
          </div>
        </div>
      </section>

      {/* Scene 4 - Intelligence */}
      <section className="scene scene-4">
        <div className="container">
          <h2 className="section-title">Threat Intelligence Engine</h2>
          <div className="intel-showcase">
            <div className="intel-feature">
              <span className="intel-icon">🧠</span>
              <h3>AI Analysis</h3>
              <p>94.7% Accuracy • 1.2s Response</p>
            </div>
            <div className="intel-feature">
              <span className="intel-icon">🔮</span>
              <h3>Prediction</h3>
              <p>85% Threat Forecast • 24/7 Monitoring</p>
            </div>
            <div className="intel-feature">
              <span className="intel-icon">🛡️</span>
              <h3>Protection</h3>
              <p>99.9% Uptime • 156 Threats Blocked</p>
            </div>
          </div>
        </div>
      </section>

      {/* Scene 5 - Response */}
      <section className="scene scene-5">
        <div className="container">
          <h2 className="section-title">Incident Response Timeline</h2>
          <div className="timeline">
            <div className="timeline-item">
              <div className="timeline-time">[12:01:45]</div>
              <div className="timeline-event">
                <span className="event-type">DETECT</span>
                <span className="event-description">Suspicious activity detected</span>
              </div>
              <div className="timeline-indicator pulse" />
            </div>
            <div className="timeline-item">
              <div className="timeline-time">[12:01:47]</div>
              <div className="timeline-event">
                <span className="event-type">ANALYZE</span>
                <span className="event-description">AI threat assessment in progress</span>
              </div>
              <div className="timeline-indicator" />
            </div>
            <div className="timeline-item">
              <div className="timeline-time">[12:01:52]</div>
              <div className="timeline-event">
                <span className="event-type">RESPOND</span>
                <span className="event-description">Automated response activated</span>
              </div>
              <div className="timeline-indicator success" />
            </div>
          </div>
        </div>
      </section>

      {/* Scene 6 - CTA */}
      <section className="scene scene-6">
        <div className="container">
          <div className="cta-content">
            <h2 className="cta-title">Enter SecureNet Intelligence System</h2>
            <p className="cta-description">
              Join thousands of organizations protected by SecureNet IDS
            </p>
            <div className="cta-buttons">
              <Link to="/login" className="cta-button primary glow">
                Access Dashboard
              </Link>
              <Link to="/signup" className="cta-button secondary glass">
                Start Free Trial
              </Link>
            </div>
            <div className="cta-stats">
              <div className="stat-item">
                <span className="stat-number">10,000+</span>
                <span className="stat-text">Threats Blocked Daily</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">99.9%</span>
                <span className="stat-text">System Uptime</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">24/7</span>
                <span className="stat-text">Monitoring</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Minimal floating elements */}
      <div className="floating-elements">
        <div className="float-element" style={{ left: '15%', top: '25%' }}></div>
        <div className="float-element" style={{ left: '75%', top: '70%' }}></div>
      </div>
    </div>
  );
};

export default CyberLanding;
