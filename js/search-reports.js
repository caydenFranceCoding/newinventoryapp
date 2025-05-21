/**
 * Enhanced Search & Reports Functionality
 * This script improves the search feature and reports page rendering
 */

document.addEventListener('DOMContentLoaded', () => {
  // Fix the search functionality
  enhanceSearchFeature();

  // Enhance reports page rendering
  enhanceReportsPage();

  // Add event listeners for tab navigation to ensure reports are rendered correctly
  setupTabNavigation();
});

/**
 * Enhance the search feature with a button and better UX
 */
function enhanceSearchFeature() {
  const searchContainer = document.querySelector('.search-container');
  const searchInput = document.getElementById('search-input');

  if (!searchContainer || !searchInput) return;

  // Add a search button
  const searchButton = document.createElement('button');
  searchButton.className = 'search-button';
  searchButton.setAttribute('title', 'Search Inventory');
  searchButton.innerHTML = '<i class="fas fa-search"></i>';
  searchContainer.appendChild(searchButton);

  // Add functionality to search button
  searchButton.addEventListener('click', performSearch);

  // Also trigger search on Enter key
  searchInput.addEventListener('keydown', function(e) {
    if (e.key === 'Enter') {
      e.preventDefault();
      performSearch();
    }
  });

  // Clear button functionality
  const clearButton = document.createElement('button');
  clearButton.className = 'search-clear';
  clearButton.setAttribute('title', 'Clear Search');
  clearButton.innerHTML = '<i class="fas fa-times"></i>';
  clearButton.style.display = 'none'; // Initially hidden
  clearButton.style.position = 'absolute';
  clearButton.style.right = '3.25rem';
  clearButton.style.top = '50%';
  clearButton.style.transform = 'translateY(-50%)';
  clearButton.style.background = 'none';
  clearButton.style.border = 'none';
  clearButton.style.color = 'var(--neutral-400)';
  clearButton.style.cursor = 'pointer';
  searchContainer.appendChild(clearButton);

  // Show/hide clear button based on input value
  searchInput.addEventListener('input', function() {
    clearButton.style.display = this.value ? 'block' : 'none';
  });

  // Clear search functionality
  clearButton.addEventListener('click', function() {
    searchInput.value = '';
    this.style.display = 'none';
    performSearch();
    searchInput.focus();
  });

  function performSearch() {
    // Use existing inventory refresh function if available
    if (typeof InventoryUI !== 'undefined' && typeof InventoryUI.refreshInventory === 'function') {
      InventoryUI.refreshInventory();

      // Show toast notification
      if (typeof InventoryUtils !== 'undefined' && InventoryUtils.Toast) {
        const term = searchInput.value.trim();
        if (term) {
          InventoryUtils.Toast.info(`Searching for "${term}"`, 'Search', 2000);
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

  // Ensure reports are rendered when tab is clicked
  const reportsTab = document.getElementById('reports-tab');
  if (reportsTab) {
    reportsTab.addEventListener('click', renderEnhancedReports);
  }

  // Add animation classes to report cards
  const reportCards = reportsView.querySelectorAll('.report-card');
  reportCards.forEach((card, index) => {
    card.style.animationDelay = `${index * 0.1}s`;
    card.classList.add('animate-in');
  });

  // Enable responsive behavior for the low stock table
  makeTableResponsive();
}

/**
 * Make tables in reports view responsive
 */
function makeTableResponsive() {
  const lowStockContainer = document.getElementById('low-stock-container');
  if (!lowStockContainer) return;

  // Add a wrapper for horizontal scrolling on mobile
  const tables = lowStockContainer.querySelectorAll('table');
  tables.forEach(table => {
    // Only add wrapper if not already wrapped
    if (table.parentElement.classList.contains('table-responsive')) return;

    const wrapper = document.createElement('div');
    wrapper.className = 'table-responsive';
    wrapper.style.overflowX = 'auto';
    wrapper.style.width = '100%';
    wrapper.style.maxWidth = '100%';

    // Extract the table and wrap it
    table.parentNode.insertBefore(wrapper, table);
    wrapper.appendChild(table);
  });
}

/**
 * Render enhanced reports with better visualizations
 */
function renderEnhancedReports() {
  // First check if we should reload the reports
  const reportsView = document.getElementById('reports-view');
  if (!reportsView || reportsView.classList.contains('hidden')) return;

  // Use existing report rendering if available
  if (typeof InventoryUI !== 'undefined' && typeof InventoryUI.renderReports === 'function') {
    // Show loading state
    showReportsLoading();

    // Render reports after a small delay to show loading animation
    setTimeout(() => {
      InventoryUI.renderReports();

      // Apply enhancements after rendering
      enhanceReportCharts();
      enhanceBreakdownList();
      makeTableResponsive();

      // Remove loading state
      hideReportsLoading();
    }, 300);
  }
}

/**
 * Show loading state for reports
 */
function showReportsLoading() {
  const reportsView = document.getElementById('reports-view');
  if (!reportsView) return;

  // Create loading overlay if it doesn't exist
  let loadingOverlay = document.getElementById('reports-loading');
  if (!loadingOverlay) {
    loadingOverlay = document.createElement('div');
    loadingOverlay.id = 'reports-loading';
    loadingOverlay.className = 'loading-reports';
    loadingOverlay.innerHTML = `
      <div class="loading-spinner"></div>
      <div>Loading reports...</div>
    `;
    reportsView.appendChild(loadingOverlay);
  }

  // Show the loading overlay
  loadingOverlay.style.display = 'flex';

  // Add a faded class to existing content
  const reportCards = reportsView.querySelectorAll('.report-card');
  reportCards.forEach(card => {
    card.style.opacity = '0.5';
    card.style.pointerEvents = 'none';
  });
}

/**
 * Hide loading state for reports
 */
function hideReportsLoading() {
  const loadingOverlay = document.getElementById('reports-loading');
  if (loadingOverlay) {
    loadingOverlay.style.display = 'none';
  }

  // Restore opacity of report cards
  const reportsView = document.getElementById('reports-view');
  if (!reportsView) return;

  const reportCards = reportsView.querySelectorAll('.report-card');
  reportCards.forEach(card => {
    card.style.opacity = '1';
    card.style.pointerEvents = 'auto';
  });
}

/**
 * Enhance breakdown list with visual improvements
 */
function enhanceBreakdownList() {
  const breakdownList = document.getElementById('category-breakdown');
  if (!breakdownList) return;

  const items = breakdownList.querySelectorAll('.breakdown-item');

  items.forEach((item, index) => {
    // Skip if already enhanced
    if (item.classList.contains('enhanced')) return;

    // Get values
    const label = item.childNodes[0].textContent.trim();
    const value = item.childNodes[1].textContent.trim();

    // Calculate percentage if we can get total
    let percentage = '';
    try {
      if (typeof InventoryData !== 'undefined') {
        const totalItems = InventoryData.getTotalItemCount();
        if (totalItems > 0) {
          const valueNum = parseInt(value.replace(/,/g, ''), 10);
          const percent = Math.round((valueNum / totalItems) * 100);
          percentage = `${percent}%`;
        }
      }
    } catch (e) {
      console.error('Error calculating percentage:', e);
    }

    // Generate color based on index (for visual variety)
    const colors = [
      'var(--primary-500)',
      'var(--success-500)',
      'var(--info-500)',
      'var(--warning-500)',
      'var(--danger-500)'
    ];
    const color = colors[index % colors.length];

    // Clear and rebuild the item
    item.innerHTML = '';
    item.classList.add('enhanced');

    // Category name
    const nameSpan = document.createElement('div');
    nameSpan.className = 'breakdown-name';
    nameSpan.textContent = label;
    nameSpan.style.fontWeight = '500';
    nameSpan.style.display = 'flex';
    nameSpan.style.alignItems = 'center';
    nameSpan.style.gap = '0.5rem';

    // Add colored dot
    const dot = document.createElement('span');
    dot.style.display = 'inline-block';
    dot.style.width = '0.75rem';
    dot.style.height = '0.75rem';
    dot.style.borderRadius = '50%';
    dot.style.backgroundColor = color;
    nameSpan.prepend(dot);

    // Values
    const valueSpan = document.createElement('div');
    valueSpan.className = 'breakdown-value';
    valueSpan.style.display = 'flex';
    valueSpan.style.alignItems = 'center';
    valueSpan.style.gap = '0.5rem';

    // Count
    const countSpan = document.createElement('span');
    countSpan.className = 'count';
    countSpan.textContent = value;
    countSpan.style.fontWeight = '600';
    valueSpan.appendChild(countSpan);

    // Percentage if available
    if (percentage) {
      const percentSpan = document.createElement('span');
      percentSpan.className = 'percent';
      percentSpan.textContent = percentage;
      percentSpan.style.fontSize = '0.875rem';
      percentSpan.style.color = 'var(--neutral-500)';
      percentSpan.style.backgroundColor = 'var(--neutral-100)';
      percentSpan.style.padding = '0.125rem 0.375rem';
      percentSpan.style.borderRadius = '0.25rem';
      valueSpan.appendChild(percentSpan);
    }

    // Add elements to item
    item.appendChild(nameSpan);
    item.appendChild(valueSpan);
  });
}

/**
 * Enhance Charts with better styling
 */
function enhanceReportCharts() {
  // Check if Chart.js is available
  if (typeof Chart === 'undefined') return;

  // Define better colors
  const chartColors = [
    'rgba(59, 130, 246, 0.7)',  // Blue
    'rgba(16, 185, 129, 0.7)',  // Green
    'rgba(245, 158, 11, 0.7)',  // Yellow
    'rgba(239, 68, 68, 0.7)',   // Red
    'rgba(124, 58, 237, 0.7)',  // Purple
    'rgba(14, 165, 233, 0.7)',  // Light Blue
    'rgba(236, 72, 153, 0.7)'   // Pink
  ];

  // Apply to category chart
  if (window.categoryChart) {
    window.categoryChart.data.datasets[0].backgroundColor = chartColors;
    window.categoryChart.options.plugins.legend.position = 'right';
    window.categoryChart.options.plugins.legend.labels.usePointStyle = true;
    window.categoryChart.options.plugins.legend.labels.padding = 15;
    window.categoryChart.options.cutout = '60%';
    window.categoryChart.update();
  }

  // Apply to value chart
  if (window.valueChart) {
    window.valueChart.data.datasets[0].borderColor = chartColors[0];
    window.valueChart.data.datasets[0].backgroundColor = chartColors[0].replace('0.7', '0.1');
    window.valueChart.data.datasets[0].tension = 0.4;
    window.valueChart.data.datasets[0].fill = true;
    window.valueChart.options.plugins.tooltip.enabled = true;
    window.valueChart.options.plugins.tooltip.backgroundColor = 'rgba(0, 0, 0, 0.7)';
    window.valueChart.options.scales.y.grid.display = false;
    window.valueChart.update();
  }

  // Apply to low stock chart
  if (window.lowStockChart) {
    // Set gradient colors based on values
    const ctx = window.lowStockChart.ctx;
    const gradient = ctx.createLinearGradient(0, 0, 0, 400);
    gradient.addColorStop(0, chartColors[3]);   // Red for low values
    gradient.addColorStop(1, chartColors[2]);   // Yellow for higher values

    window.lowStockChart.data.datasets[0].backgroundColor = gradient;
    window.lowStockChart.data.datasets[0].borderColor = 'transparent';
    window.lowStockChart.data.datasets[0].borderRadius = 6;
    window.lowStockChart.options.plugins.tooltip.enabled = true;
    window.lowStockChart.options.scales.y.grid.display = false;
    window.lowStockChart.update();
  }
}

/**
 * Set up proper tab navigation
 */
function setupTabNavigation() {
  const inventoryTab = document.getElementById('inventory-tab');
  const reportsTab = document.getElementById('reports-tab');
  const inventoryView = document.getElementById('inventory-view');
  const reportsView = document.getElementById('reports-view');

  if (!inventoryTab || !reportsTab || !inventoryView || !reportsView) return;

  // Clear existing event listeners
  const newInventoryTab = inventoryTab.cloneNode(true);
  const newReportsTab = reportsTab.cloneNode(true);

  inventoryTab.parentNode.replaceChild(newInventoryTab, inventoryTab);
  reportsTab.parentNode.replaceChild(newReportsTab, reportsTab);

  // Add new event listeners
  newInventoryTab.addEventListener('click', function() {
    // Update tabs
    newInventoryTab.classList.add('active');
    newReportsTab.classList.remove('active');

    // Update views
    inventoryView.classList.remove('hidden');
    reportsView.classList.add('hidden');

    // Refresh inventory list if needed
    if (typeof InventoryUI !== 'undefined' && typeof InventoryUI.refreshInventory === 'function') {
      InventoryUI.refreshInventory();
    }
  });

  newReportsTab.addEventListener('click', function() {
    // Update tabs
    newReportsTab.classList.add('active');
    newInventoryTab.classList.remove('active');

    // Update views
    reportsView.classList.remove('hidden');
    inventoryView.classList.add('hidden');

    // Render reports with our enhanced function
    renderEnhancedReports();
  });
}