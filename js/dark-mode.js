document.addEventListener('DOMContentLoaded', () => {
  // Get or create dark mode toggle button
  let darkModeToggle = document.getElementById('dark-mode-toggle');

  if (!darkModeToggle) {
    console.log('Creating dark mode toggle button');
    darkModeToggle = document.createElement('button');
    darkModeToggle.id = 'dark-mode-toggle';
    darkModeToggle.className = 'dark-mode-toggle';
    darkModeToggle.setAttribute('aria-label', 'Toggle Dark Mode');
    darkModeToggle.innerHTML = '<i class="fas fa-moon"></i>';
    document.body.appendChild(darkModeToggle);
  }

  // Check for stored preference
  const prefersDarkMode = localStorage.getItem('darkMode') === 'true';

  // Initialize dark mode based on preference
  if (prefersDarkMode) {
    document.documentElement.classList.add('dark-mode');
    document.body.classList.add('dark-mode');
    darkModeToggle.innerHTML = '<i class="fas fa-sun"></i>';
  }

  // Add click event listener
  darkModeToggle.addEventListener('click', () => {
    // Toggle dark mode class on html and body elements
    document.documentElement.classList.toggle('dark-mode');
    document.body.classList.toggle('dark-mode');

    // Store preference
    const isDarkMode = document.documentElement.classList.contains('dark-mode');
    localStorage.setItem('darkMode', isDarkMode.toString());

    // Update button icon
    darkModeToggle.innerHTML = isDarkMode ?
      '<i class="fas fa-sun"></i>' :
      '<i class="fas fa-moon"></i>';

    // Show toast notification
    if (typeof InventoryUtils !== 'undefined' &&
        InventoryUtils.Toast &&
        typeof InventoryUtils.Toast.info === 'function') {
      InventoryUtils.Toast.info(
        `Dark mode ${isDarkMode ? 'enabled' : 'disabled'}`,
        'Appearance',
        2000
      );
    }

    // Update charts if they exist
    updateChartsForDarkMode(isDarkMode);
  });

  // Function to update charts for dark mode
  function updateChartsForDarkMode(isDark) {
    // Check if Chart.js is available
    if (typeof Chart === 'undefined') return;

    // Update chart defaults
    Chart.defaults.color = isDark ? '#e2e8f0' : '#475569';
    Chart.defaults.borderColor = isDark ? '#475569' : '#e2e8f0';

    // Update existing charts
    const charts = [
      window.categoryChart,
      window.valueChart,
      window.lowStockChart
    ];

    charts.forEach(chart => {
      if (chart && typeof chart.update === 'function') {
        chart.update();
      }
    });
  }

  // Make dark mode toggle more visible
  darkModeToggle.style.zIndex = '1001';
  darkModeToggle.style.opacity = '1';
  darkModeToggle.style.width = '50px';
  darkModeToggle.style.height = '50px';
  darkModeToggle.style.fontSize = '1.25rem';
});