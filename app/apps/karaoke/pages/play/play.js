var Q = require('q');
var Feature = require('sapphire-express').Feature;

module.exports = function(req, res, app)
{
	var play = new Feature(app, '/karaoke/pages/play/');

	play.addPage({
		name: 'play',
		url: 'assets/pages/play.html',
		javascript: ['assets/js/Controllers/Play.js', 'assets/js/Views/Play.js'],
		css: ['assets/css/play.css']
	});

	return Q(app);
}
