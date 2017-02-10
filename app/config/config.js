var path = require('path');
var config = {
	useCompression: false,
	builderCache: false,
	minify : false,
	catalogPath : path.join(__dirname, '../../content'),
//	cacheBust: false,
}

var env = process.env.node_env;

envConfig = {};
try
{
	if (env) envConfig = require('./config.' + env);
}
catch (e)
{
}

module.exports = Object.merge(config, envConfig);
