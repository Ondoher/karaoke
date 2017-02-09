Package('Karaoke.Views.Mixins', {
	CatalogGrid : new Class({
		setupGrid : function(container, scroller)
		{
			this.container = container;
			this.scroller = scroller;
		},

		show : function()
		{
			this.hidden = false;
			this.refocus = true;
			this.listenEvt = KARAOKE.navigation.listen('selected', this.onGridSelect.bind(this));
		},

		hide : function()
		{
			this.hidden = true;
			KARAOKE.navigation.remove('selected', this.listenEvt);
		},

		selectFilter : function(filter, header)
		{
		},

		updateSongs : function(songs, filter, header)
		{
			this.filter = filter;

			var container = this.container;
			var firstItem = null;
			container.empty();

			songs.each(function(song)
			{
				var template = SAPPHIRE.templates.get('song-grid-template');

				firstItem = firstItem?firstItem:template;

				template.find('#song-grid-title').text(song.name);

				template.click(this.onSongSelect.bind(this, song));
				template.attr('id', 'song-item-' + song.id);
				container.append(template);
			}, this);

			this.selectFilter(filter, header);
			this.drawControls();

			if (this.scroller) this.scroller.nanoScroller();

			if (this.lastSelected)
			{
				this.selectSong(this.lastSelected);
			}
			else
			{
				KARAOKE.navigation.setupGrid();
			}
		},

		drawEmptyGrid : function(message, filter, headerr)
		{
			var container = this.container;
			var handled = false;

			container.empty();

			this.filter = filter;
			this.controllerFilter = controllerFilter;

			this.fire('emptyGrid', container, filter, function(wasHandled)
			{
				handled = handled || wasHandled;
			}.bind(this));

			if (!handled)
			{
				var template = SAPPHIRE.templates.get('empty-grid');
				template.find('#empty-grid-message').html(message);
				container.append(template);
			}

			this.selectFilter(filter, header);
			this.drawControls();

			if (this.scroller) this.scroller.nanoScroller();

			KARAOKE.navigation.setupGrid();
		},

		selectSong : function(selector)
		{
			KARAOKE.navigation.setupGrid()
				.then(function()
				{
					var newSelector = $('#' + selector.attr('id'));
					KARAOKE.navigation.scrollTo(newSelector);
					KARAOKE.navigation.selectThisItem(newSelector);
					return Q('');
				}.bind(this))
		},

		drawControls : function()
		{
		},

		onGridSelect : function(selector)
		{
			if (selector.attr('id') && selector.attr('id').indexOf('song-item-') != -1)
			{
				this.lastSelected = selector;
			}
			else
			{
				if (!this.hidden)
					this.lastSelected = null;
			}
		},

		onSongSelect : function(song)
		{
			this.fire('songSelect', song);
		}
	})
});
