Package('Browse.Views', {
	Catalog : new Class({
		Extends : Sapphire.View,

		initialize : function()
		{
			this.parent();
			this.container = $('#catalog-list');
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
		}
	})
});
