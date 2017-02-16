Package('Browse.Controllers', {
	Browse : new  Class({
		Extends: Sapphire.Controller,

		initialize : function()
		{
			this.parent();
			SAPPHIRE.application.listen('start', this.onStart.bind(this));
			SAPPHIRE.application.listen('ready', this.onReady.bind(this));
		},

		onStart : function(callback)
		{
			BROWSE.service.start();
			callback();
		},

		onReady : function()
		{
			this.view = new Browse.Views.Browse();
			SAPPHIRE.application.showPage('catalog');
			BROWSE.service.message('karaoke/catalog/listenUpdate', {});
		}
	})
});


SAPPHIRE.application.registerController('browse', new Browse.Controllers.Browse());
