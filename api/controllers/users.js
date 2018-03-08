const path		=	require('path'),
	tool		=	require(path.join(__dirname, '..', 'tools.js')),
	bcrypt		=	require('bcrypt'),
	jwt			=	require('jsonwebtoken'),
	message		=	require(path.join(__dirname, '..', 'resources', 'utils.js')),
	nodemailer	=	require('nodemailer')

let queryPromise = tool.dbLink()
let transporter = nodemailer.createTransport({
	port: 1025,
	ignoreTLS: true
})

function getUser (req, res) {
	function queryFailed (msg) {
		tool.err(res, msg)
	}
	function returnUserList (response) {
		tool.suc(res, response)
	}
	if (req.query.pop) {
		req.query.pop = (req.query.pop[0]).split(',')
	} else {
		req.query.pop = []
	}
	req.query.pop[0] = req.query.pop[0] || 0
	req.query.pop[1] = req.query.pop[1] || 9999

	let getCoordsRange = function (radius, latitude, longitude) {
		let kmInDegree = 111.320 * Math.cos(latitude / 180.0 * Math.PI)
		let deltaLat = radius / 111.1
		let deltaLong = radius / kmInDegree

		let minLat = latitude - deltaLat
		let maxLat = latitude + deltaLat
		let minLong = longitude - deltaLong
		let maxLong = longitude + deltaLong
		return {minLat, maxLat, minLong, maxLong}
	}

	if (!req.query.distance) req.query.distance = 50
	if (req.query.coords) {
		req.query.coords = (req.query.coords).split(',')
		var coords = getCoordsRange(Number(req.query.distance), Number(req.query.coords[1]), Number(req.query.coords[0]))
	} else {
		coords = {
			minLat: -180,
			maxLat: 180,
			minLong: -180,
			maxLong: 180
		}
	}

	if (req.query.sexual_orientation) {
		req.query.sexual_orientation = (req.query.sexual_orientation[0]).split(',')
	} else {
		req.query.sexual_orientation = []
	}
	// TODO Why this 3 lines below ?
	req.query.sexual_orientation[0] = req.query.sexual_orientation[0] === undefined ? undefined : 'heterosexual'
	req.query.sexual_orientation[1] = req.query.sexual_orientation[1] === undefined ? undefined : 'bisexual'
	req.query.sexual_orientation[2] = req.query.sexual_orientation[2] === undefined ? undefined : 'homosexual'

	if (!req.query.limit || isNaN(Number(req.query.limit)) || req.query.limit > 100) {
		req.query.limit = 30
	} else {
		req.query.limit = Number(req.query.limit)
	}

	if (!req.query.page || isNaN(Number(req.query.page))) {
		req.query.page = 0
	} else {
		req.query.page = Number(req.query.page) - 1
	}
	if (!req.query.sort) {
		req.query.sort = ['id', 'asc']
	} else {
		// TODO why there is a tmp var ?
		let tab = req.query.sort.split('_', 2)
		req.query.sort = tab
	}
	queryPromise.then(() => {
		tool.dbQuery(
			'SELECT * ' +
			'FROM user ' +
			'WHERE ' +
			'(gender = ? OR ? IS NULL) AND ' +
			'(sexual_orientation = ? OR sexual_orientation = ? OR sexual_orientation = ? OR ? IS NULL) AND ' +
			'((latitude BETWEEN ? AND ?) OR ? is NULL) AND ((longitude BETWEEN ? AND ?) OR ? is NULL) AND' +
			'((popularity BETWEEN ? AND ?) OR ? IS NULL) ' +
			'ORDER BY ' + req.query.sort[0] + ' ' + req.query.sort[1] + ' LIMIT ? OFFSET ?',
			[req.query.gender, req.query.gender,
				req.query.sexual_orientation[0], req.query.sexual_orientation[1], req.query.sexual_orientation[2], req.query.sexual_orientation[0],
				coords.minLat, coords.maxLat, coords.maxLat, coords.minLong, coords.maxLong, coords.maxLong,
				req.query.pop[0], req.query.pop[1], req.query.pop[0],
				req.query.limit, req.query.page * req.query.limit],
			returnUserList
		).catch(err => {
			queryFailed('Request failed:<br>' + err)
		})
	}).catch(err => {
		tool.dispError(err)
		queryFailed('Request failed')
	})
}

