Package('Browse.Models', {
	Queue : new Class({
		Extends : Sapphire.Model,

		initialize : function()
		{
			this.parent();
		},

		get : function()
		{
			var data = {};

			return BROWSE.service.call(BROWSE.urls.getQueue, data, 'POST')
				.then(function(data) {
					return (data && data.success) ? Q(data.result) : Q.reject(data.result);
				}.bind(this));
		},

		add : function(song)
		{
			var data = {
				song: JSON.stringify(song),
			}
			return BROWSE.service.call(BROWSE.urls.addQueue, data, 'POST')
				.then(function(data) {
					return (data && data.success) ? Q(data.result) : Q.reject(data.result);
				}.bind(this));
		},

		listenQueueUpdate()
		{
			BROWSE.service.socketListen('queue-update', function()
			{
				this.fire('queue-update');
			}.bind(this));
		}

	})
});

SAPPHIRE.application.registerModel('queue', new Browse.Models.Queue());

