var events = require('events');

var SongQueue = new Class({
	initialize : function() {
		this.queue = [];
	},

	add : function(song)
	{
		this.queue.push(song);

		console.log('new queue', this.queue);
		this.emit('updated');
	},

	get : function()
	{
		return this.queue;
	},

	remove : function(idx)
	{
		this.queue.splice(idx, 1);
		this.emit('updated');
	}
});
SongQueue.implement(events.EventEmitter.prototype);

var queue = new SongQueue();
module.exports = queue;