// TODO same for adding profile
function insertNewUser (req, res) {
	function queryFailed (msg) {
		tool.err(res, msg)
	}

	function alreadyPresent (response) {
		let msg = 'Cannot create user:<br>'
		let index = 0
		while (index < response.length) {
			if (param.username === response[index].username) {
				msg = msg + 'Username \'' + tool.escapeHtml(param.username) + '\' is already used<br>'
			}
			if (param.email === response[index].email) {
				msg = msg + 'Email \'' + tool.escapeHtml(param.email) + '\' is already used<br>'
			}
			index += 1
		}
		queryFailed(msg) // TODO check if msg formating is good !!!! WARNING TODO TODO ! display html as html not as text
	}

	function createToken (response) {
		if (response === undefined || response.length !== 1) {
			queryFailed('Failed to execute request')
		}
		let hash = bcrypt.hashSync(Date.now() + param.username, 10).replace(/\//g, '') // Async is useless in a already async function
		function sendMail () {
			// let token1 = encodeURI(token) // token.split('/').join('').split('.').join('')
			let link = 'http://localhost:8080/confirm/' + encodeURI(hash) // TODO not localhost
			let mail = {
				from: 'meeting@matcha.fr',
				to: param.email,
				subject: 'Confirmer votre compte sur Matcha !',
				html:
				'<h1>Welcome on Matcha</h1>' +
				'<p>Please confirm your account with this link.</p><br>' +
				'<a href="' + link + '">Validate my account</a>' +
				'<br><br>' +
				'if link cannot be displayed:' +
				'<a href="' + link + '">' + link + '</a>' +
				''
			}
			transporter.sendMail(mail, (err, info) => {
				if (err) {
					message.error(err)
					res.json({'status': 0, type: 'error', 'message': 'Une erreur est survenue durant l\'envoi de l\'email.'})
				} else {
					res.json({'status': 1, type: 'success', 'message': 'Votre compte à bien été crée, veuillez consulter votre boite mail.'})
				}
			})
		}
		tool.dbQuery(
			'INSERT INTO `token` (`user_ID`, `token`)' +
			'VALUES (?, ?)',
			[response[0].ID, hash],
			sendMail
		).catch(err => {
			queryFailed('Request failed:<br>' + err)
		})
	}
	function setNewUser () {
		tool.dbQuery(
			'SELECT `ID` FROM `user` WHERE `username` = ?',
			[param.username],
			createToken
		).catch(err => {
			queryFailed('Request failed:<br>' + err)
		})
	}

	function processNewUser (response) {
		if (response === undefined) {
			queryFailed('Failed to execute requet')
		}
		if (response.length !== 0) {
			return alreadyPresent(response)
		}
		let hash = bcrypt.hashSync(param.password, 10) // Async is useless in a already async function
		tool.dbQuery(
			'INSERT INTO `user` (`username`, `first_name`, `last_name`, `password`, `email`)' +
			'VALUES (?, ?, ?, ?, ?)',
			[param.username, param.firstName, param.lastName, hash, param.email],
			setNewUser
		).catch(err => {
			queryFailed('Request failed:<br>' + err)
		})
	}

	let param = req.body[0]
	if (!param || tool.checkUsername(param.username) || tool.checkMail(param.email) || tool.checkPassword(param.password) || tool.checkName(param.firstName) || tool.checkName(param.lastName)) {
		return queryFailed('Wrong data sent')
	}
	queryPromise.then(() => {
		tool.dbQuery(
			'SELECT * ' + // TODO replace * by specific fields
			'FROM `user`' +
			'WHERE `username` = ? OR `email` = ?',
			[param.username, param.email],
			processNewUser
		).catch(err => {
			queryFailed('Request failed:<br>' + err)
		})
	}).catch(err => {
		tool.dispError(err)
		queryFailed('Request failed')
	})
}

function logIn (req, res) {
	function queryFailed (msg) {
		tool.err(res, msg)
	}
	function processLogin (response) {
		if (response === undefined || response.length === 0) {
			return queryFailed('Not a valid account')
		}
		if (response[0].status === 0) {
			return queryFailed('You must activate your account first')
		}
		bcrypt.compare(param.password, response[0].password, (err, res1) => {
			if (err || !res1) {
				return queryFailed('Wrong password')
			}
			res.json({'status': 1, type: 'success', 'message': 'Vous êtes désormais connecté.', 'token': jwt.sign({user: response[0], exp: Math.floor(Date.now() / 1000) + ((60 * 60) * 24)}, 'demo')})
		})
	}

	let param = req.body[0]
	if (!param || (tool.checkUsername(param.login) && tool.checkMail(param.login)) || tool.checkPassword(param.password)) {
		return queryFailed('Wrong data sent') // res.json({'status': 0, type: 'error', 'message': 'Une erreur est survenue.'})
	}
	queryPromise.then(() => {
		tool.dbQuery(
			'SELECT * ' + // TODO replace * by specific fields
			'FROM `user`' +
			'WHERE `username` = ? XOR `email` = ?',
			[param.login, param.login],
			processLogin
		).catch(err => {
			queryFailed('Request failed:<br>' + err)
		})
	}).catch(err => {
		tool.dispError(err)
		queryFailed('Request failed')
	})
}

function getMyUserProfile (req, res) {
	function queryFailed () {
		tool.err(res, 'An error occured... No user found')
	}
	function querySuccess (response) {
		if (response === undefined || response.length === 0) {
			queryFailed()
		} else {
			tool.suc(res, response)
		}
	}
	queryPromise.then(() => {
		tool.dbQuery(
			'SELECT * ' + // TODO replace * by specific fields
			'FROM `user`' +
			'INNER JOIN `profile` ON `profile`.`user_ID` = `user`.`ID` ' +
			'WHERE `username` = ?',
			[req.params.username],
			querySuccess
		).catch(err => {
			queryFailed('Request failed:<br>' + err)
		})
	}).catch(err => {
		tool.dispError(err)
		queryFailed()
	})
}

function updateMyUserAccount (req, res) {
	let user = tool.getUser(req)
	if (user === 1) tool.err(res, 'Please logout and login again.')
	let hash = bcrypt.hashSync(req.body[0].password, 10) // Async is useless in a already async function
	// TODO profile update
	// TODO check params
	function queryFailed () {
		tool.err(res, 'An error occured... Your account cannot be updated')
	}
	function querySuccess (response) {
		if (response === undefined || response.length === 0 || response['affectedRows'] === 0) {
			queryFailed()
		} else {
			req.body[0].password = hash
			res.json({'status': 1, type: 'success', 'message': 'Your informations are update..', 'token': jwt.sign({user: req.body[0], exp: Math.floor(Date.now() / 1000) + ((60 * 60) * 24)}, 'demo')})
			tool.suc(res, 'Informations successfully updated')
			// TODO update server value for user and next rqt
		}
	}
	queryPromise.then(() => {
		tool.dbQuery(
			'UPDATE `user` ' +
			'SET `first_name` = ?, `last_name` = ?, `password` = ?, `email` = ? ' +
			'WHERE `username` = ?',
			[req.body[0].first_name, req.body[0].last_name, hash, req.body[0].email, user.username], // TODO BODY not params
			querySuccess
		).catch(err => {
			queryFailed('Request failed:<br>' + err)
		})
	}).catch(err => {
		tool.dispError(err)
		queryFailed()
	})
}

function deleteMyAccount (req, res) {
	// TODO check params
	// TODO check if is same user connected as user deleted ==> check if token is valid
	function queryFailed () {
		tool.err(res, 'An error occured... Your account cannot be deleted')
	}
	function querySuccess (response) {
		if (response === undefined || response.length === 0 || response['affectedRows'] === 0) {
			queryFailed()
		} else {
			tool.suc(res, 'Account successfully deleted')
			// TODO logout people and redirect
		}
	}
	queryPromise.then(() => {
		tool.dbQuery(
			'DELETE FROM `user` ' +
			'WHERE `username` = ?',
			[req.params.username],
			querySuccess
		).catch(err => {
			queryFailed('Request failed:<br>' + err)
		})
	}).catch(err => {
		tool.dispError(err)
		queryFailed()
	})
}

module.exports = {
	index: getUser,
	create: insertNewUser,
	login: logIn,
	read: getMyUserProfile,
	update: updateMyUserAccount,
	delete: deleteMyAccount
}
