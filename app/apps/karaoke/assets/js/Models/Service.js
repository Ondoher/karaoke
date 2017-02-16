Package('Karaoke', {
	Service : new Class({
		Extends : Sapphire.Eventer,
		Implements: [Sapphire.Services.AjaxService, Sapphire.Services.SocketService],

		initialize : function()
		{
			this.parent();
			this.initializeAjaxService(true);
			this.initializeSocketService(true);
		},

		start : function()
		{
			this.setupSocketServer(KARAOKE.socketUrl);
		}
	})
});

KARAOKE.service = new Karaoke.Service();
