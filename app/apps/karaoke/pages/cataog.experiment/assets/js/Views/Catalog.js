Package('Karaoke.Views', {
	Catalog : new Class({
		Extends : Sapphire.View,
		Implements : [Karaoke.Views.Mixins.CatalogGrid],

		initialize : function()
		{
			this.parent();

			$('.catalog-container').nanoScroller({ alwaysVisible: true });
			this.setupGrid($('#catalog-list'), $('.catalog-container'));
		},

		setupControls : function(config)
		{
		},

		draw : function(songs, filter, header)
		{
			this.updateSongs(songs, filter, header);
		},

	})
});
