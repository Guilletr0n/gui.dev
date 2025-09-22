// Debug: log all pointerdown events and their targets
// document.addEventListener('pointerdown', function(e) {
//     console.log('Pointerdown anywhere:', e.target);
// });

// Toggle this constant to enable/disable WebGazer for development
import { getState, setMenuLevel, getMenuLevel, getCurrentSection, setCurrentSection } from './libraries/state.js';

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
    // Centralized navigation system
    function hideAllSections() {
        const allSections = document.querySelectorAll('section');
        allSections.forEach(section => {
            section.classList.add('hidden');
        });
    }

    function hideAllNavItems() {
        const allNavItems = document.querySelectorAll('nav ul li');
        allNavItems.forEach(item => {
            item.style.display = 'none';
        });
    }

    function showMainNavItems() {
        // Hide all nav items first
        const allNavItems = document.querySelectorAll('nav ul li');
        allNavItems.forEach(item => {
            item.style.display = 'none';
        });
        
        // Show only main level items
        ['nav-home', 'nav-past', 'nav-contact'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.style.display = '';
        });
        
        // Hide back button
        const navBack = document.getElementById('nav-back');
        if (navBack) navBack.classList.add('hidden');
    }

    function showPastNavItems() {
        // Hide all nav items first
        const allNavItems = document.querySelectorAll('nav ul li');
        allNavItems.forEach(item => {
            item.style.display = 'none';
        });
        
        // Show only past submenu items
        const pastNavItems = document.querySelectorAll('[id^="nav-past-"]');
        pastNavItems.forEach(item => {
            item.style.display = '';
        });
        
        // Show back button
        const navBack = document.getElementById('nav-back');
        if (navBack) {
            navBack.style.display = '';
            navBack.classList.remove('hidden');
        }
    }

    function updateDisplay() {
        hideAllSections();
        const currentSection = getCurrentSection();
        const menuLevel = getMenuLevel();
        
        console.log('updateDisplay:', { currentSection, menuLevel });
        
        // Show the current section
        const sectionEl = document.getElementById(currentSection);
        if (sectionEl) {
            sectionEl.classList.remove('hidden');
            console.log('Showing section:', currentSection);
        } else {
            console.warn('Section not found:', currentSection);
        }
        
        // Show appropriate navigation
        if (menuLevel === 2) {
            showPastNavItems();
        } else {
            showMainNavItems();
        }
    }

    // Level 1 Navigation event handlers
    const navHome = document.getElementById('nav-home');
    const navPast = document.getElementById('nav-past');
    const navContact = document.getElementById('nav-contact');
    const navBack = document.getElementById('nav-back');

    navHome && navHome.addEventListener('click', function() {
        setCurrentSection('content_home');
        setMenuLevel(1);
        updateDisplay();
    });

    navPast && navPast.addEventListener('click', function() {
        // When clicking Past, go to level 2 but don't show specific content yet
        // Show the main experience/past overview
        setCurrentSection('content_past_experiencia');
        setMenuLevel(2);
        updateDisplay();
    });

    navContact && navContact.addEventListener('click', function() {
        setCurrentSection('content_contact');
        setMenuLevel(1);
        updateDisplay();
    });

    navBack && navBack.addEventListener('click', function() {
        // Go back to level 1 and show past overview
        setCurrentSection('content_past_experiencia');
        setMenuLevel(1);
        updateDisplay();
    });

    // Level 2 Navigation event handlers (Past submenu)
    const navPastGlowbl = document.getElementById('nav-past-glowbl');
    const navPastPeaks = document.getElementById('nav-past-peaks');
    const navPastMoven = document.getElementById('nav-past-moven');
    const navPastFreelance = document.getElementById('nav-past-freelance');

    navPastGlowbl && navPastGlowbl.addEventListener('click', function() {
        setCurrentSection('content_past_glowbl');
        setMenuLevel(2); // Stay in level 2
        updateDisplay();
    });

    navPastPeaks && navPastPeaks.addEventListener('click', function() {
        setCurrentSection('content_past_peaks');
        setMenuLevel(2); // Stay in level 2
        updateDisplay();
    });

    navPastMoven && navPastMoven.addEventListener('click', function() {
        setCurrentSection('content_past_moven');
        setMenuLevel(2); // Stay in level 2
        updateDisplay();
    });

    navPastFreelance && navPastFreelance.addEventListener('click', function() {
        setCurrentSection('content_past_freelance');
        setMenuLevel(2); // Stay in level 2
        updateDisplay();
    });

    // Initial display update
    updateDisplay();
});

