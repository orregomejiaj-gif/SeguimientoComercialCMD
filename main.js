const { app, BrowserWindow, Menu, shell, ipcMain, dialog } = require('electron');
const { autoUpdater } = require('electron-updater');
const path = require('path');

let mainWindow;

// ── CONFIGURE AUTO-UPDATER FOR PRIVATE REPO ──
// GH_TOKEN is injected at build time via electron-builder
autoUpdater.autoDownload = true;
autoUpdater.autoInstallOnAppQuit = true;

// Logger para debug
autoUpdater.logger = require('electron').app
  ? null
  : console;

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
    // Check for updates 15 seconds after window loads
    setTimeout(function() {
      autoUpdater.checkForUpdates().catch(function(err) {
        console.log('Update check failed (normal if no internet):', err.message);
      });
    }, 15000);
  });

  mainWindow.webContents.setWindowOpenHandler(function(details) {
    shell.openExternal(details.url);
    return { action: 'deny' };
  });

  mainWindow.on('closed', function() { mainWindow = null; });
}

// ── AUTO UPDATER EVENTS ──
autoUpdater.on('checking-for-update', function() {
  console.log('Verificando actualizaciones...');
});

autoUpdater.on('update-available', function(info) {
  if (!mainWindow) return;
  dialog.showMessageBox(mainWindow, {
    type: 'info',
    title: 'Actualización disponible',
    message: 'Nueva versión ' + info.version + ' disponible',
    detail: 'Se descargará automáticamente en segundo plano mientras usas la app.
Se instalará la próxima vez que la cierres.',
    buttons: ['Entendido'],
    icon: path.join(__dirname, 'app', 'icon-512.png')
  });
});

autoUpdater.on('update-not-available', function() {
  console.log('La app está actualizada.');
});

autoUpdater.on('download-progress', function(progress) {
  if (mainWindow) {
    mainWindow.setProgressBar(progress.percent / 100);
    mainWindow.setTitle('Descargando actualización: ' + Math.round(progress.percent) + '%');
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
    title: 'Actualización lista para instalar',
    message: 'Versión ' + info.version + ' descargada',
    detail: '¿Deseas instalar la actualización ahora?

Si eliges "Después", se instalará automáticamente la próxima vez que cierres la app.',
    buttons: ['Instalar ahora', 'Instalar después'],
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
  console.log('Error en auto-updater:', err.message);
  // Silent fail — no mostrar error al usuario
});

// ── IPC ──
ipcMain.handle('get-app-version', function() {
  return app.getVersion();
});

ipcMain.handle('check-for-updates', function() {
  return autoUpdater.checkForUpdates();
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
