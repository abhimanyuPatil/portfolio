document.addEventListener('DOMContentLoaded', () => {

  // --- 0. PAGE LOADER TIMELINE ---
  const pageLoader = document.getElementById('page-loader');
  const loaderProgress = document.getElementById('loader-progress');
  const loaderLine2 = document.getElementById('loader-line-2');
  const loaderLine3 = document.getElementById('loader-line-3');

  // Disable scrolling during loading sequence
  document.body.style.overflow = 'hidden';

  // Start progress bar animation (using CSS width transition)
  setTimeout(() => {
    if (loaderProgress) loaderProgress.style.width = '100%';
  }, 50);

  // Display step-by-step console tickers
  setTimeout(() => {
    if (loaderLine2) loaderLine2.style.opacity = '1';
  }, 500);

  setTimeout(() => {
    if (loaderLine3) loaderLine3.style.opacity = '1';
  }, 1000);

  // Fade out loader after 1.8 seconds and enable scrolling
  setTimeout(() => {
    if (pageLoader) {
      pageLoader.classList.add('fade-out');
      document.body.style.overflow = '';
    }
  }, 1800);

  // Remove completely after transition finishes
  setTimeout(() => {
    if (pageLoader) pageLoader.style.display = 'none';
  }, 2400);

  // --- 1. LIVE CLOCK (IST / UTC+5:30) ---
  const clockDisplay = document.getElementById('clock-display');
  
  function updateClock() {
    const now = new Date();
    // India Standard Time is UTC+5:30. Calculate offset
    // Get UTC time first, then add offset
    const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
    const puneTime = new Date(utc + (3600000 * 5.5));
    
    let hours = puneTime.getHours();
    let minutes = puneTime.getMinutes();
    let seconds = puneTime.getSeconds();
    
    // Pad single digits with leading zero
    hours = hours < 10 ? '0' + hours : hours;
    minutes = minutes < 10 ? '0' + minutes : minutes;
    seconds = seconds < 10 ? '0' + seconds : seconds;
    
    clockDisplay.textContent = `${hours}:${minutes}:${seconds}`;
  }
  
  setInterval(updateClock, 1000);
  updateClock(); // Initial run

  // --- 2. TELEMETRY: SCROLL-DRIVEN ALTITUDE AND COORDS INTERPOLATION ---
  const altitudeTicker = document.getElementById('altitude-ticker');
  const coordsTicker = document.getElementById('coords-ticker');
  
  // Waypoints for our flight path coordinates:
  // Pune: 18.5204 N, 73.8567 E
  // Frankfurt: 50.1109 N, 8.6821 E
  // Dublin: 53.3498 N, -6.2603 W (stored as -6.2603)
  const waypoints = [
    { lat: 18.5204, lng: 73.8567, alt: 35000, label: 'PNQ' },
    { lat: 50.1109, lng: 8.6821, alt: 37000, label: 'FRA' },
    { lat: 53.3498, lng: -6.2603, alt: 38000, label: 'DUB' }
  ];

  window.addEventListener('scroll', () => {
    // Scroll progress from 0 to 1
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    if (maxScroll <= 0) return;
    const progress = window.scrollY / maxScroll;
    
    // 1. Interpolate altitude (slight cabin turbulence / cruise adjustment)
    // Base altitude oscillates slightly based on sine wave to feel "alive"
    const wave = Math.sin(Date.now() / 2000) * 120;
    
    let currentAlt = 35000;
    if (progress <= 0.5) {
      // Interpolate Pune (0) to Frankfurt (0.5)
      const p = progress / 0.5;
      currentAlt = waypoints[0].alt + (waypoints[1].alt - waypoints[0].alt) * p;
    } else {
      // Interpolate Frankfurt (0.5) to Dublin (1.0)
      const p = (progress - 0.5) / 0.5;
      currentAlt = waypoints[1].alt + (waypoints[2].alt - waypoints[1].alt) * p;
    }
    
    const displayAlt = Math.round(currentAlt + wave);
    altitudeTicker.textContent = `${displayAlt.toLocaleString()} FT`;
    
    // 2. Interpolate coordinates
    let lat = 0;
    let lng = 0;
    
    if (progress <= 0.5) {
      const p = progress / 0.5;
      lat = waypoints[0].lat + (waypoints[1].lat - waypoints[0].lat) * p;
      lng = waypoints[0].lng + (waypoints[1].lng - waypoints[0].lng) * p;
    } else {
      const p = (progress - 0.5) / 0.5;
      lat = waypoints[1].lat + (waypoints[2].lat - waypoints[1].lat) * p;
      lng = waypoints[1].lng + (waypoints[2].lng - waypoints[1].lng) * p;
    }
    
    const latStr = lat >= 0 ? `${lat.toFixed(4)}° N` : `${Math.abs(lat).toFixed(4)}° S`;
    const lngStr = lng >= 0 ? `${lng.toFixed(4)}° E` : `${Math.abs(lng).toFixed(4)}° W`;
    coordsTicker.textContent = `${latStr}, ${lngStr}`;
  });

  // --- 3. THEME TOGGLER (PERSISTED IN LOCALSTORAGE) ---
  const themeToggleBtn = document.getElementById('theme-toggle');
  
  themeToggleBtn.addEventListener('click', () => {
    const isLightMode = document.documentElement.classList.toggle('light-mode');
    const activeTheme = isLightMode ? 'light' : 'dark';
    
    // Save to localStorage
    localStorage.setItem('color-scheme', activeTheme);
    // Sync meta tag
    document.querySelector('meta[name="color-scheme"]').content = activeTheme;
  });

  // --- 4. NAVIGATION DRAWER & SCROLL SPY ---
  const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
  const mobileNavDrawer = document.getElementById('mobile-nav-drawer');
  const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');
  
  // Hamburger toggle
  mobileMenuToggle.addEventListener('click', () => {
    const isActive = mobileNavDrawer.classList.toggle('active');
    mobileMenuToggle.classList.toggle('open');
    mobileNavDrawer.setAttribute('aria-hidden', !isActive);
  });
  
  // Close drawer on link click
  mobileNavLinks.forEach(link => {
    link.addEventListener('click', () => {
      mobileNavDrawer.classList.remove('active');
      mobileMenuToggle.classList.remove('open');
      mobileNavDrawer.setAttribute('aria-hidden', 'true');
    });
  });

  // Scrollspy Highlight for Nav Links
  const sections = document.querySelectorAll('section');
  const desktopNavLinks = document.querySelectorAll('.desktop-side-nav a');
  
  window.addEventListener('scroll', () => {
    let currentSectionId = '';
    
    sections.forEach(section => {
      const sectionTop = section.offsetTop - 120;
      const sectionHeight = section.clientHeight;
      if (window.scrollY >= sectionTop && window.scrollY < sectionTop + sectionHeight) {
        currentSectionId = section.getAttribute('id');
      }
    });
    
    desktopNavLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${currentSectionId}`) {
        link.classList.add('active');
      }
    });
  });

  // Hero Section Board Button Smooth Scroll
  const heroBoardBtn = document.getElementById('hero-board-btn');
  heroBoardBtn.addEventListener('click', () => {
    document.getElementById('about').scrollIntoView({ behavior: 'smooth' });
  });

  // --- 5. INTERACTIVE WORLD MAP PIN TRIGGERS ---
  const mapPins = document.querySelectorAll('.map-pin');
  const activeLocationIndicator = document.getElementById('active-location-name');
  const mapReadoutBox = document.getElementById('map-readout-box');
  const readoutTitle = document.getElementById('readout-title');
  const readoutDetails = document.getElementById('readout-details');
  const readoutCoordsText = mapReadoutBox.querySelector('.readout-meta span:first-child');
  const readoutStatusText = mapReadoutBox.querySelector('.readout-meta span:last-child');
  
  const locationsData = {
    pune: {
      title: "Base: Pune, India",
      details: "This is my primary launchpad where I build scalable enterprise SaaS, Fintech, and cloud systems. I specialize in backend API design (Rails, Node, Spring Boot) and modern frontend architectures (React, TypeScript).",
      coords: "COORDS: 18.5204° N, 73.8567° E",
      status: "STATUS: BASE_CAMP"
    },
    frankfurt: {
      title: "Preferred Stopover: Frankfurt, Germany",
      details: "One of my preferred relocation destinations in Europe. A global financial and cloud data hub, perfect for building enterprise-grade software and scaling secure financial systems.",
      coords: "COORDS: 50.1109° N, 8.6821° E",
      status: "STATUS: TARGET_HUB"
    },
    dublin: {
      title: "Preferred Destination: Dublin, Ireland",
      details: "A key target location for senior software engineer and technical consultant stopovers. Dublin's thriving tech ecosystem offers incredible opportunities for cloud and SaaS innovation.",
      coords: "COORDS: 53.3498° N, 6.2603° W",
      status: "STATUS: TARGET_PORTAL"
    }
  };

  mapPins.forEach(pin => {
    pin.addEventListener('click', () => {
      // Remove active class from all pins
      mapPins.forEach(p => p.classList.remove('active'));
      // Add active class to clicked pin
      pin.classList.add('active');
      
      const locKey = pin.getAttribute('data-location');
      const data = locationsData[locKey];
      
      // Update HUD interface elements
      activeLocationIndicator.textContent = `CURRENT STOP: ${locKey.toUpperCase()}`;
      
      // Fade content in readout box
      mapReadoutBox.style.opacity = 0;
      setTimeout(() => {
        readoutTitle.textContent = data.title;
        readoutDetails.textContent = data.details;
        readoutCoordsText.textContent = data.coords;
        readoutStatusText.textContent = data.status;
        mapReadoutBox.style.opacity = 1;
      }, 200);
    });
  });

  // --- 6. SCROLL PROGRESS TIMELINE & PASSING PLANE ---
  const timelineSection = document.getElementById('timeline');
  const activeFlightLine = document.getElementById('active-flight-line');
  const scrollAirplane = document.getElementById('scroll-airplane');
  const timelineStops = document.querySelectorAll('.timeline-item');
  
  function updateTimelineScroll() {
    const sectionRect = timelineSection.getBoundingClientRect();
    const containerTop = sectionRect.top + window.scrollY;
    const containerHeight = sectionRect.height;
    
    // Calculate current position relative to timeline
    const startY = containerTop - (window.innerHeight / 2);
    const endY = containerTop + containerHeight - (window.innerHeight / 2);
    
    let progress = 0;
    if (window.scrollY > startY) {
      progress = (window.scrollY - startY) / (endY - startY);
    }
    progress = Math.max(0, Math.min(1, progress));
    
    // Scale timeline path line height
    activeFlightLine.style.height = `${progress * 100}%`;
    scrollAirplane.style.top = `${progress * 100}%`;
    
    // Slight airplane flight tilt based on scrolling speed/direction
    // Simple mock tilt:
    if (progress > 0 && progress < 1) {
      scrollAirplane.style.transform = `translate(-50%, -50%) rotate(90deg)`;
    }
    
    // Check intersection with stops to trigger stamps
    timelineStops.forEach(stop => {
      const stopRect = stop.getBoundingClientRect();
      const triggerPoint = window.innerHeight * 0.65; // trigger when stop is 65% down viewport
      
      if (stopRect.top < triggerPoint) {
        stop.classList.add('active');
      } else {
        stop.classList.remove('active');
      }
    });
  }
  
  window.addEventListener('scroll', updateTimelineScroll);
  window.addEventListener('resize', updateTimelineScroll);
  updateTimelineScroll(); // Initial run

  // --- 7. DIGITAL POSTCARD FLIP & POSTMARK STAMPS ---
  const postcardCard = document.getElementById('postcard-card');
  const postcardFlipBack = document.getElementById('postcard-flip-back');
  const contactForm = document.getElementById('contact-form');
  const stampTrigger = document.getElementById('stamp-interactive-trigger');
  const cancellationMark = document.getElementById('cancellation-mark');
  
  // Flip front to back
  postcardCard.querySelector('.postcard-front').addEventListener('click', () => {
    postcardCard.classList.add('flipped');
  });
  
  // Flip back to front
  postcardFlipBack.addEventListener('click', (e) => {
    e.preventDefault();
    postcardCard.classList.remove('flipped');
  });
  
  // Clicking the stamp box itself toggles decorative stamp
  stampTrigger.addEventListener('click', () => {
    stampTrigger.classList.toggle('stamped');
  });
  
  // Form Dispatch Logic
  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    // Collect data to make it real
    const name = document.getElementById('form-name').value;
    const email = document.getElementById('form-email').value;
    const msg = document.getElementById('form-msg').value;
    
    if (!name || !email || !msg) return;
    
    // 1. Force the stamp overlay active
    stampTrigger.classList.add('stamped');
    
    // 2. Play stamp sound (visual feedback)
    // Add visual classes to trigger the red cancel postal marks
    cancellationMark.style.opacity = '1';
    cancellationMark.style.transform = 'scale(1) rotate(-8deg)';
    
    // 3. Show dispatch alert
    const sendBtn = document.getElementById('postcard-send-btn');
    const originalBtnText = sendBtn.innerHTML;
    
    sendBtn.disabled = true;
    sendBtn.style.backgroundColor = 'var(--accent-green)';
    sendBtn.style.color = '#000';
    sendBtn.innerHTML = `<span>DISPATCHED! FLY SAFE ✈</span>`;
    
    // Mock successful API post
    console.log("Nomad Postcard Data Dispatched:", { name, email, msg });
    
    // Reset after delay and flip postcard back
    setTimeout(() => {
      contactForm.reset();
      stampTrigger.classList.remove('stamped');
      cancellationMark.style.opacity = '0';
      cancellationMark.style.transform = 'scale(1.5) rotate(-15deg)';
      
      sendBtn.disabled = false;
      sendBtn.style.backgroundColor = 'var(--text-primary)';
      sendBtn.style.color = 'var(--bg-primary)';
      sendBtn.innerHTML = originalBtnText;
      
      // Flip back to front
      postcardCard.classList.remove('flipped');
    }, 4000);
  });
  
});
