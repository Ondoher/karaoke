Package('Browse.Controllers', {
	Catalog : new Class({
		Extends : Sapphire.Controller,

		initialize : function()
		{
			this.parent();

			SAPPHIRE.application.listenPageEvent('load', 'catalog', this.onLoad.bind(this));
			SAPPHIRE.application.listenPageEvent('show', 'catalog', this.onShow.bind(this));
			SAPPHIRE.application.listenPageEvent('firstShow', 'catalog', this.onFirstShow.bind(this));
		},

		onLoad : function()
		{
			this.view = new Browse.Views.Catalog();
			this.model = SAPPHIRE.application.getModel('catalog');
		},

		onFirstShow : function()
		{
			this.model.get()
				.then(function(songs)
				{
					this.songs = songs;
					this.view.draw(songs);
				}.bind(this))
		},

		onShow : function(panel, query)
		{
			//this.view.draw()
		},
	})
});

SAPPHIRE.application.registerController('catalog', new Browse.Controllers.Catalog());
