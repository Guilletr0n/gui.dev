// Debug: log all pointerdown events and their targets
// document.addEventListener('pointerdown', function(e) {
//     console.log('Pointerdown anywhere:', e.target);
// });

// Toggle this constant to enable/disable WebGazer for development
import { getState, setMenuLevel } from './libraries/state.js';

const ENABLE_WEBGAZER = false;

const navigation = {
    "main": {
        "home": "Home",
        "past": "Past",
        "contact": "Contact"
    },
    "past": {
        "glowbl": "Experience at Glowbl",
        "Peaks": "Experience at Peaks",
        "freelance": "Freelance projects",
        "Moven": "Experience at Moven"
    }
}

window.addEventListener('DOMContentLoaded', function () {
    function moveWebgazerElements() {
        var wgContainer = document.getElementById('webgazerVideoContainer');
        var video = document.getElementById('webgazerVideoFeed');
        var overlay = document.getElementById('webgazerVideoCanvas');
        if (ENABLE_WEBGAZER && wgContainer && video && overlay) {
            wgContainer.appendChild(video);
            wgContainer.appendChild(overlay);
        } else {
            setTimeout(moveWebgazerElements, 100);
        }
    }
    if (ENABLE_WEBGAZER) moveWebgazerElements();

    // Calibration UI logic
    const calibrationContainer = document.getElementById('calibrationContainer');
    const calibrationDots = document.getElementById('calibrationDots');
    const calibrationDone = document.getElementById('calibrationDone');
    const dotPositions = [
        { x: 0.1, y: 0.1 }, { x: 0.5, y: 0.1 }, { x: 0.9, y: 0.1 },
        { x: 0.1, y: 0.5 }, { x: 0.5, y: 0.5 }, { x: 0.9, y: 0.5 },
        { x: 0.1, y: 0.9 }, { x: 0.5, y: 0.9 }, { x: 0.9, y: 0.9 }
    ];
    let currentDot = 0;
    let calibrationSamples = [];

    function showNextDot() {
        calibrationDots.innerHTML = '';
        if (currentDot >= dotPositions.length) {
            calibrationDone.style.display = 'block';
            return;
        }
        calibrationDone.style.display = 'none';
        const dot = document.createElement('div');
        dot.style.position = 'absolute';
        dot.style.width = '40px';
        dot.style.height = '40px';
        dot.style.borderRadius = '50%';
        dot.style.background = 'red';
        dot.style.left = (dotPositions[currentDot].x * calibrationDots.offsetWidth - 20) + 'px';
        dot.style.top = (dotPositions[currentDot].y * calibrationDots.offsetHeight - 20) + 'px';
        dot.style.cursor = 'pointer';
        dot.addEventListener('click', function () {
            // Take a sample for calibration
            if (window.webgazer && typeof window.webgazer.recordScreenPosition === 'function') {
                window.webgazer.recordScreenPosition(dotPositions[currentDot].x * window.innerWidth, dotPositions[currentDot].y * window.innerHeight, 'click');
            }
            calibrationSamples.push({ x: dotPositions[currentDot].x, y: dotPositions[currentDot].y, time: Date.now() });
            currentDot++;
            showNextDot();
        });
        calibrationDots.appendChild(dot);
    }
    if (ENABLE_WEBGAZER) {
        calibrationDone.addEventListener('click', function () {
            calibrationContainer.style.display = 'none';
        });
    }

    // Resize dots container on window resize
    function resizeDots() {
        calibrationDots.style.width = (window.innerWidth * 0.8) + 'px';
        calibrationDots.style.height = (window.innerHeight * 0.6) + 'px';
    }
    window.addEventListener('resize', resizeDots);
    if (ENABLE_WEBGAZER) {
        resizeDots();
        showNextDot();
    }

    // Wait for webgazer to be available
    function waitForWebgazer() {
        if (!ENABLE_WEBGAZER) return;
        if (window.webgazer && typeof window.webgazer.setGazeListener === 'function') {
            window.webgazer.setGazeListener(function (data, elapsedTime) {
                if (data == null) {
                    // console.log('No gaze data', {elapsedTime});
                    return;
                }
                var x = data.x;
                var y = data.y;
                var target = document.getElementById('webgazerTarget');
                if (target) {
                    target.style.position = 'absolute';
                    target.style.left = (x - target.offsetWidth / 2) + 'px';
                    target.style.top = (y - target.offsetHeight / 2) + 'px';
                }
            }).begin();
        } else {
            setTimeout(waitForWebgazer, 100);
        }
    }
    waitForWebgazer();
    if (ENABLE_WEBGAZER) {
        calibrationContainer.style.display = 'none';
    }
});

const globalStatus = {
    isCalibrated: false,
    isTracking: false,
    mainMenu: {
        selectedItem: null
    }
}

