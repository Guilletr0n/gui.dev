
// Toggle this constant to enable/disable WebGazer for development
const ENABLE_WEBGAZER = false;

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
        {x:0.1, y:0.1}, {x:0.5, y:0.1}, {x:0.9, y:0.1},
        {x:0.1, y:0.5}, {x:0.5, y:0.5}, {x:0.9, y:0.5},
        {x:0.1, y:0.9}, {x:0.5, y:0.9}, {x:0.9, y:0.9}
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
        dot.addEventListener('click', function() {
            // Take a sample for calibration
            if (window.webgazer && typeof window.webgazer.recordScreenPosition === 'function') {
                window.webgazer.recordScreenPosition(dotPositions[currentDot].x * window.innerWidth, dotPositions[currentDot].y * window.innerHeight, 'click');
            }
            calibrationSamples.push({x: dotPositions[currentDot].x, y: dotPositions[currentDot].y, time: Date.now()});
            currentDot++;
            showNextDot();
        });
        calibrationDots.appendChild(dot);
    }

    calibrationDone.addEventListener('click', function() {
        calibrationContainer.style.display = 'none';
    });

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
            window.webgazer.setGazeListener(function(data, elapsedTime) {
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
    if (!ENABLE_WEBGAZER) {
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

document.addEventListener('DOMContentLoaded', function() {
    const navHome = document.getElementById('nav-home');
    const navExperiencia = document.getElementById('nav-experiencia');
    const navContact = document.getElementById('nav-contact');

    const contentHome = document.querySelector('article:nth-of-type(1)');
    const contentExperiencia = document.getElementById('content_experiencia');
    const contentContact = document.getElementById('content_contact');

    function hideAllSections() {
        contentHome.classList.add('hidden');
        contentExperiencia.classList.add('hidden');
        contentContact.classList.add('hidden');
    }

    navHome.addEventListener('click', function() {
        hideAllSections();
        contentHome.classList.remove('hidden');
    });

    navExperiencia.addEventListener('click', function() {
        hideAllSections();
        contentExperiencia.classList.remove('hidden');
    });

    navContact.addEventListener('click', function() {
        hideAllSections();
        contentContact.classList.remove('hidden');
    });
});

document.addEventListener('DOMContentLoaded', function() {
    const navItems = [
        document.getElementById('nav-home'),
        document.getElementById('nav-experiencia'),
        document.getElementById('nav-contact')
    ];

    navItems.forEach(function(item) {
        item.addEventListener('click', function() {
            navItems.forEach(function(nav) {
                nav.classList.remove('active');
            });
            item.classList.add('active');
        });
    });
});
