var fs = require('fs');
var path = require('path');
var Q = require('q');
var Service = require('sapphire-express').Service;
function getDir(path)
{
	var deferred = Q.defer();

	fs.readdir(path, function(err, files)
	{
		if (err) deferred.reject(err);
		else deferred.resolve(files);
	});

	return deferred.promise;
}

function isDirectory(path)
{
	var deferred = Q.defer();

	fs.stat(path, function(err, stats)
	{
		deferred.resolve({path: path, directory: stats.isDirectory()});
	});

	return deferred.promise;
}

function findCdg(root, catalog)
{
	root = (root === undefined)?CONFIG.catalogPath:root;

	return getDir(root)
		.then(function(files)
		{
			var promises = [];

			files.each(function(file)
			{
				if (file.charAt(0) == '.') return;
				if (path.extname(file) === '.cdg') catalog.push({path: root, name: path.basename(file, '.cdg')});
				else promises.push(isDirectory(root + '/' + file))
			});

			return Q.all(promises)
				.then(function(result)
				{
					promises = [];

					result.each(function(one)
					{
						if (one.directory) promises.push(findCdg(one.path, catalog));
					});

					return Q.all(promises);
				})
	});
}

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

	get : function(req, res)
	{
		var catalog = [];
		return findCdg(CONFIG.catalogPath, catalog)
			.then(function(dir)
			{
				catalog.each(function(file)
				{
					var id = String.uniqueID();
					file.id = id;
					file.path = file.path.slice(CONFIG.catalogPath.length);
				}, this);

				return Q({success: true, result: catalog});
			}.bind(this));
	},
});

new CatalogService();
