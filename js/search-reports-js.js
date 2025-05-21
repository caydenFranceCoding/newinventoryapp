/**
 * Fix for Search Button and Reports Page
 * This script adds functionality to the search feature and enhances the reports page
 */

// Wait for the page to load
document.addEventListener('DOMContentLoaded', function() {
  // Fix the search functionality
  enhanceSearchFeature();

  // Fix the reports page
  enhanceReportsPage();

  // Ensure tabs work correctly
  fixTabNavigation();
});

/**
 * Enhance the search feature by adding a search button
 */
function enhanceSearchFeature() {
  const searchContainer = document.querySelector('.search-container');
  const searchInput = document.getElementById('search-input');

  if (!searchContainer || !searchInput) return;

  // Create search button
  const searchButton = document.createElement('button');
  searchButton.className = 'search-button';
  searchButton.innerHTML = '<i class="fas fa-search"></i>';
  searchButton.setAttribute('title', 'Search inventory');

  // Add the button to the container
  searchContainer.appendChild(searchButton);

  // Add search functionality
  searchButton.addEventListener('click', function() {
    performSearch();
  });

  // Add search on Enter key
  searchInput.addEventListener('keydown', function(e) {
    if (e.key === 'Enter') {
      e.preventDefault();
      performSearch();
    }
  });

  // Function to trigger search
  function performSearch() {
    // Check if inventory refresh function exists
    if (typeof InventoryUI !== 'undefined' && typeof InventoryUI.refreshInventory === 'function') {
      InventoryUI.refreshInventory();

      // Show notification if available
      if (typeof InventoryUtils !== 'undefined' &&
          InventoryUtils.Toast &&
          typeof InventoryUtils.Toast.info === 'function') {

        const term = searchInput.value.trim();
        if (term) {
          InventoryUtils.Toast.info(`Searching for "${term}"`, 'Search');
        }
      }
    }
  }
}

/**
 * Enhance the reports page with better rendering and animations
 */
function enhanceReportsPage() {
  const reportsView = document.getElementById('reports-view');
  if (!reportsView) return;

  // Add animation classes to report cards
  const reportCards = reportsView.querySelectorAll('.report-card');
  reportCards.forEach((card, index) => {
    card.classList.add('animate-in');
    card.style.animationDelay = `${index * 0.1}s`;
  });

  // Enhance chart rendering
  if (typeof Chart !== 'undefined') {
    enhanceCharts();
  }

  // Make low stock table responsive
  const lowStockContainer = document.getElementById('low-stock-container');
  if (lowStockContainer) {
    const tables = lowStockContainer.querySelectorAll('table');
    tables.forEach(table => {
      const wrapper = document.createElement('div');
      wrapper.className = 'table-responsive';
      table.parentNode.insertBefore(wrapper, table);
      wrapper.appendChild(table);
    });
  }
}

/**
 * Fix tab navigation issues
 */
function fixTabNavigation() {
  const inventoryTab = document.getElementById('inventory-tab');
  const reportsTab = document.getElementById('reports-tab');
  const inventoryView = document.getElementById('inventory-view');
  const reportsView = document.getElementById('reports-view');

  if (!inventoryTab || !reportsTab || !inventoryView || !reportsView) return;

  // Fix inventory tab click
  inventoryTab.addEventListener('click', function() {
    // Update tab styling
    inventoryTab.classList.add('active');
    reportsTab.classList.remove('active');

    // Show inventory view, hide reports
    inventoryView.classList.remove('hidden');
    reportsView.classList.add('hidden');
  });

  // Fix reports tab click
  reportsTab.addEventListener('click', function() {
    // Update tab styling
    reportsTab.classList.add('active');
    inventoryTab.classList.remove('active');

    // Show reports view, hide inventory
    reportsView.classList.remove('hidden');
    inventoryView.classList.add('hidden');

    // Render reports if we have the function
    if (typeof InventoryUI !== 'undefined' && typeof InventoryUI.renderReports === 'function') {
      setTimeout(() => {
        InventoryUI.renderReports();

        // After reports are rendered, enhance charts
        setTimeout(enhanceCharts, 100);
      }, 100);
    }
  });
}

/**
 * Enhance charts with better styling
 */
function enhanceCharts() {
  // Skip if Chart.js not available
  if (typeof Chart === 'undefined') return;

  // Define better colors
  const chartColors = [
    'rgba(59, 130, 246, 0.7)',   // Blue
    'rgba(16, 185, 129, 0.7)',   // Green
    'rgba(245, 158, 11, 0.7)',   // Orange/Yellow
    'rgba(239, 68, 68, 0.7)',    // Red
    'rgba(124, 58, 237, 0.7)',   // Purple
    'rgba(14, 165, 233, 0.7)',   // Light Blue
    'rgba(236, 72, 153, 0.7)'    // Pink
  ];

  // Apply to category chart if it exists
  if (window.categoryChart) {
    window.categoryChart.data.datasets[0].backgroundColor = chartColors;
    window.categoryChart.options.plugins.legend.position = 'right';
    window.categoryChart.options.cutout = '60%';
    window.categoryChart.update();
  }

  // Apply to value chart if it exists
  if (window.valueChart) {
    window.valueChart.data.datasets[0].borderColor = chartColors[0];
    window.valueChart.data.datasets[0].backgroundColor = chartColors[0].replace('0.7', '0.1');
    window.valueChart.update();
  }

  // Apply to low stock chart if it exists
  if (window.lowStockChart) {
    window.lowStockChart.data.datasets[0].borderRadius = 6;
    window.lowStockChart.update();
  }
}