const path = require('node:path');

module.exports = {
	apps: [
		{
			name: 'picals-backend',
			port: 6379,
			cwd: path.join(__dirname),
			instances: 1,
			autorestart: true,
			watch: false,
			max_memory_restart: '1G',
			script: './dist/src/main.js',
		},
	],
};