document.addEventListener('DOMContentLoaded', function () {
    const navHome = document.getElementById('nav-home');
    const navExperiencia = document.getElementById('nav-past');
    const navContact = document.getElementById('nav-contact');

    const contentHome = document.getElementById('content_home');
    const contentExperiencia = document.getElementById('content_experiencia');
    const contentContact = document.getElementById('content_contact');

    function showSection(section) {
        [contentHome, contentExperiencia, contentContact].forEach(function (el) {
            if (el === section) {
                el.classList.remove('hidden');
            } else {
                el.classList.add('hidden');
            }
        });
    }

    navHome.addEventListener('click', function () {
        showSection(contentHome);
    });


    // Helper to show/hide nav-past-* items
    function setPastNavItemsVisible(visible) {
        const pastNavs = document.querySelectorAll('[id^="nav-past-"]');
        pastNavs.forEach(function (item) {
            if (visible) {
                item.classList.remove('hidden');
            } else {
                item.classList.add('hidden');
            }
        });
    }

    navExperiencia.addEventListener('click', function () {
        showSection(contentExperiencia);
        setPastNavItemsVisible(true);
    });

    // Hide nav-past-* items when other navs are clicked
    navHome.addEventListener('click', function () {
        showSection(contentHome);
        setPastNavItemsVisible(false);
    });
    navContact.addEventListener('click', function () {
        showSection(contentContact);
        setPastNavItemsVisible(false);
    });

    navContact.addEventListener('click', function () {
        showSection(contentContact);
    });
});

document.addEventListener('DOMContentLoaded', function () {
    console.log('Setting up navigation event listeners');
    const navIds = ['nav-home', 'nav-past', 'nav-contact'];
    const navItems = navIds.map(id => {
        const el = document.getElementById(id);
        if (!el) {
            console.warn(`Element with id '${id}' not found in DOM.`);
        }
        return el;
    });

    // Add pointerdown to each nav item as before
    navItems.forEach(function (item) {
        if (!item) return;
        console.log('Attaching pointerdown listener to:', item.id);
        item.addEventListener('pointerdown', function (e) {
            console.log(`Navigation item ${item.id} activated via pointerdown`);
            navItems.forEach(function (nav) {
                if (nav) nav.classList.remove('active');
            });
            item.classList.add('active');
        });
    });

    // Add pointerdown to nav parent (event delegation)
    const navParent = document.querySelector('nav');
    if (navParent) {
        navParent.addEventListener('pointerdown', function (e) {
            const target = e.target.closest('#nav-home, #nav-past, #nav-contact');
            if (target) {
                console.log(`(Delegated) Navigation item ${target.id} activated via pointerdown`);
                navItems.forEach(function (nav) {
                    if (nav) nav.classList.remove('active');
                });
                target.classList.add('active');
            }
        });
    }

    // Add pointerdown to body (bubbling, last resort)
    document.body.addEventListener('pointerdown', function (e) {
        const target = e.target.closest('#nav-home, #nav-past, #nav-contact');
        if (target) {
            console.log(`(Body delegated) Navigation item ${target.id} activated via pointerdown`);
            navItems.forEach(function (nav) {
                if (nav) nav.classList.remove('active');
            });
            target.classList.add('active');
        }
    });
});

// Additional logic can be added here for more complex navigation handling
document.addEventListener('DOMContentLoaded', function () {
    let main_menu_level = 1;
    const navPast = document.getElementById('nav-past');
    const pastNavItems = Array.from(document.querySelectorAll('[id^="nav-past-"]'));
    const navItems = Array.from(document.querySelectorAll('nav ul li'));
    const navBack = document.getElementById('nav-back');
    function showPastNavItems() {
        // Show only nav-past-* items and nav-back, hide others
        navItems.forEach(item => {
            if (!item) return;
            if (pastNavItems.includes(item) || item === navBack) {
                item.style.display = '';
            } else {
                item.style.display = 'none';
            }
        });
        navBack.classList.remove('hidden');
    }

    function hidePastNavItems() {
        // Hide all nav-past-* items, show main nav items
        pastNavItems.forEach(item => {
            item.style.display = 'none';
        });
        // Show main nav items (home, past, contact)
        ['nav-home', 'nav-past', 'nav-contact'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.style.display = '';
        });
        if (navBack) navBack.classList.add('hidden');
    }

    // Hide past nav items initially
    hidePastNavItems();

    navPast && navPast.addEventListener('click', function () {
        main_menu_level = 2;
        setMenuLevel(main_menu_level);
        showPastNavItems();
    });

    navBack && navBack.addEventListener('click', function () {
        main_menu_level = 1;
        setMenuLevel(main_menu_level);
        hidePastNavItems();
    });

    // Hide them when other nav items are clicked
    const navHome = document.getElementById('nav-home');
    const navContact = document.getElementById('nav-contact');
    navHome && navHome.addEventListener('click', hidePastNavItems);
    navContact && navContact.addEventListener('click', hidePastNavItems);
});

const state = getState();

window.addEventListener('storage', function(event) {
    if (event.key === 'appState') {
        updateUI();
    }
});

function updateUI() {
    const state = getState();
    // Update the menu level
    setMenuLevel(state.menuLevel);
}