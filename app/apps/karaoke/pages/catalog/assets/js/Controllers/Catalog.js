Package('Karaoke.Controllers', {
	Catalog : new Class({
		Extends : Sapphire.Controller,

		initialize : function()
		{
			SAPPHIRE.application.listenPageEvent('load', 'catalog', this.onLoad.bind(this));
			SAPPHIRE.application.listenPageEvent('show', 'catalog', this.onShow.bind(this));
			SAPPHIRE.application.listenPageEvent('firstShow', 'catalog', this.onFirstShow.bind(this));
		},

		onLoad : function()
		{
			this.catalogModel = SAPPHIRE.application.getModel('catalog');

			this.view = new Karaoke.Views.Catalog();
			this.view.listen('songSelect', this.onSongSelect.bind(this));

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

		onShow : function()
		{
			this.view.drawSelected();
			this.view.doScroll();
		},

		onSongSelect : function(song)
		{
			console.log('songSelect', song);
			SAPPHIRE.application.showPage('play', song);
		},
	})
});

SAPPHIRE.application.registerController('catalog', new Karaoke.Controllers.Catalog());
