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
		},

		onReady : function()
		{
			this.view = new Karaoke.Views.Karaoke();
			SAPPHIRE.application.showPage('catalog');
			KARAOKE.service.message('karaoke/catalog/listenUpdate', {});
		}
	})
});

SAPPHIRE.application.registerController('karaoke', new Karaoke.Controllers.Karaoke());
