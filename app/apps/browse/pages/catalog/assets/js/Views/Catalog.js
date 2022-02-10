Package('Browse.Views', {
	Catalog : new Class({
		Extends : Sapphire.View,

		initialize : function()
		{
			this.parent();
			this.container = $('#catalog-list');
			this.searchInput = $('.search-input');
			this.searchInput.on('input', this.onSearchFilter.bind(this));
		},

		draw : function(songs)
		{
			this.container.empty();
			this.songs = songs;
			var template;

			songs.sort(function(s1, s2)
			{
				return s1.name.toLowerCase().localeCompare(s2.name.toLowerCase());
			});

			songs.each(function(song, index)
			{
				template = SAPPHIRE.templates.get('song-template');
				template.find('#song-name').text(song.name);
				template.attr('id', 'song-' + index);
				template.find('#add-queue').click(this.onAdd.bind(this, song));
				song.selector = template;
//				template.click(this.onSongSelect.bind(this, song));

				this.container.append(template);
			}, this);
				var height = this.container.height();

			setTimeout(function()
			{
				var height = this.container.height();
				this.oneHeight = template.outerHeight();
//				alert('oneHeight ' + this.oneHeight);
//				alert('height ' + height);
				return;
				this.top = 0;
				this.itemsFit = Math.floor(height / this.oneHeight);
				this.drawSelected();
			}.bind(this), 100);
		},

		onSearchFilter : function()
		{
			var search = this.searchInput.val().toLowerCase().replace(/\W/g, '');
			if (search === '') this.container.find('.song-item').removeClass('filtered')
			this.container.find('.song-item').addClass('filtered');
			this.songs.each(function(song, index) {
				var songSearch = song.name.toLowerCase().replace(/\W/g, '');

				if (search === '' || songSearch.indexOf(search) !== -1) {
					song.selector.removeClass('filtered');
				}
			}, this);
		},

		onAdd : function(song)
		{
			this.fire('add', song);
		}
	})
});
