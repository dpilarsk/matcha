const	mysql		=	require('mysql2'),
	path			=	require('path'),
	db				=	require(path.join(__dirname, 'resources', 'db.js')),
	message			=	require(path.join(__dirname, 'resources', 'utils.js')),
	jwt				=	require('jsonwebtoken')

function voidCallback () {

}

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
	return checkStrRegex(str, '^[a-zA-Z][a-zA-Z0-9-_\\.]{1,50}$')
}

function checkUsername (str) {
	return checkStrRegex(str, '^[a-zA-Z][a-zA-Z0-9-_\\.]{4,20}$')
}

function checkMail (str) {
	return checkStrRegex(str, '^[A-Za-z0-9\\._%+-]+@[a-z0-9\\.-]+\\.[a-z]{2,4}$')
}

function checkPassword (str) {
	return checkStrRegex(str, '(?=^.{8,50}$)((?=.*\\d)|(?=.*\\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$')
}

function checkTag (array) {
	if (array === undefined || array.length === 0) {
		return 1
	}
	array.forEach(function (entry) {
		if (checkStrRegex(entry, '^[a-zA-Z0-9-_\\.]{1,20}$')) {
			return 1
		}
	})
	return 0
}

function checkAge (str) {
	console.log('check Age with [' + str + ']. Type is: ' + typeof str)
	if (str === undefined || typeof str !== 'string') {
		console.log('wrong type or null')
		return 1
	}
	if (isNaN(str)) {
		console.log('is nan!')
		return 1
	}
	if (str < 18 || str > 200) {
		console.log('wrong range')
		return 1
	}
	return 0
}

function checkGender (str) {
	console.log('in gender ' + str)
	return checkStrRegex(str, '^(man|woman)$')
}

function checkOrientationSexe (str) {
	return checkStrRegex(str, '^(bisexual|homosexual|heterosexual)$')
}

function checkDescription (str) {
	if (str === undefined || typeof str !== 'string') {
		console.log('wrong type or null')
		return 1
	}
	return checkStrRegex(str, '^.{10,65535}$') // TODO insert in front !
}

function returnError (res, msg) {
	message.error(msg)// TODO U want a msg here ?
	res.json({'status': 0, 'type': 'error', 'message': msg})
}
function returnSuccess (res, msg) {
	// message.success(msg)// TODO U want a msg here ?
	res.json({'status': 1, 'type': 'success', 'message': msg})
}

function getUserFromToken (req) {
	if (req.headers['authorization']) {
		let token = req.headers['authorization'].split(' ')[1]
		try {
			let decode = jwt.verify(token, 'demo')
			return decode.user
		} catch (err) {
			return 1
		}
	} else {
		return 1
	}
}

module.exports = {
	escapeHtml: escapeHtml,
	dbLink: databaseLink,
	dbQuery: databaseQuery,
	checkUsername: checkUsername,
	checkName: checkName,
	checkMail: checkMail,
	checkPassword: checkPassword,
	checkTag: checkTag,
	checkAge: checkAge,
	checkGender: checkGender,
	checkOrientationSexe: checkOrientationSexe,
	checkBio: checkDescription,
	fatal: fatalError,
	dispError: dispError,
	err: returnError,
	suc: returnSuccess,
	getUser: getUserFromToken,
	void: voidCallback
}
