var songQueue = require('../models/SongQueue');
var listeners = {}
songQueue.on('updated', onQueueUpdate);

function addListener(socket)
{
	var id = String.uniqueID();
	socket.on('disconnect', onDisconnect.bind(this, id));
	console.log('connected', id);
	listeners[id] = socket;
}

module.exports.listenUpdate = function(socket, data, callback)
{
	addListener(socket);
	callback();
}

function onQueueUpdate()
{
	Object.each(listeners, function(socket)
	{
		socket.emit('queue-update', {})
	})
}

function onDisconnect(id)
{
	console.log('disconnected', id);
	delete listeners[id];
}
