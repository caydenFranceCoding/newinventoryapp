const { app, BrowserWindow, Menu, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');

// Keep a global reference to prevent garbage collection
let mainWindow;

// Create the main application window
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true
    }
  });

  // Fix the HTML path
  const htmlPath = path.join(__dirname, 'index.html');
  mainWindow.loadFile(htmlPath);

  // Uncomment to open DevTools on startup
  // mainWindow.webContents.openDevTools();

  // Handle window closed event
  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Create application menu
  createMenu();
}

// Create application menu
function createMenu() {
  const template = [
    {
      label: 'File',
      submenu: [
        {
          label: 'Export Inventory',
          click: () => {
            mainWindow.webContents.send('menu-export');
          }
        },
        {
          label: 'Import Inventory',
          click: () => {
            mainWindow.webContents.send('menu-import');
          }
        },
        { type: 'separator' },
        {
          label: 'Exit',
          role: 'quit'
        }
      ]
    },
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' }
      ]
    },
    {
      label: 'View',
      submenu: [
        { role: 'reload' },
        { role: 'toggledevtools' },
        { type: 'separator' },
        { role: 'resetzoom' },
        { role: 'zoomin' },
        { role: 'zoomout' },
        { type: 'separator' },
        { role: 'togglefullscreen' }
      ]
    },
    {
      label: 'Help',
      submenu: [
        {
          label: 'About',
          click: () => {
            dialog.showMessageBox(mainWindow, {
              title: 'About Inventory Manager',
              message: 'Inventory Management Application v1.0.0',
              detail: 'A simple desktop inventory management system.'
            });
          }
        }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

// File operations
ipcMain.handle('save-file', async (event, data, defaultPath) => {
  const { filePath } = await dialog.showSaveDialog(mainWindow, {
    defaultPath: defaultPath,
    filters: [
      { name: 'CSV Files', extensions: ['csv'] },
      { name: 'All Files', extensions: ['*'] }
    ]
  });

  if (filePath) {
    fs.writeFileSync(filePath, data);
    return filePath;
  }

  return null;
});

ipcMain.handle('open-file', async () => {
  const { filePaths } = await dialog.showOpenDialog(mainWindow, {
    properties: ['openFile'],
    filters: [
      { name: 'CSV Files', extensions: ['csv'] },
      { name: 'All Files', extensions: ['*'] }
    ]
  });

  if (filePaths && filePaths.length > 0) {
    const data = fs.readFileSync(filePaths[0], 'utf8');
    return { filePath: filePaths[0], data };
  }

  return null;
});

// Handle saving and loading app data
ipcMain.handle('save-app-data', async (event, data) => {
  try {
    const appDataPath = path.join(app.getPath('userData'), 'inventory-data.json');
    fs.writeFileSync(appDataPath, JSON.stringify(data), 'utf8');
    return true;
  } catch (error) {
    console.error('Error saving app data:', error);
    return false;
  }
});

ipcMain.handle('load-app-data', async () => {
  try {
    const appDataPath = path.join(app.getPath('userData'), 'inventory-data.json');
    if (fs.existsSync(appDataPath)) {
      const data = fs.readFileSync(appDataPath, 'utf8');
      return JSON.parse(data);
    }
    return null;
  } catch (error) {
    console.error('Error loading app data:', error);
    return null;
  }
});

// Initialize app when ready
app.whenReady().then(() => {
  createWindow();

  // On macOS, recreate window when dock icon is clicked
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// Quit when all windows are closed (except on macOS)
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});