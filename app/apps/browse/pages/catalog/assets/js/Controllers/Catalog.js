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
			this.view.listen('add', this.onAddToQueue.bind(this));
			this.catalog = SAPPHIRE.application.getModel('catalog');
			this.queue = SAPPHIRE.application.getModel('queue');
		},

		updateCatalog()
		{
			this.catalog.get()
				.then(function(songs)
				{
					this.songs = songs;
					this.view.draw(songs);
				}.bind(this))
		},

		onFirstShow : function()
		{
			this.catalog.listenCatalogUpdate();
			this.queue.listenQueueUpdate();
			this.catalog.listen('catalog-update', this.onCatalogUpdate.bind(this));
			this.queue.listen('queue-update', this.onQueueUpdate.bind(this));
			this.updateCatalog();
		},

		onShow : function(panel, query)
		{
		},

		onAddToQueue : function(song)
		{
			this.queue.add(song);
		},

		onCatalogUpdate : function()
		{
			this.updateCatalog();
		},

		onQueueUpdate : function()
		{
		}

	})
});

SAPPHIRE.application.registerController('catalog', new Browse.Controllers.Catalog());
