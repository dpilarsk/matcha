module.exports = {
	success: message => {
		console.log('\x1b[32m' + message + '\x1b[0m')
	},
	debug: message => {
		console.log('\x1b[35m' + message + '\x1b[0m')
	},
	error: message => {
		console.log('\x1b[31m' + message + '\x1b[0m')
	}
}
