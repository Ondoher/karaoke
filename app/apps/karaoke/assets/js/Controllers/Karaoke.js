Package('Karaoke.Controllers', {
	Karaoke : new  Class({
		Extends: Sapphire.Controller,

		initialize : function()
		{
			this.parent();
			SAPPHIRE.application.listen('start', this.onStart.bind(this));
			SAPPHIRE.application.listen('ready', this.onReady.bind(this));
		},

		onStart : function(callback)
		{
			KARAOKE.service.start();
			callback();
			return;

			navigator.getUserMedia = ( navigator.getUserMedia	 || navigator.webkitGetUserMedia ||
								   navigator.mozGetUserMedia ||navigator.msGetUserMedia);
			if (navigator.getUserMedia) {
				navigator.getUserMedia({audio: true}, function(stream) {
					KARAOKE.aCtx = new webkitAudioContext();
					KARAOKE.analyser = KARAOKE.aCtx.createAnalyser();
					KARAOKE.microphone = KARAOKE.aCtx.createMediaStreamSource(stream);
					console.log('mickyfone!', KARAOKE.microphone);
			KARAOKE.microphone.connect(KARAOKE.analyser);
			KARAOKE.analyser.connect(KARAOKE.aCtx.destination);
					callback();
				}, function (){callback(); console.warn("Error getting audio stream from getUserMedia")});
			};

		},

		onReady : function()
		{
			this.view = new Karaoke.Views.Karaoke();
			SAPPHIRE.application.showPage('catalog');
			KARAOKE.service.message('karaoke/catalog/listenUpdate', {});
			KARAOKE.service.message('karaoke/queue/listenUpdate', {});
		}
	})
});

SAPPHIRE.application.registerController('karaoke', new Karaoke.Controllers.Karaoke());
