Package('Browse.Models', {
	Catalog : new Class({
		Extends : Sapphire.Model,

		initialize : function()
		{
			this.parent();
		},

		get : function()
		{
			var data = {
			};

			return BROWSE.service.call(BROWSE.urls.getCatalog, data, 'POST')
				.then(function(data) {
					return (data && data.success) ? Q(data.result) : Q.reject(data.result);
				}.bind(this));
		},

		listenCatalogUpdate()
		{
			BROWSE.service.socketListen('catalog-update', function()
			{
				this.fire('catalog-update');
			}.bind(this));
		}

	})
});

SAPPHIRE.application.registerModel('catalog', new Browse.Models.Catalog());

