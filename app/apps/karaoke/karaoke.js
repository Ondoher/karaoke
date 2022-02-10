var Q = require('q');
var sapphire = require('sapphire-express');

function main(req, res, app)
{
	app.addCSS([
		'/karaoke/assets/css/fonts.css',
		'/karaoke/assets/css/karaoke.css',
		'/karaoke/assets/css/3rdParty/nanoscroller.css',
	]);

	app.addJS([
		'/socket.io/socket.io.js',
		'/assets/js/lib/translate.js',
		'/assets/js/lib/templates.js',
		'/assets/js/lib/ajax-service.js',
		'/assets/js/lib/socket-service.js',
		'/karaoke/assets/js/3rdParty/jquery.nanoscroller.js',
		'/karaoke/assets/js/3rdParty/jquery-plugins.js',
		'/karaoke/assets/js/3rdParty/monkey.js',
		'/karaoke/assets/js/Views/Karaoke.js',
		'/karaoke/assets/js/Models/Service.js',
		'/karaoke/assets/js/Models/Catalog.js',
		'/karaoke/assets/js/Models/Queue.js',
		'/karaoke/assets/js/Controllers/Karaoke.js',
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
	var app = new sapphire.Application('KARAOKE', req, res);

	app.setTitle('Karaoke Pi');
	app.setBody('apps/karaoke/templates/body.html');
	app.setMaster('apps/karaoke/templates/master.html');
	app.addUrl('getCatalog', '/karaoke/services/catalog/get');
	app.addUrl('getQueue', '/karaoke/services/queue/get');
	app.addUrl('addQueue', '/karaoke/services/queue/add');
	app.addUrl('removeQueue', '/karaoke/services/queue/remove');
	app.addVariable('socketPort', process.env.socketPort);
	app.addVariable('socketUrl', CONFIG.baseSocketUrl + ':' + process.env.socketPort);

	return main(req, res, app)
		.then(sapphire.features.animator.bind(sapphire.features.animator, req, res))
		.then(sapphire.features.dialogs.bind(sapphire.features.dialogs, req, res))
		.then(use('features', 'navigation'))
		.then(use('pages', 'catalog'))
		.then(use('pages', 'play'))
		.then(function(app)
		{
			return Q(app);
		})
}
