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
			callback();
		},

		onReady : function()
		{
			this.view = new Karaoke.Views.Karaoke();
			SAPPHIRE.application.showPage('catalog');
		}
	})
});

SAPPHIRE.application.registerController('karaoke', new Karaoke.Controllers.Karaoke());
