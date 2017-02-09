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

