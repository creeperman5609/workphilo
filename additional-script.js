// Additional JavaScript for dynamic assets and effects
// You can add more functions here for interactive elements

// Example: Add a click effect to the main content
document.addEventListener('DOMContentLoaded', function() {
    const pageContent = document.querySelector('.page-content');

    pageContent.addEventListener('click', function() {
        // Add any click effects or dynamic changes here
        console.log('Content clicked!');
    });
});

// Example: Load additional CSS dynamically
function loadAdditionalCSS(href) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;
    document.head.appendChild(link);
}

// Example: Load additional JS dynamically
function loadAdditionalJS(src) {
    const script = document.createElement('script');
    script.src = src;
    document.head.appendChild(script);
}

// Uncomment to load additional assets:
// loadAdditionalCSS('assets/extra-styles.css');
// loadAdditionalJS('assets/extra-script.js');