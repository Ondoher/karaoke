window.ipc = require('electron').ipcRenderer;
require('mootools');
var fs = require('fs');
var path = require('path');
window.Cdg = require('./cdg');
window.CdgCanvas = require('./cdgCanvas');


window.loadAudio = function(addTo, name)
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
window.getLocalUrl = function()
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

console.log(window.getLocalUrl());



