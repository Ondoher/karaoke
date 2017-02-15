Package('Karaoke.Views', {
	Play : new Class({
		Extends : Sapphire.View,

		initialize : function()
		{
			this.parent();
			setInterval(this.onTick.bind(this));
			this.canvas = document.getElementById('play-canvas');
			this.container = $('#sound-here');
		},

		onTick : function()
		{
			if (!this.running) return;
			var now = this.audio.currentTime;
			now = Math.floor(now * 1000);
			this.cdgCanvas.updateSurface(now);
		},

		draw : function(song)
		{
			this.listener = KARAOKE.input.listen('inputDown', this.onInputDown.bind(this));
			this.cdg = new Cdg(song.path, song.name);
			this.cdgCanvas = new CdgCanvas(this.cdg, this.canvas);

			this.container.empty();
			this.cdgCanvas.start();

			this.audio = new Audio();
			this.audio.src = 'karaoke/services/download/music?filename=' + encodeURIComponent(song.path + '/' + song.name) + '.mp3';
			this.audio.controls = false;
			this.audio.autoplay = true;
			this.container.append(this.audio);
			this.running = true;

		},

		erase : function()
		{
			this.container.empty();
			this.running = false;
			KARAOKE.input.remove('inputDown', this.listener);
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
