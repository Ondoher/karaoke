var SYNC = 0;


Package('Karaoke.Views', {
	Play : new Class({
		Extends : Sapphire.View,

		initialize : function()
		{
			this.parent();
			this.canvas = document.getElementById('play-canvas');
			this.container = $('#sound-here');
		},

		onTick : function()
		{
			if (!this.running) return;
			var now = this.audio.currentTime;
            now = Math.floor(now * 1000 + SYNC);
			this.cdgCanvas.updateSurface(now);
		},

		draw : function(song)
		{
			this.listener = KARAOKE.input.listen('inputDown', this.onInputDown.bind(this));
			this.interval = setInterval(this.onTick.bind(this), 10);
			this.cdg = new Cdg(song.path, song.name);
			this.cdgCanvas = new CdgCanvas(this.cdg, this.canvas);

			this.container.empty();
			this.cdgCanvas.start();

			this.audio = new Audio();
			this.audio.src = 'karaoke/services/download/music?filename=' + encodeURIComponent(song.path + '/' + song.name) + '.mp3';
			this.audio.controls = false;
			this.audio.autoplay = true;
			this.audio.addEventListener('ended', this.fire.bind(this, 'song-over'));
			this.container.append(this.audio);
			this.running = true;
/**/
try {
console.log(1);
//			KARAOKE.microphone.connect(KARAOKE.analyser);
console.log(2);
///			KARAOKE.analyser.connect(KARAOKE.aCtx.destination);
console.log(3);
} catch (e) {
	console.log(e);
}
/**/
		},

		erase : function()
		{
			this.container.empty();
			this.running = false;
			KARAOKE.input.remove('inputDown', this.listener);
			clearInterval(this.interval);
		},

		onInputDown : function(input)
		{
			var action = input.action;
			var data = input.data;
			switch(action)
			{
				case 'back':
					this.fire('back');
					break;
			}
		},
	})
});
