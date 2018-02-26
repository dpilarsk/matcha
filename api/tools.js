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
	})
	return queryPromise
}

function checkStrRegex (str, regex) {
	if (str === undefined || !str || !(str instanceof String)) {
		return 1
	}
	if (str.match(regex) === null) {
		return 1
	}
	return 0
}

function checkName (str) {
	return checkStrRegex(str, '/^[a-zA-Z][a-zA-Z0-9-_\\.]{1,50}$/') // TODO dbl escape is usefull ?
}

function checkUsername (str) {
	return checkStrRegex(str, '/^[a-zA-Z][a-zA-Z0-9-_\\.]{4,20}$/') // TODO dbl escape is usefull ?
}

function checkMail (str) {
	return checkStrRegex(str, '^[a-zA-Z0-9.!#$%&\'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$') // TODO dbl escape is usefull ?
}

function checkPassword (str) {
	return checkStrRegex(str, '/(?=^.{8,50}$)((?=.*\\d)|(?=.*\\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/') // TODO dbl escape is usefull ?
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
	dbLink: databaseLink,
	dbQuery: databaseQuery,
	checkUsername: checkUsername,
	checkName: checkName,
	checkMail: checkMail,
	checkPassword: checkPassword,
	fatal: fatalError,
	err: returnError,
	suc: returnSuccess
}
