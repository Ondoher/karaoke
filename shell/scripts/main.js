var electron = require('electron');
var app = electron.app
var BrowserWindow = electron.BrowserWindow;
var path = require('path');
var url = require('url');
var fs = require('fs');

require('mootools');

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
var win;

function createWindow () {
  // Create the browser window.
  var webPreferences = {
    nodeIntegration: false,
    preload: path.join(__dirname, './preload.js'),
  }
  win = new BrowserWindow({width: 800, height: 600, frame: false, fullscreen: true, webPreferences: webPreferences});
  win.setFullScreen(true);

  // and load the index.html of the app.
/*
  win.loadURL(url.format({
    pathname: path.join(__dirname, '../markup/main.html'),
    protocol: 'file:',
    slashes: true
  }))
/**/
win.loadURL('http://localhost:8080/karaoke');
//  win.loadURL('http://localhost:8080/');
//  win.loadURL('http://google.com');
  // Open the DevTools.
  win.webContents.openDevTools()

  // Emitted when the window is closed.
  win.on('closed', () => {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    win = null
  })
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (win === null) {
    createWindow()
  }
})

/*
var cdgFilename = path.join(__dirname, '../content/A Little Bit Me, A Little Bit You.cdg')
console.log('process.versions.node', process.versions.node);
var cdgData = fs.readFileSync(cdgFilename);
var cdg = new Cdg(cdgData);
console.log(cdgData.length);

function printPacket(n)
{
	var packet = cdg.getInstruction(n);

	console.log(packet);
}

var n = 0
var packet;
var len = cdg.length();
while (n < len)
{
	packet = cdg.getInstruction(n);
	if (packet.instruction !== 0) console.log(n, packet.instruction, packet.data);
	n++;
}

*/
