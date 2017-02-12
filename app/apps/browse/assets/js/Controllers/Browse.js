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
			callback();
		},

		onReady : function()
		{
			this.view = new Browse.Views.Browse();
			SAPPHIRE.application.showPage('catalog');
		}
	})
});


SAPPHIRE.application.registerController('browse', new Browse.Controllers.Browse());
