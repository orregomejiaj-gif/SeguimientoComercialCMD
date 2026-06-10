const { app, BrowserWindow, Menu, shell } = require('electron');
const path = require('path');

// Keep reference to avoid garbage collection
let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    title: 'Seguimiento Comercial CMD',
    icon: path.join(__dirname, 'app', 'icon-512.png'),
    backgroundColor: '#003D45',
    show: false,  // Don't show until ready
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true
    }
  });

  // Load the app
  mainWindow.loadFile(path.join(__dirname, 'app', 'index.html'));

  // Show when ready (avoids white flash)
  mainWindow.once('ready-to-show', function() {
    mainWindow.show();
    mainWindow.focus();
  });

  // Open external links in browser, not in app
  mainWindow.webContents.setWindowOpenHandler(function(details) {
    shell.openExternal(details.url);
    return { action: 'deny' };
  });

  mainWindow.on('closed', function() {
    mainWindow = null;
  });
}

// Remove default menu bar (keep clean app feel)
Menu.setApplicationMenu(null);

app.whenReady().then(function() {
  createWindow();

  app.on('activate', function() {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', function() {
  app.quit();
});

// Security: prevent navigation to external URLs
app.on('web-contents-created', function(event, contents) {
  contents.on('will-navigate', function(event, navigationUrl) {
    const parsedUrl = new URL(navigationUrl);
    if (parsedUrl.protocol !== 'file:') {
      event.preventDefault();
    }
  });
});
