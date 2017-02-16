var chokidar = require('chokidar');

var listeners = {}
var directory = CONFIG.catalogPath;
if (directory.indexOf(':') !==-1) directory = directory.split(':')[1];
directory = directory.split('\\').join('/');

var watcher = chokidar.watch(directory, {
	ignoreInitial: true,
	cwd: directory,
	depth: 3,
});

watcher
	.on('addDir', function(path)
	{
		console.log('Directory ', path, 'has been added')
		Object.each(listeners, function(socket)
		{
			socket.emit('catalog-update', {})
		});
	})
	.on('unlinkDir', function(path)
	{
		console.log('Directory ', path, 'has been removed')
		Object.each(listeners, function(socket)
		{
			socket.emit('catalog-update', {})
		});
	});


function addListener(socket)
{
	var id = String.uniqueID();
	socket.on('disconnect', onDisconnect.bind(this, id));
	listeners[id] = socket;
}

module.exports.listenUpdate = function(socket, data, callback)
{
	addListener(socket);
	callback();
}

function onDisconnect(id)
{
	delete listeners[id];
}
