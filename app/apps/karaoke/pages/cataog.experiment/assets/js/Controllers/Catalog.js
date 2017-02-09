Package('Karaoke.Controllers', {
	Catalog : new Class({
		Extends : Sapphire.Controller,
		Implements : [Karaoke.Controllers.Mixins.CatalogGrid],

		initialize : function()
		{
			SAPPHIRE.application.listenPageEvent('load', 'catalog', this.onLoad.bind(this));
			SAPPHIRE.application.listenPageEvent('show', 'catalog', this.onShow.bind(this));
			SAPPHIRE.application.listenPageEvent('hide', 'catalog', this.onHide.bind(this));
			SAPPHIRE.application.listenPageEvent('preHide', 'catalog', this.onPreHide.bind(this));

			this.filter = 'last-played';
			this.filterHeader = 'songs-filter-last-played-header';

			this.searchStr = '';
			this.setupGrid();
		},

		compareGames : function(filter, s1, s2)
		{
				return g1.name.localeCompare(g2.name);
		},

		searchMatch : function(song)
		{
			if (this.searchStr == '') return true;
			var songStr = song.name.toLowerCase().replace(/\W/g, '');
			var searchStr = this.searchStr.toLowerCase().replace(/\W/g, '');

			return gameStr.indexOf(searchStr) != -1;
		},

		isType : function(song, filter)
		{
			return true;
		},

		loadSongs : function()
		{
			return this.catalogModel.get();
		},

		onLoad : function()
		{
			this.catalogModel = SAPPHIRE.application.getModel('catalog');

			this.view = new Karaoke.Views.Catalog();
			this.view.listen('gameSelect', this.onGameSelect.bind(this));
			this.view.listen('emptyGrid', this.onEmptyGrid.bind(this));
		},

		onShow : function()
		{
//			this.chromeController.enableSearch(true, this.onSearch.bind(this));
			this.searchStr = '';
			this.drawFiltered();
			this.view.show();
		},

		onPreHide : function()
		{
			this.chromeController.enableSearch(false);
		},

		onHide : function()
		{
		},

		onFilter : function(which, header)
		{
			this.filter = which;
			this.filterHeader = header;

			this.drawFiltered();
		},

		onGameSelect : function(game)
		{
			this.view.hide();
			var appId = game.appId;
			var parentApp = game.parentAppId;

			if (game.appType == 'GAME_DEMO' && parentApp) appId = parentApp;

			SAPPHIRE.application.showPage('game', '/game/game-info', {id: appId});
		},

		onSearch: function(val)
		{
			this.searchStr = val;
			this.drawFiltered();
		},

		onEmptyGrid : function(container, filter, callback)
		{
			this.fire('emptyGrid', container, filter, callback);
		}
	})
});

SAPPHIRE.application.registerController('catalog', new Karaoke.Controllers.Catalog());
