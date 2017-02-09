Package('Karaoke.Models', {
	Catalog : new Class({
		Extends : Sapphire.Model,

		initialize : function()
		{
			this.parent();
		},

		get : function(cert, key, passphrase)
		{
			var data = {
			};

			return KARAOKE.service.call(KARAOKE.urls.getCatalog, data, 'POST')
				.then(function(data) {
					return (data && data.success) ? Q(data.result) : Q.reject(data.result);
				}.bind(this));
		},
	})
});

SAPPHIRE.application.registerModel('catalog', new Karaoke.Models.Catalog());

