'use strict'

let API_PORT = process.env.API_PORT || 8081
module.exports = {
	NODE_ENV: '"production"',
	API_PORT,
	SOCKETS: process.env.SOCKETS || '"http://localhost:' + (++API_PORT) + '"',
	URL: process.env.URL || '"http://localhost:' + --API_PORT + '/api"'
}
