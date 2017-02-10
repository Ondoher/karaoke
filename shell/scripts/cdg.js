require('mootools');
var fs = require('fs');
var path = require('path');

var PACKET_LENGTH = 24;
var PACKETS_PER_SECOND = 300;

var Cdg = new Class({
	initialize : function(name)
	{
		var cdgFilename = path.join(__dirname, '../content/' + name + '.cdg')
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
