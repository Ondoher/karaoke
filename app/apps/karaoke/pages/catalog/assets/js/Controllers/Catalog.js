Package('Karaoke.Controllers', {
	Catalog : new Class({
		Extends : Sapphire.Controller,

		initialize : function()
		{
			SAPPHIRE.application.listenPageEvent('load', 'catalog', this.onLoad.bind(this));
			SAPPHIRE.application.listenPageEvent('show', 'catalog', this.onShow.bind(this));
			SAPPHIRE.application.listenPageEvent('hide', 'catalog', this.onHide.bind(this));
			SAPPHIRE.application.listenPageEvent('firstShow', 'catalog', this.onFirstShow.bind(this));
			this.songQueue = [];
			this.queueIndex = 0;
		},

		onLoad : function()
		{
			this.view = new Karaoke.Views.Catalog();
			this.view.listen('songSelect', this.onSongSelect.bind(this));
			this.view.listen('resume', this.onResume.bind(this));

			this.catalog = SAPPHIRE.application.getModel('catalog');
			this.queue = SAPPHIRE.application.getModel('queue');
		},

		updateCatalog : function()
		{
			this.view.busy(true);
			return this.catalog.get()
				.then(function(songs)
				{
					this.view.busy(false);
					this.songs = songs;
					this.view.draw(songs);
				}.bind(this))
		},

		updateQueue()
		{
			this.songQueue = [];
			this.queue.get()
				.then(function(queue)
				{
					this.songQueue = queue;
					this.view.setHaveQueue(this.songQueue && this.songQueue.length > this.queueIndex);
				}.bind(this));
		},

		onFirstShow : function()
		{
			this.catalog.listenCatalogUpdate();
			this.catalog.listen('catalog-update', this.onCatalogUpdate.bind(this));
			this.queue.listenQueueUpdate();
			this.queue.listen('queue-update', this.onQueueUpdate.bind(this));

			this.updateCatalog();
			this.updateQueue();
		},

		onShow : function(action)
		{
			if (action === 'done') this.queueIndex++;
			if (action === 'done' && this.songQueue.length > this.queueIndex)
			{
				SAPPHIRE.application.showPage('play', this.songQueue[this.queueIndex]);
			}
			else if (this.view.paused)
			{
				this.view.drawSelected();
				this.view.doScroll();
				this.view.resume();
			}

			this.view.setHaveQueue(this.songQueue && this.songQueue.length > this.queueIndex);
		},

		onHide : function()
		{
			this.view.pause();
		},

		onSongSelect : function(song)
		{
			if (this.songQueue.length > this.queueIndex)
			{
				this.queue.add(song)
					.then(function()
					{
					}.bind(this));
			}
			else
			{
				SAPPHIRE.application.showPage('play', song);
			}
		},

		onResume  : function()
		{
			SAPPHIRE.application.showPage('play', this.songQueue[this.queueIndex]);
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

		onQueueUpdate : function()
		{
			console.log('onQueueUpdate...');
			this.updateQueue();
	},

	})
});

SAPPHIRE.application.registerController('catalog', new Karaoke.Controllers.Catalog());
