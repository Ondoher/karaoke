var Q = require('q');
var Feature = require('sapphire-express').Feature;

module.exports = function(req, res, app)
{
	var catalogGrid = new Feature(app, '/karaoke/features/catalog-grid/');

	catalogGrid.addCSS(['assets/css/catalog-grid.css']);
	catalogGrid.addJS(['assets/js/Controllers/CatalogGrid.js', 'assets/js/Views/CatalogGrid.js']);

	catalogGrid.addTemplates('templates/catalog-grid.html');


	return Q(app);
}
