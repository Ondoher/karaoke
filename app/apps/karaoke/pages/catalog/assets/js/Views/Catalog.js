Package('Karaoke.Views', {
	Catalog : new Class({
		Extends : Sapphire.View,

		initialize : function()
		{
			this.parent();
			this.selected = 0;
			this.songs = [];

//			$('.catalog-container').nanoScroller({ alwaysVisible: true });

			KARAOKE.input.listen('inputDown', this.onInputDown.bind(this));
			this.container = $('#catalog-list');
			this.container.on('scrollstop', this.onScrolled.bind(this));


		},

		draw : function(songs)
		{
			this.container.empty();
			this.songs = songs;
			var template;

			songs.each(function(song, index)
			{
				template = SAPPHIRE.templates.get('song-template');
				template.find('#song-name').text(song.name);
				template.attr('id', 'song-' + index);
				template.click(this.onSongSelect.bind(this, song));

				this.container.append(template);
			}, this);

			setTimeout(function()
			{
				var height = this.container.height();
				this.oneHeight = template.outerHeight();
				this.top = 0;
				this.itemsFit = Math.floor(height / this.oneHeight);
				this.drawSelected();
			}.bind(this), 1);
		},

		drawSelected : function()
		{
			$('.song-item').removeClass('selected');
			$('#song-' + this.selected).addClass('selected');
		},

		doScroll : function()
		{
			if (this.container.scrollTop() !== this.top * this.oneHeight)
			{
				this.container.scrollTop(this.top * this.oneHeight);
			}
		},

		checkScroll : function()
		{
			if (this.selected >= this.top + this.itemsFit)
			{
				this.top = this.selected - this.itemsFit / 2;
				this.top = Math.max(this.top, 0);

				this.doScroll();
			}
			else if (this.selected < this.top)
			{
				this.top = this.selected - this.itemsFit / 2;
				this.top = Math.max(this.top, 0);

				this.doScroll();
			}
		},

		up :function()
		{
			this.selected--;
			this.selected = Math.max(this.selected, 0);
			this.drawSelected();
			this.checkScroll();
		},

		down : function()
		{
			this.selected++;
			this.selected = Math.min(this.songs.length - 1, this.selected);
			this.drawSelected();
			this.checkScroll();
		},

		pageUp : function()
		{
			this.top -= this.itemsFit;
			this.top = Math.max(0, this.top);
			this.selected -= this.itemsFit;
			this.selected = Math.max(0, this.selected);
			this.drawSelected();
			this.doScroll();
		},

		pageDown : function()
		{
			this.top += this.itemsFit;
			this.top = Math.min(this.songs.length - this.itemsFit, this.top);
			this.selected += this.itemsFit;
			this.selected = Math.min(this.songs.length - 1, this.selected);
			this.drawSelected();
			this.doScroll();
		},

		onSongSelect : function(song)
		{
		},

		onScrolled : function()
		{
			var scrollTop = this.container.scrollTop();
			var top = Math.floor(Math.round(scrollTop / this.oneHeight));
			if (this.selected < top) this.selected = top;
			else if (this.selected > top + this.itemsFit) this.selected = top + this.itemsFit / 2;

			if (top === this.top) return;

			this.top = top;
			this.drawSelected();
			this.doScroll();
		},

		onInputDown : function(input)
		{
			var action = input.action;
			var data = input.data;
			switch(action)
			{
				case 'up':
					this.up();
					break;
				case 'down':
					this.down();
					break;
				case 'left':
					break;
				case 'right':
					break;
				case 'enter':
					this.fire('songSelect', this.songs[this.selected]);
					break;
				case 'select':
					this.fire('songSelect', this.songs[this.selected]);
					break;
				case 'menu':
					break;
				case 'page-up':
					this.pageUp();
					break;
				case 'page-down':
					this.pageDown();
					break;
				default:
					break;
			}
		}
	})
});
