const electron = require('electron');
const path = require('path');
const url = require('url');

const { app, BrowserWindow } = electron;

let mainWindow;
function createWindow () {
  mainWindow = new BrowserWindow({
    width: 1800,
    height: 1000,
    x: 1500,
    y: 200
  });
  mainWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'index.html'),
    protocol: 'file:',
    slashes: true
  }));

  mainWindow.webContents.openDevTools();

  mainWindow.on('closed', function () {
    mainWindow = null
  });
}

app.on('ready', createWindow);

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', function () {
  if (mainWindow === null) {
    createWindow();
  }
});
