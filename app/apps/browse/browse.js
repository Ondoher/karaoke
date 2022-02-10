var Q = require('q');
var sapphire = require('sapphire-express');

function main(req, res, app)
{
	app.addCSS([
		'/karaoke/assets/css/fonts.css',
		'/browse/assets/css/flex.css',
		'/browse/assets/css/browse.css',
	]);

	app.addJS([
		'/socket.io/socket.io.js',
		'/assets/js/lib/translate.js',
		'/assets/js/lib/templates.js',
		'/assets/js/lib/ajax-service.js',
		'/assets/js/lib/socket-service.js',
		'/browse/assets/js/Models/Service.js',
		'/browse/assets/js/Models/Catalog.js',
		'/browse/assets/js/Models/Queue.js',
		'/browse/assets/js/Views/Browse.js',
		'/browse/assets/js/Controllers/Browse.js',
	]);


	return Q(app)
}

function use(type, name, req, res)
{
	var module = require('./' + type + '/' + name + '/' + name + '.js');
	return function(app)
	{
		return module(req, res, app);
	}
}

exports.getApplication = function(req, res)
{
	var session = req.session.get();
	var app = new sapphire.Application('BROWSE', req, res);

	app.setTitle('Browse');
	app.setBody('apps/browse/templates/body.html');
	app.setMaster('apps/browse/templates/master.html');
	app.addUrl('getCatalog', '/karaoke/services/catalog/get');
	app.addUrl('getQueue', '/karaoke/services/queue/get');
	app.addUrl('addQueue', '/karaoke/services/queue/add');
	app.addUrl('removeQueue', '/karaoke/services/queue/remove');
	app.addVariable('socketPort', process.env.socketPort);
	app.addVariable('socketUrl', CONFIG.baseSocketUrl + ':' + process.env.socketPort);

	return main(req, res, app)
		.then(sapphire.features.animator.bind(sapphire.features.animator, req, res))
		.then(sapphire.features.dialogs.bind(sapphire.features.dialogs, req, res))
		.then(use('pages', 'catalog'))
		.then(function(app)
		{
			return Q(app);
		})
}
