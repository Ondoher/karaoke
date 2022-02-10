var fs = require('fs');
var path = require('path');
var Q = require('q');
var Service = require('sapphire-express').Service;
var songQueue = require('../models/SongQueue');

QueueService = new Class({
	Implements : [Service],

	initialize : function()
	{
		this.catalogPath = CONFIG.catalogPath;
		this.export('get', module);
		this.export('add', module);
		this.export('remove', module);
		this.addCSRFException('get');
		this.queue = {};
	},

	verify : function(req, res)
	{
		return true;
	},

	get : function(req, res)
	{
		var queue = songQueue.get();
		return Q({success: true, result: queue});

	},

	add : function(req, res)
	{
		var song = JSON.parse(req.body.song);

		songQueue.add(song);
		return Q({success: true, result: null});
	},

	remove : function(req, res)
	{
		var songIndex = req.body.songIndex;
		songQueue.remove(songIndex);
		return Q({success: true, result: null});
	}
});

new QueueService();
