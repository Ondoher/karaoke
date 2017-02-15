require('mootools');
var fs = require('fs');
var path = require('path');
var config = require('../../app/config/config');
var env = process.env.node_env;
console.log(env);

envConfig = {};
try
{
	if (env) envConfig = require('../../app/config/config.' + env);
	console.log(envConfig.catalogPath);
}
catch (e)
{
	console.log(e.stack);
}
Object.merge(config, envConfig)

console.log(config.catalogPath);

var PACKET_LENGTH = 24;
var PACKETS_PER_SECOND = 300;

var Cdg = new Class({
	initialize : function(dir, name)
	{
		var cdgFilename = path.join(config.catalogPath, dir);
		cdgFilename = path.join(cdgFilename, name + '.cdg');
		var cdgData = fs.readFileSync(cdgFilename);
		this.buffer = cdgData;
	},

	getPacket : function(index)
	{
		var slice = this.buffer.slice(index * PACKET_LENGTH + PACKET_LENGTH);
		if (slice.length === 0)
		{
			return false;
		}
		var command = slice.readUInt8(0);
		var instruction = slice.readUInt8(1);
		var dataBuf = slice.slice(4, 20);
		var data = [];
		for (var byte of dataBuf) data.push(byte);

		return {
			command: command & 0x3F,
			instruction: instruction & 0x3F,
			data: data
		}
	},

	length : function()
	{
		return this.buffer.length / PACKET_LENGTH;
	},

	getPackets : function(start, count)
	{
		var packets = [];
		var index = start
		var stop = index + count;

		for (var idx = index; idx < stop; idx++)
		{
			var packet = this.getPacket(idx);
			if (packet) packets.push(packet);
		}

		return packets;
	}
});

module.exports = Cdg;



















































































































































										 8
