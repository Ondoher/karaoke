Package('Karaoke.Controllers.Mixins', {
	CatalogGrid : new Class({
		Extends : Sapphire.Controller,

		setupGrid : function()
		{
			this.filters = {};
		},

		compareSongs : function(s1, s2)
		{
			return s1.name.toLowerCase().localeCompare(s2.name.toLowerCase());
		},

		filterSearch : function(songs)
		{
			return songs.filter(function(song)
			{
				if (this.searchMatch(song)) return song;
				return null;
			}, this);
		},

		getFilterList : function(filter)
		{
			this.currentFilter = filter;

			return this.loadSongs()
				.then(function(songs)
				{
					this.filters[filter] = songs.sort(this.compareSongs.bind(this));

					return Q(this.filters[filter]);
				}.bind(this));
		},

		drawFiltered : function(emptyMsg)
		{
			return this.getFilterList(this.filter)
				.then(function(filtered)
				{
					filtered = this.filterSearch(filtered);

					if (filtered.length === 0)
						this.emptyList(this.filter, this.filterHeader, this.controllerFilter, emptyMsg);
					else
						this.view.draw(filtered, this.filter, this.filterHeader, this.controllerFilter);
					return Q(true);
				}.bind(this))
		},

		emptyList : function(filter, filterHeader, controllerFilter, emptyMsg)
		{
			var copy = (typeof emptyMsg !== 'undefined' && emptyMsg)
				? emptyMsg : 'No songs in this list';

			this.view.drawEmptyGrid(_T(copy), filter, filterHeader, controllerFilter);
		},

		onFilter : function(which, header)
		{
			this.filter = which;
			this.filterHeader = header;
			this.drawFiltered();
		}
	})
});