// Remove old navigation logic - now handled by state-based system above

const state = getState();

window.addEventListener('storage', function(event) {
    if (event.key === 'appState') {
        // State changed in another tab, update display
        document.dispatchEvent(new CustomEvent('stateChanged'));
    }
});

document.addEventListener('stateChanged', function() {
    // This will be called when state changes
    const currentSection = getCurrentSection();
    const menuLevel = getMenuLevel();
    console.log('State changed:', { currentSection, menuLevel });
});

// Keyboard functionality
document.addEventListener('DOMContentLoaded', function() {
    const outputElement = document.getElementById('email-output');
    const keyboard = document.getElementById('keyboard');
    const backspaceButton = document.getElementById('backspace-button');
    const sendButton = document.getElementById('send-button');
    
    // Initialize output content
    let currentText = '';
    
    // Handle keyboard letter clicks
    if (keyboard) {
        keyboard.addEventListener('click', function(e) {
            const clickedElement = e.target;
            
            // Check if clicked element is a span inside li (but not backspace or send)
            if (clickedElement.tagName === 'SPAN' && 
                clickedElement.id !== 'backspace-button' && 
                clickedElement.id !== 'send-button') {
                
                const letter = clickedElement.textContent;
                currentText += letter.toLowerCase();
                updateOutput();
            }
        });
    }
    
    // Handle backspace button
    if (backspaceButton) {
        backspaceButton.addEventListener('click', function(e) {
            e.stopPropagation();
            if (currentText.length > 0) {
                currentText = currentText.slice(0, -1);
                updateOutput();
            }
        });
    }
    
    // Handle send button
    if (sendButton) {
        sendButton.addEventListener('click', function(e) {
            e.stopPropagation();
            if (currentText.trim()) {
                sendEmail(currentText);
            }
        });
    }
    
    // Update the output element
    function updateOutput() {
        if (outputElement) {
            outputElement.textContent = currentText || 'Type your email address using the keyboard below...';
        }
    }
    
    // Send email using EmailJS REST API
    async function sendEmail(emailContent) {
        try {
            const emailData = {
                service_id: 'service_2g2zppq', // Replace with your EmailJS service ID
                template_id: 'template_hxzblsa', // Replace with your EmailJS template ID
                user_id: '-9rKvdiHLRQc9YG1d', // Your public key from the HTML
                template_params: {
                    to_email: 'gurumelo.huelva@gmail.com', // Replace with your email
                    from_email: 'test@service.com', // The user's input as email
                    message: `New contact from website: ${emailContent}`
                }
            };
            
            const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(emailData)
            });
            
            if (response.ok) {
                // alert('Email sent successfully!');
                document.getElementById('email-output').textContent = 'Email sent successfully!';
                // Clear the input
                currentText = '';
                updateOutput();
            } else {
                const errorData = await response.text();
                console.error('EmailJS error:', errorData);
                document.getElementById('email-output').textContent = 'Failed to send email. Please try again.';
                // alert('Failed to send email. Please try again.');
            }
        } catch (error) {
            console.error('Error sending email:', error);
            document.getElementById('email-output').textContent = 'Network error. Please check your connection and try again.';
            // alert('Network error. Please check your connection and try again.');
        }
    }
    
    // Initialize output on page load
    updateOutput();
});
