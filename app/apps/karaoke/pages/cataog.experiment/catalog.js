var Q = require('q');
var Feature = require('sapphire-express').Feature;

module.exports = function(req, res, app)
{
	var catalog = new Feature(app, '/karaoke/pages/catalog/');

	catalog.addPage({
		name: 'catalog',
		url: 'assets/pages/catalog.html',
		javascript: ['assets/js/Controllers/Catalog.js', 'assets/js/Views/Catalog.js'],
		css: ['assets/css/catalog.css']
	});

	return Q(app);
}
