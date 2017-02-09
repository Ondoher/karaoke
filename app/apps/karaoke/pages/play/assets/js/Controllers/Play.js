Package('Karaoke.Controllers', {
	Play : new Class({
		Extends : Sapphire.Controller,

		initialize : function()
		{
			this.parent();

			SAPPHIRE.application.listenPageEvent('load', 'play', this.onLoad.bind(this));
			SAPPHIRE.application.listenPageEvent('show', 'play', this.onShow.bind(this));
			SAPPHIRE.application.listenPageEvent('hide', 'play', this.onHide.bind(this));
		},

		onLoad : function()
		{
			this.view = new Karaoke.Views.Play();
			this.view.listen('back', this.onBack.bind(this));
		},

		onShow : function(song)
		{
			console.log(arguments);
			this.view.draw(song)
		},

		onHide : function()
		{
			this.view.erase();
		},

		onBack : function()
		{
			SAPPHIRE.application.showPage('catalog');
		}
	})
});

SAPPHIRE.application.registerController('play', new Karaoke.Controllers.Play());
