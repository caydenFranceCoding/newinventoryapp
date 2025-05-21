/**
 * UI Debugger Utility
 * This script helps identify and fix UI issues in the Inventory Management app
 */

const UIDebugger = (() => {
  // Store original console.log for reference
  const originalConsoleLog = console.log;

  // Enhanced console log with timestamps
  function enhancedLog(...args) {
    const timestamp = new Date().toISOString().slice(11, 23); // HH:MM:SS.sss
    originalConsoleLog(`[${timestamp}]`, ...args);
  }

  // Check for common issues with the UI
  function checkForCommonIssues() {
    enhancedLog('🔍 Checking for common UI issues...');

    // Check for navigation issues
    const navTabs = document.querySelector('.nav-tabs');
    if (!navTabs) {
      enhancedLog('❌ Navigation tabs container is missing!');
    } else {
      const tabs = navTabs.querySelectorAll('.nav-tab');
      enhancedLog(`✓ Found ${tabs.length} navigation tabs`);

      // Check that at least one tab is active
      const activeTabs = navTabs.querySelectorAll('.nav-tab.active');
      if (activeTabs.length === 0) {
        enhancedLog('❌ No active tab found!');
      } else if (activeTabs.length > 1) {
        enhancedLog(`❌ Multiple active tabs found (${activeTabs.length}). Should be only one.`);
      } else {
        enhancedLog('✓ Active tab check passed');
      }
    }

    // Check views
    const views = document.querySelectorAll('.view');
    if (views.length === 0) {
      enhancedLog('❌ No view containers found!');
    } else {
      enhancedLog(`✓ Found ${views.length} view containers`);

      // Check visible views
      const visibleViews = Array.from(views).filter(view => !view.classList.contains('hidden'));
      if (visibleViews.length === 0) {
        enhancedLog('❌ No visible views found! All views are hidden.');
      } else if (visibleViews.length > 1) {
        enhancedLog(`❌ Multiple visible views found (${visibleViews.length}). Should be only one.`);
      } else {
        enhancedLog('✓ Visible view check passed');
      }
    }

    // Check CSS conflicts
    const styles = document.styleSheets;
    enhancedLog(`Found ${styles.length} stylesheets`);

    // Look for CSS issues with hidden class
    try {
      let hiddenClassRules = 0;
      for (let i = 0; i < styles.length; i++) {
        try {
          const rules = styles[i].cssRules || styles[i].rules;
          for (let j = 0; j < rules.length; j++) {
            if (rules[j].selectorText && rules[j].selectorText.includes('.hidden')) {
              hiddenClassRules++;
            }
          }
        } catch (e) {
          enhancedLog(`⚠️ Cannot read rules from stylesheet ${i} - likely CORS restriction`);
        }
      }

      if (hiddenClassRules > 1) {
        enhancedLog(`⚠️ Found ${hiddenClassRules} CSS rules targeting .hidden class. Potential conflicts.`);
      }
    } catch (e) {
      enhancedLog('⚠️ Error checking CSS rules:', e);
    }
  }

  // Fix navigation issues
  function fixNavigation() {
    enhancedLog('🔧 Applying navigation fixes...');

    // Check and fix inventory view
    const inventoryTab = document.getElementById('inventory-tab');
    const inventoryView = document.getElementById('inventory-view');

    if (inventoryTab && inventoryView) {
      inventoryTab.addEventListener('click', function() {
        // Fix all tabs and views
        document.querySelectorAll('.nav-tab').forEach(tab => tab.classList.remove('active'));
        document.querySelectorAll('.view').forEach(view => view.classList.add('hidden'));

        // Activate current tab and view
        this.classList.add('active');
        inventoryView.classList.remove('hidden');

        enhancedLog('Switched to Inventory view');
      });
    }

    // Check and fix reports view
    const reportsTab = document.getElementById('reports-tab');
    const reportsView = document.getElementById('reports-view');

    if (reportsTab && reportsView) {
      reportsTab.addEventListener('click', function() {
        // Fix all tabs and views
        document.querySelectorAll('.nav-tab').forEach(tab => tab.classList.remove('active'));
        document.querySelectorAll('.view').forEach(view => view.classList.add('hidden'));

        // Activate current tab and view
        this.classList.add('active');
        reportsView.classList.remove('hidden');

        enhancedLog('Switched to Reports view');

        // Try to trigger reports update if possible
        if (typeof InventoryUI !== 'undefined' && typeof InventoryUI.renderReports === 'function') {
          InventoryUI.renderReports();
        }
      });
    }

    // Make sure to start with inventory view
    if (inventoryTab && inventoryView) {
      setTimeout(() => {
        inventoryTab.click();
      }, 100);
    }
  }

  // Visual debugging tools
  function enableVisualDebugging() {
    enhancedLog('🎨 Enabling visual debugging...');

    // Create debug UI
    const debugPanel = document.createElement('div');
    debugPanel.style.position = 'fixed';
    debugPanel.style.bottom = '10px';
    debugPanel.style.right = '10px';
    debugPanel.style.padding = '10px';
    debugPanel.style.background = 'rgba(0, 0, 0, 0.7)';
    debugPanel.style.color = 'white';
    debugPanel.style.borderRadius = '5px';
    debugPanel.style.zIndex = '9999';
    debugPanel.style.fontSize = '12px';
    debugPanel.style.width = '180px';

    debugPanel.innerHTML = `
      <div style="font-weight: bold; margin-bottom: 8px">UI Debugger</div>
      <button id="debug-highlight-views" style="margin-bottom: 4px; width: 100%; padding: 4px;">Highlight Views</button>
      <button id="debug-highlight-tabs" style="margin-bottom: 4px; width: 100%; padding: 4px;">Highlight Tabs</button>
      <button id="debug-force-inventory" style="margin-bottom: 4px; width: 100%; padding: 4px;">Force Inventory View</button>
      <button id="debug-force-reports" style="margin-bottom: 4px; width: 100%; padding: 4px;">Force Reports View</button>
      <button id="debug-close" style="width: 100%; padding: 4px;">Close Debugger</button>
    `;

    document.body.appendChild(debugPanel);

    // Button event handlers
    document.getElementById('debug-highlight-views').addEventListener('click', () => {
      document.querySelectorAll('.view').forEach(view => {
        view.classList.toggle('debug-highlight');
      });
    });

    document.getElementById('debug-highlight-tabs').addEventListener('click', () => {
      document.querySelectorAll('.nav-tab').forEach(tab => {
        tab.classList.toggle('debug-highlight');
      });
    });

    document.getElementById('debug-force-inventory').addEventListener('click', () => {
      document.querySelectorAll('.nav-tab').forEach(tab => tab.classList.remove('active'));
      document.querySelectorAll('.view').forEach(view => view.classList.add('hidden'));

      const inventoryTab = document.getElementById('inventory-tab');
      const inventoryView = document.getElementById('inventory-view');

      if (inventoryTab) inventoryTab.classList.add('active');
      if (inventoryView) inventoryView.classList.remove('hidden');

      enhancedLog('Force-switched to Inventory view');
    });

    document.getElementById('debug-force-reports').addEventListener('click', () => {
      document.querySelectorAll('.nav-tab').forEach(tab => tab.classList.remove('active'));
      document.querySelectorAll('.view').forEach(view => view.classList.add('hidden'));

      const reportsTab = document.getElementById('reports-tab');
      const reportsView = document.getElementById('reports-view');

      if (reportsTab) reportsTab.classList.add('active');
      if (reportsView) reportsView.classList.remove('hidden');

      enhancedLog('Force-switched to Reports view');
    });

    document.getElementById('debug-close').addEventListener('click', () => {
      debugPanel.remove();

      // Remove any debug highlighting
      document.querySelectorAll('.debug-highlight').forEach(el => {
        el.classList.remove('debug-highlight');
      });
    });
  }

  // Public API
  return {
    init() {
      console.log = enhancedLog;
      enhancedLog('UI Debugger initialized');

      checkForCommonIssues();

      // Add keyboard shortcut for debugger
      document.addEventListener('keydown', (e) => {
        // Alt+Shift+D to show debugger
        if (e.altKey && e.shiftKey && e.key === 'D') {
          enableVisualDebugging();
        }
      });

      return this;
    },

    fix() {
      fixNavigation();
      return this;
    },

    enableDebugUI() {
      enableVisualDebugging();
      return this;
    }
  };
})();

// Auto-initialize when the page is loaded
document.addEventListener('DOMContentLoaded', function() {
  // Allow some time for the application to initialize first
  setTimeout(() => {
    UIDebugger.init().fix();
  }, 500);
});