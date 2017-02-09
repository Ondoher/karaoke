var Q = require("q");
var path = require('path');
var Service = require('sapphire-express').Service;
var static = require('node-static');

var directory = CONFIG.catalogPath;
if (directory.indexOf(':') !==-1) directory = directory.split(':')[1];
directory = directory.split('\\').join('/');
var file = new(static.Server)(directory);

DownloadService = new Class({
	Implements : [Service],

	initialize : function()
	{
		this.export('music', module);
		this.addCSRFException('music');
	},

	verify : function(req, res)
	{
		return true;
	},

	music : function(req, res)
	{
		var deferred = Q.defer();
		var filename = req.query.filename;
		file.serveFile(filename, 200, {}, req, res).on('end', function()
		{
			deferred.resolve(null);
		}.bind(this)).on('error', function(e)
		{
			console.log(e);
		}.bind(this));

		return deferred.promise;
	},

	mac : function(req, res)
	{
		var deferred = Q.defer();
		file.serveFile(CONFIG.downloadPath.mac, 200, {}, req, res).on('end', function()
		{
			deferred.resolve(null);
		}.bind(this)).on('error', function(e)
		{
			console.log(e);
		}.bind(this));

		return deferred.promise;
	}

});


new DownloadService();


