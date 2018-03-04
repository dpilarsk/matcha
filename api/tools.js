const	mysql		=	require('mysql2'),
	path			=	require('path'),
	db				=	require(path.join(__dirname, 'resources', 'db.js')),
	message			=	require(path.join(__dirname, 'resources', 'utils.js'))

// function voidCallback () { let e = 'coucou'; throw e }

function isAVal (myVar, value) {
	return myVar === undefined ? value : myVar
}

function dispError (err, msg) {
	err = isAVal(err, '')
	msg = msg === undefined ? '' : '\n\n\t' + msg
	message.error(err + msg)
}

function fatalError (err, msg) {
	msg = msg === undefined ? undefined : 'FATAL: ' + msg
	dispError(err, msg)
	process.exit(1)
}

let connection		=	mysql.createConnection({
	host: db.cred().host,
	user: db.cred().user,
	password: db.cred().password,
	multipleStatements: true
})

function databaseLink (reset) {
	reset = isAVal(reset, false)
	let connectionPromise = new Promise(function (resolve, reject) {
		function dbReady () {
			resolve()
		}
		connection.connect(err => {
			if (err) {
				reject(err)
			} else {
				message.success('Connected to MySQL server')
				if (!reset) {
					databaseQuery('USE matcha', null, dbReady).catch(err => { reject(err) })
				} else {
					resolve()
				}
			}
		})
	}).catch(err => {
		dispError('Cannot connect to database: ' + err)
	})
	return connectionPromise
}

function databaseQuery (Rqt, values, callback) {
	values = isAVal(values, null)
	let queryPromise = new Promise(function (resolve, reject) {
		connection.query(Rqt, values, (err, response) => {
			if (err) {
				reject(err)
			} else {
				resolve(response)
			}
		})
	})
	queryPromise.then((response) => {
		callback(response)
	}).catch(err => {
		dispError(err)
	})
	return queryPromise
}

function checkStrRegex (str, regex) {
	if (str === undefined || typeof str !== 'string') {
		return 1
	}
	if (str.match(regex) === null) {
		return 1
	}
	return 0
}

function escapeHtml (text) {
	var map = {
		'&': '&amp;',
		'<': '&lt;',
		'>': '&gt;',
		'"': '&quot;',
		"'": '&#039;'
	}

	return text.replace(/[&<>"']/g, function (m) { return map[m] })
}

function checkName (str) {
	console.log('Name')
	return checkStrRegex(str, '^[a-zA-Z][a-zA-Z0-9-_.]{1,50}$') // TODO dbl escape is usefull ?
}

function checkUsername (str) {
	console.log('userjkjjj')
	return checkStrRegex(str, '^[a-zA-Z][a-zA-Z0-9-_.]{4,20}$') // TODO dbl escape is usefull ?
}

function checkMail (str) {
	console.log('mail')
	return checkStrRegex(str, '^[A-Za-z0-9._%+-]+@[a-z0-9.-]+.[a-z]{2,4}$')
	// return checkStrRegex(str, '^[a-zA-Z0-9.!#$%&\'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$') // TODO dbl escape is usefull ?
}

function checkPassword (str) {
	console.log('Pass')
	return checkStrRegex(str, '(?=^.{8,50}$)((?=.*\\d)|(?=.*\\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$') // TODO dbl escape is usefull ?
}

function returnError (res, msg) {
	message.error(msg)// TODO U want a msg here ?
	res.json({'status': 0, 'type': 'error', 'message': msg})
}
function returnSuccess (res, msg) {
	message.success(msg)// TODO U want a msg here ?
	res.json({'status': 1, 'type': 'success', 'message': msg})
}

module.exports = {
	escapeHtml: escapeHtml,
	dbLink: databaseLink,
	dbQuery: databaseQuery,
	checkUsername: checkUsername,
	checkName: checkName,
	checkMail: checkMail,
	checkPassword: checkPassword,
	fatal: fatalError,
	dispError: dispError,
	err: returnError,
	suc: returnSuccess
}
