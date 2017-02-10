var canvas = document.getElementById('canvas');
//var cdg = new Cdg('A Little Bit Me, A Little Bit You');
//var name = 'A Little Bit Me, A Little Bit You';
//var name = 'Warwick, Dionne & Friends - That\'s What Friends Are For';
//var name = 'Against The Wind';
//var name = 'Black Sabbath - War Pigs';
//var name = 'Black Eyed Peas - I Gotta Feeling';
//var name = 'Under Pressure';
//var name = 'Big Yellow Taxi';
//var name = 'Bring Me To Life';
//var name = 'Buffett, Jimmy - Margaritaville';
//var name = 'Burnin\' For You';
//var name = 'Monkees, The - Randy Scouse Git';
//var name = 'Collins, Phil - In The Air Tonight';
//var name = 'Doctor My Eyes';
//var name = '867-5309 Jenny';
//var name = 'Bon Jovi - Runaway';
//var name = 'Come To My Window';
var name = 'Croce, Jim - Bad Bad Leroy Brown';
var cdg = new Cdg(name);

var cdgCanvas = new CdgCanvas(cdg,canvas);
cdgCanvas.start();
var start = Date.now();
//var start = Date.now() - 200000;
//cdgCanvas.updateSurface(160000);
//cdgCanvas.updateSurface(31000);
//cdgCanvas.updateSurface(32000);

var audio = new Audio();
audio.src = 'file:/dev/karaoke/shell/content/' + name + '.mp3';
audio.controls = true;
audio.autoplay = true;
document.body.appendChild(audio);


//var audioCtx = new (window.AudioContext || window.webkitAudioContext)()
//var source = audioCtx.createMediaElementSource(audio)
//source.connect(audioCtx.destination);


setInterval(function()
{
	var now = audio.currentTime;
	now = Math.floor(now * 1000);
	cdgCanvas.updateSurface(now);
//	cdgCanvas.updateSurface(now - start);
}, 50);
