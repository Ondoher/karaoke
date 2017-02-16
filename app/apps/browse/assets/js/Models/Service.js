Package('Browse', {
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
			this.setupSocketServer(BROWSE.socketUrl);

		}
	})
});

BROWSE.service = new Browse.Service();
