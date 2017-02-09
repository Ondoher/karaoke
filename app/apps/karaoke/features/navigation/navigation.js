var Q = require('q');
var Feature = require('sapphire-express').Feature;

module.exports = function(req, res, app)
{
	var navigation = new Feature(app, '/karaoke/features/navigation/');

	navigation.addJS(['assets/js/Controllers/Input.js','assets/js/Controllers/Keyboard.js']);

	return Q(app);
}
