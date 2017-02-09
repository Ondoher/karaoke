var fs = require('fs');
var path = require('path');
var Q = require('q');
var Service = require('sapphire-express').Service;


CatalogService = new Class({
	Implements : [Service],

	initialize : function()
	{
		this.catalogPath = CONFIG.catalogPath;
		this.export('get', module);
		this.addCSRFException('get');
	},

	verify : function(req, res)
	{
		return true;
	},

	getDir : function(path)
	{
		var deferred = Q.defer();

		fs.readdir(path, function(err, files)
		{
			if (err) deferred.reject(err);
			else deferred.resolve(files);
		});

		return deferred.promise;
	},

	get : function(req, res)
	{
		return this.getDir(this.catalogPath)
			.then(function(dir)
			{
				var catalog = [];

				dir.each(function(file)
				{
					var id = String.uniqueID();
					var ext = path.extname(file);
					if (ext === '.cdg') {
						var name = path.basename(file, '.cdg');
						catalog.push({name: name, id: id});
					}
				});

				return Q({success: true, result: catalog});
			}.bind(this));

	},
});

new CatalogService();
