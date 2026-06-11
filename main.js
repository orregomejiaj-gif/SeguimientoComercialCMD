const { app, BrowserWindow, Menu, shell, ipcMain, dialog } = require('electron');
const { autoUpdater } = require('electron-updater');
const path = require('path');

let mainWindow;

autoUpdater.autoDownload = true;
autoUpdater.autoInstallOnAppQuit = true;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    title: 'Seguimiento Comercial CMD',
    icon: path.join(__dirname, 'app', 'icon-512.png'),
    backgroundColor: '#003D45',
    show: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  mainWindow.loadFile(path.join(__dirname, 'app', 'index.html'));

  mainWindow.once('ready-to-show', function() {
    mainWindow.show();
    mainWindow.focus();
    setTimeout(function() {
      autoUpdater.checkForUpdates().catch(function(err) {
        console.log('Update check failed:', err.message);
      });
    }, 15000);
  });

  mainWindow.webContents.setWindowOpenHandler(function(details) {
    shell.openExternal(details.url);
    return { action: 'deny' };
  });

  mainWindow.on('closed', function() { mainWindow = null; });
}

autoUpdater.on('update-available', function(info) {
  if (!mainWindow) return;
  dialog.showMessageBox(mainWindow, {
    type: 'info',
    title: 'Actualizacion disponible',
    message: 'Nueva version ' + info.version + ' disponible',
    detail: 'Se descargara en segundo plano. Se instalara al cerrar la app.',
    buttons: ['Entendido'],
    icon: path.join(__dirname, 'app', 'icon-512.png')
  });
});

autoUpdater.on('download-progress', function(progress) {
  if (mainWindow) {
    mainWindow.setProgressBar(progress.percent / 100);
    mainWindow.setTitle('Descargando: ' + Math.round(progress.percent) + '%');
  }
});

autoUpdater.on('update-downloaded', function(info) {
  if (mainWindow) {
    mainWindow.setProgressBar(-1);
    mainWindow.setTitle('Seguimiento Comercial CMD');
  }
  if (!mainWindow) return;
  dialog.showMessageBox(mainWindow, {
    type: 'info',
    title: 'Actualizacion lista',
    message: 'Version ' + info.version + ' lista para instalar',
    detail: 'Instalar ahora o al cerrar la app?',
    buttons: ['Instalar ahora', 'Instalar despues'],
    defaultId: 0,
    cancelId: 1,
    icon: path.join(__dirname, 'app', 'icon-512.png')
  }).then(function(result) {
    if (result.response === 0) {
      autoUpdater.quitAndInstall(false, true);
    }
  });
});

autoUpdater.on('error', function(err) {
  console.log('Auto-updater error:', err.message);
});

ipcMain.handle('get-app-version', function() {
  return app.getVersion();
});

Menu.setApplicationMenu(null);

app.whenReady().then(function() {
  createWindow();
  app.on('activate', function() {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', function() { app.quit(); });

app.on('web-contents-created', function(event, contents) {
  contents.on('will-navigate', function(event, navigationUrl) {
    const parsedUrl = new URL(navigationUrl);
    if (parsedUrl.protocol !== 'file:') event.preventDefault();
  });
});