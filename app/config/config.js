var path = require('path');
var config = {
	useCompression: false,
	builderCache: false,
	minify : false,
	port: 80,
	baseSocketPort : 8080,
	baseUrl : 'http://localhost/',
	baseSocketUrl : 'http://localhost',
	defaultApp: 'browse',
	processes: 1,
	catalogPath : '/media',
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
