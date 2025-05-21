document.addEventListener('DOMContentLoaded', () => {
  // Get DOM elements for navigation
  const inventoryTab = document.getElementById('inventory-tab');
  const reportsTab = document.getElementById('reports-tab');
  const inventoryView = document.getElementById('inventory-view');
  const reportsView = document.getElementById('reports-view');
  const exportBtn = document.getElementById('export-btn');

  // Function to switch views
  function showView(viewName) {
    // Hide all views first
    inventoryView.classList.add('hidden');
    reportsView.classList.add('hidden');

    // Remove active class from all tabs
    inventoryTab.classList.remove('active');
    reportsTab.classList.remove('active');

    // Show selected view and activate tab
    if (viewName === 'inventory') {
      inventoryView.classList.remove('hidden');
      inventoryTab.classList.add('active');
    } else if (viewName === 'reports') {
      reportsView.classList.remove('hidden');
      reportsTab.classList.add('active');
      // Make sure reports are updated when switching to this view
      renderReports();
    }
  }

  // Add click event listeners to tabs
  inventoryTab.addEventListener('click', () => showView('inventory'));
  reportsTab.addEventListener('click', () => showView('reports'));

  // Export button functionality
  if (exportBtn) {
    exportBtn.addEventListener('click', () => {
      const csvContent = InventoryData.exportToCSV();
      const fileName = `inventory_export_${new Date().toISOString().slice(0, 10)}.csv`;

      // Use utility function to download
      if (typeof InventoryUtils !== 'undefined' && InventoryUtils.downloadFile) {
        InventoryUtils.downloadFile(csvContent, fileName, 'text/csv');
        // Show success message
        if (InventoryUtils.Toast) {
          InventoryUtils.Toast.success('Inventory exported successfully');
        }
      } else {
        console.error('InventoryUtils is not defined or missing downloadFile method');
        alert('Export functionality is not available');
      }
    });
  }

  // Initialize form toggle functionality
  const addItemBtn = document.getElementById('add-item-btn');
  const addItemForm = document.getElementById('add-item-form');
  const closeFormBtn = document.getElementById('close-form-btn');

  if (addItemBtn && addItemForm && closeFormBtn) {
    addItemBtn.addEventListener('click', () => {
      addItemForm.classList.remove('hidden');
    });

    closeFormBtn.addEventListener('click', () => {
      addItemForm.classList.add('hidden');
    });
  }

  // Make sure starts with the inventory view active
  showView('inventory');
});

// Helper function to render reports (called when switching to reports tab)
function renderReports() {
  if (typeof InventoryUI !== 'undefined' && typeof InventoryUI.renderReports === 'function') {
    InventoryUI.renderReports();
  } else {
    console.log('Updating reports view with available data');

    // Basic report rendering if InventoryUI is not available
    const totalItems = document.getElementById('total-items');
    const totalValue = document.getElementById('total-value');
    const categoryBreakdown = document.getElementById('category-breakdown');

    if (typeof InventoryData !== 'undefined') {
      if (totalItems) totalItems.textContent = InventoryData.getTotalItemCount() || '0';

      if (totalValue) {
        const value = InventoryData.getTotalValue() || 0;
        totalValue.textContent = `$${value.toFixed(2)}`;
      }

      if (categoryBreakdown && typeof InventoryData.getItemsByCategory === 'function') {
        const categoryData = InventoryData.getItemsByCategory();
        let html = '';

        for (const [category, count] of Object.entries(categoryData)) {
          html += `
            <div class="breakdown-item">
              <span>${category}</span>
              <span class="font-semibold">${count}</span>
            </div>
          `;
        }

        categoryBreakdown.innerHTML = html || '<div class="no-data-message">No categories defined</div>';
      }
    }
  }
}