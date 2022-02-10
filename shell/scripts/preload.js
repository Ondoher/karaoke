window.ipc = require('electron').ipcRenderer;
//require('mootools');
var fs = require('fs');
var path = require('path');
var Cdg = require('./cdg');
var CdgCanvas = require('./cdgCanvas');


function newCdg(dir, name) {
	return new Cdg(dir, name);
}

function newCdgCanvas(cdg, canvas) {
	return new CdgCanvas(cdg, canvas);
}

//const { contextBridge } = require('electron')

console.log('preload', window.Cdg);
var loadAudio = function(addTo, name)
{
	var audio = new Audio();
	audio.src = 'file:/dev/karaoke/shell/content/' + name + '.mp3';
	audio.controls = false;
	audio.autoplay = true;

	addTo.appendChild(audio);
}

/*
var cdgFilename = path.join(__dirname, '../content/A Little Bit Me, A Little Bit You.cdg')
console.log('process.versions.node', process.versions.node);
var cdgData = fs.readFileSync(cdgFilename);
window.cdg = new window.Cdg(cdgData);
console.log(cdgData.length);
console.log(window.cdg.length());

function printPacket(n)
{
	var packet = cdg.getInstruction(n);

//	console.log(packet);
}
*/

var os = require('os');
var getLocalUrl = function()
{
	var ifaces = os.networkInterfaces();
	var result = 'not found'

	Object.keys(ifaces).forEach(function (ifname)
	{
		var alias = 0;

		ifaces[ifname].forEach(function (iface)
		{
			if ('IPv4' !== iface.family || iface.internal !== false)
			{
			// skip over internal (i.e. 127.0.0.1) and non-ipv4 addresses
				return result;
			}

			result = 'http://' + iface.address + '/';
		});
	});

	return result;
}

window.Cdg = Cdg;
window.CdgCanvas = CdgCanvas;
window.newCdg = newCdg;
window.newCdgCanvas = newCdgCanvas;
window.loadAudio = loadAudio;
window.getLocalUrl = getLocalUrl;

/*
contextBridge.exposeInMainWorld('Cdg', Cdg);
contextBridge.exposeInMainWorld('CdgCanvas', CdgCanvas);
contextBridge.exposeInMainWorld('newCdg', newCdg);
contextBridge.exposeInMainWorld('newCdgCanvas', newCdgCanvas);
contextBridge.exposeInMainWorld('loadAudio', loadAudio);
contextBridge.exposeInMainWorld('getLocalUrl', getLocalUrl);
*/



