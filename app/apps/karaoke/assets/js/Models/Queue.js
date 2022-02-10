Package('Karaoke.Models', {
	Queue : new Class({
		Extends : Sapphire.Model,

		initialize : function()
		{
			this.parent();
		},

		get : function()
		{
			var data = {};

			return KARAOKE.service.call(KARAOKE.urls.getQueue, data, 'POST')
				.then(function(data) {
					return (data && data.success) ? Q(data.result) : Q.reject(data.result);
				}.bind(this));
		},

		add : function(song)
		{
			var data = {
				song: JSON.stringify(song),
			}
			return KARAOKE.service.call(KARAOKE.urls.addQueue, data, 'POST')
				.then(function(data) {
					return (data && data.success) ? Q(data.result) : Q.reject(data.result);
				}.bind(this));
		},

		listenQueueUpdate()
		{
			KARAOKE.service.socketListen('queue-update', function()
			{
				this.fire('queue-update');
			}.bind(this));
		}
	})
});

SAPPHIRE.application.registerModel('queue', new Karaoke.Models.Queue());

