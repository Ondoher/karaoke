Package('Karaoke.Controllers', {
	Catalog : new Class({
		Extends : Sapphire.Controller,

		initialize : function()
		{
			SAPPHIRE.application.listenPageEvent('load', 'catalog', this.onLoad.bind(this));
			SAPPHIRE.application.listenPageEvent('show', 'catalog', this.onShow.bind(this));
			SAPPHIRE.application.listenPageEvent('hide', 'catalog', this.onHide.bind(this));
			SAPPHIRE.application.listenPageEvent('firstShow', 'catalog', this.onFirstShow.bind(this));
		},

		onLoad : function()
		{
			this.view = new Karaoke.Views.Catalog();
			this.view.listen('songSelect', this.onSongSelect.bind(this));

			this.model = SAPPHIRE.application.getModel('catalog');
		},

		updateCatalog()
		{
			this.view.busy(true);
			return this.model.get()
				.then(function(songs)
				{
					this.view.busy(false);
					this.songs = songs;
					this.view.draw(songs);
				}.bind(this))
		},

		onFirstShow : function()
		{
			this.model.listenCatalogUpdate();
			this.model.listen('catalog-update', this.onCatalogUpdate.bind(this));
			this.updateCatalog();
		},

		onShow : function()
		{
			if (this.view.paused)
			{
				this.view.drawSelected();
				this.view.doScroll();
				this.view.resume();
			}
		},

		onHide : function()
		{
			this.view.pause();
		},

		onSongSelect : function(song)
		{
			SAPPHIRE.application.showPage('play', song);
		},

		onCatalogUpdate : function()
		{
			console.log('onCatalogUpdate...');
			this.view.pause();
			this.updateCatalog()
				.then(function()
				{
					this.view.resume();
				}.bind(this));
		},
	})
});

SAPPHIRE.application.registerController('catalog', new Karaoke.Controllers.Catalog());
