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

function suggestions (req, res) {
	function queryFailed (msg) {
		tool.err(res, msg)
	}
	function querySuccess (response) {
		tool.suc(res, response)
	}
	let user = tool.getUser(req)
	if (user === 1) tool.err(res, 'Please logout and login again.suggestions')
	else {
		if (!req.query.limit || isNaN(Number(req.query.limit)) || req.query.limit > 100) {
			req.query.limit = 30
		} else {
			req.query.limit = Number(req.query.limit)
		}
		if (!req.query.lastId || isNaN(Number(req.query.lastId))) {
			req.query.lastId = 1
		} else {
			req.query.lastId = Number(req.query.lastId)
		}
		let tags = [null]
		if (req.query.tags && req.query.tags.length > 0) {
			req.query.tags.forEach(t => tags.push(Number(t)))
		}
		if (!req.query.ids) req.query.ids = [0]
		switch (user.profile.gender) {
		case 'man':
			switch (user.profile.sexual_orientation) {
			case 'heterosexual':
				queryPromise.then(() => {
					tool.dbQuery(
						'SELECT * FROM (SELECT `profile`.*, `user`.`username`, ' +
						'(SELECT GROUP_CONCAT(`tag_to_user`.`tag_ID`) FROM `tag_to_user` WHERE `tag_to_user`.`user_ID` = `profile`.`user_ID`) as `tags_id`,' +
						'(SELECT COUNT(*) FROM `block` WHERE (`user_ID_destination` = `profile`.`user_ID` AND `user_ID_source` = ?)) as `block`,' +
						'(SELECT COUNT(`ID`) FROM `tag_to_user` WHERE `tag_ID` IN (?) AND `tag_to_user`.`user_ID` = `profile`.`user_ID`) as `tags_common`, ' +
						'(SELECT `path` FROM `picture` WHERE `picture`.`user_ID` = `profile`.`user_ID` AND `picture`.`ID` = `profile`.`profil_picture`) as `picture` ' +
						'FROM `profile` ' +
						'INNER JOIN `user` ON `user`.`ID` = `profile`.`user_ID` ' +
						'WHERE ' +
						'`profile`.`ID` > ? AND ' +
						'`profile`.`user_ID` NOT IN (?) AND ' +
						'(`profile`.`user_ID` != ?) AND ' +
						'(`profile`.`gender` = "woman") AND ' +
						'(`profile`.`sexual_orientation` = "bisexual" OR `profile`.`sexual_orientation` = "heterosexual")) as `users_ids` ' +
						'ORDER BY `users_ids`.`tags_common` DESC LIMIT ?',
						[user.ID, tags, req.query.lastId, req.query.ids, user.ID, req.query.limit],
						querySuccess
					).catch(err => {
						queryFailed('Request failed:<br>' + err)
					})
				}).catch(err => {
					tool.dispError(err)
					queryFailed('Request failed')
				})
				break
			case 'homosexual':
				queryPromise.then(() => {
					tool.dbQuery(
						'SELECT * FROM (SELECT `profile`.*, `user`.`username`, ' +
						'(SELECT GROUP_CONCAT(`tag_to_user`.`tag_ID`) FROM `tag_to_user` WHERE `tag_to_user`.`user_ID` = `profile`.`user_ID`) as `tags_id`,' +
						'(SELECT COUNT(*) FROM `block` WHERE (`user_ID_destination` = `profile`.`user_ID` AND `user_ID_source` = ?)) as `block`,' +
						'(SELECT COUNT(`ID`) FROM `tag_to_user` WHERE `tag_ID` IN (?) AND `tag_to_user`.`user_ID` = `profile`.`user_ID`) as `tags_common`, ' +
						'(SELECT `path` FROM `picture` WHERE `picture`.`user_ID` = `profile`.`user_ID` AND `picture`.`ID` = `profile`.`profil_picture`) as `picture` ' +
						'FROM `profile` ' +
						'INNER JOIN `user` ON `user`.`ID` = `profile`.`user_ID` ' +
						'WHERE ' +
						'`profile`.`ID` > ? AND ' +
						'`profile`.`user_ID` NOT IN (?) AND ' +
						'(`profile`.`user_ID` != ?) AND ' +
						'(`profile`.`gender` = "man") AND ' +
						'(`profile`.`sexual_orientation` = "bisexual" OR `profile`.`sexual_orientation` = "homosexual")) as `users_ids` ' +
						'ORDER BY `users_ids`.`tags_common` DESC LIMIT ?',
						[user.ID, tags, req.query.lastId, req.query.ids, user.ID, req.query.limit],
						querySuccess
					).catch(err => {
						queryFailed('Request failed:<br>' + err)
					})
				}).catch(err => {
					tool.dispError(err)
					queryFailed('Request failed')
				})
				break
			case 'bisexual':
				queryPromise.then(() => {
					tool.dbQuery(
						'SELECT * FROM (SELECT `profile`.*, `user`.`username`, ' +
						'(SELECT GROUP_CONCAT(`tag_to_user`.`tag_ID`) FROM `tag_to_user` WHERE `tag_to_user`.`user_ID` = `profile`.`user_ID`) as `tags_id`,' +
						'(SELECT COUNT(`ID`) FROM `tag_to_user` WHERE `tag_ID` IN (?) AND `tag_to_user`.`user_ID` = `profile`.`user_ID`) as `tags_common`, ' +
						'(SELECT COUNT(*) FROM `block` WHERE (`user_ID_destination` = `profile`.`user_ID` AND `user_ID_source` = ?)) as `block`,' +
						'(SELECT `path` FROM `picture` WHERE `picture`.`user_ID` = `profile`.`user_ID` AND `picture`.`ID` = `profile`.`profil_picture`) as `picture` ' +
						'FROM `profile` ' +
						'INNER JOIN `user` ON `user`.`ID` = `profile`.`user_ID` ' +
						'WHERE ' +
						'`profile`.`ID` > ? AND ' +
						'`profile`.`user_ID` NOT IN (?) AND ' +
						'(`profile`.`user_ID` != ?) AND ' +
						'(`profile`.`sexual_orientation` = "bisexual" OR (`profile`.`sexual_orientation` = "homosexual" AND `profile`.`gender` = "man") OR (`profile`.`sexual_orientation` = "heterosexual" AND `profile`.`gender` = "woman"))) as `users_ids` ' +
						'ORDER BY `users_ids`.`tags_common` DESC LIMIT ?',
						[tags, user.ID, req.query.lastId, req.query.ids, user.ID, req.query.limit],
						querySuccess
					).catch(err => {
						queryFailed('Request failed:<br>' + err)
					})
				}).catch(err => {
					tool.dispError(err)
					queryFailed('Request failed')
				})
				break
			default:
				tool.err(res, 'Please logout and login again.2')
			}
			break
		case 'woman':
			switch (user.profile.sexual_orientation) {
			case 'heterosexual':
				queryPromise.then(() => {
					tool.dbQuery(
						'SELECT * FROM (SELECT `profile`.*, `user`.`username`, ' +
						'(SELECT GROUP_CONCAT(`tag_to_user`.`tag_ID`) FROM `tag_to_user` WHERE `tag_to_user`.`user_ID` = `profile`.`user_ID`) as `tags_id`,' +
						'(SELECT COUNT(`ID`) FROM `tag_to_user` WHERE `tag_ID` IN (?) AND `tag_to_user`.`user_ID` = `profile`.`user_ID`) as `tags_common`, ' +
						'(SELECT COUNT(*) FROM `block` WHERE (`user_ID_destination` = `profile`.`user_ID` AND `user_ID_source` = ?)) as `block`,' +
						'(SELECT `path` FROM `picture` WHERE `picture`.`user_ID` = `profile`.`user_ID` AND `picture`.`ID` = `profile`.`profil_picture`) as `picture` ' +
						'FROM `profile` ' +
						'INNER JOIN `user` ON `user`.`ID` = `profile`.`user_ID` ' +
						'WHERE ' +
						'`profile`.`ID` > ? AND ' +
						'`profile`.`user_ID` NOT IN (?) AND ' +
						'(`profile`.`user_ID` != ?) AND ' +
						'(`profile`.`gender` = "man") AND ' +
						'(`profile`.`sexual_orientation` = "bisexual" OR `profile`.`sexual_orientation` = "heterosexual")) as `users_ids` ' +
						'ORDER BY `users_ids`.`tags_common` DESC LIMIT ?',
						[tags, user.ID, req.query.lastId, req.query.ids, user.ID, req.query.limit],
						querySuccess
					).catch(err => {
						queryFailed('Request failed:<br>' + err)
					})
				}).catch(err => {
					tool.dispError(err)
					queryFailed('Request failed')
				})
				break
			case 'homosexual':
				queryPromise.then(() => {
					tool.dbQuery(
						'SELECT * FROM (SELECT `profile`.*, `user`.`username`, ' +
						'(SELECT GROUP_CONCAT(`tag_to_user`.`tag_ID`) FROM `tag_to_user` WHERE `tag_to_user`.`user_ID` = `profile`.`user_ID`) as `tags_id`,' +
						'(SELECT COUNT(`ID`) FROM `tag_to_user` WHERE `tag_ID` IN (?) AND `tag_to_user`.`user_ID` = `profile`.`user_ID`) as `tags_common`, ' +
						'(SELECT COUNT(*) FROM `block` WHERE (`user_ID_destination` = `profile`.`user_ID` AND `user_ID_source` = ?)) as `block`,' +
						'(SELECT `path` FROM `picture` WHERE `picture`.`user_ID` = `profile`.`user_ID` AND `picture`.`ID` = `profile`.`profil_picture`) as `picture` ' +
						'FROM `profile` ' +
						'INNER JOIN `user` ON `user`.`ID` = `profile`.`user_ID` ' +
						'WHERE ' +
						'`profile`.`ID` > ? AND ' +
						'`profile`.`user_ID` NOT IN (?) AND ' +
						'(`profile`.`user_ID` != ?) AND ' +
						'(`profile`.`gender` = "woman") AND ' +
						'(`profile`.`sexual_orientation` = "bisexual" OR `profile`.`sexual_orientation` = "homosexual")) as `users_ids` ' +
						'ORDER BY `users_ids`.`tags_common` DESC LIMIT ?',
						[tags, user.ID, req.query.lastId, req.query.ids, user.ID, req.query.limit],
						querySuccess
					).catch(err => {
						queryFailed('Request failed:<br>' + err)
					})
				}).catch(err => {
					tool.dispError(err)
					queryFailed('Request failed')
				})
				break
			case 'bisexual':
				queryPromise.then(() => {
					tool.dbQuery(
						'SELECT * FROM (SELECT `profile`.*, `user`.`username`, ' +
						'(SELECT COUNT(`ID`) FROM `tag_to_user` WHERE `tag_ID` IN (?) AND `tag_to_user`.`user_ID` = `profile`.`user_ID`) as `tags_common`, ' +
						'(SELECT GROUP_CONCAT(`tag_to_user`.`tag_ID`) FROM `tag_to_user` WHERE `tag_to_user`.`user_ID` = `profile`.`user_ID`) as `tags_id`,' +
						'(SELECT COUNT(*) FROM `block` WHERE (`user_ID_destination` = `profile`.`user_ID` AND `user_ID_source` = ?)) as `block`,' +
						'(SELECT `path` FROM `picture` WHERE `picture`.`user_ID` = `profile`.`user_ID` AND `picture`.`ID` = `profile`.`profil_picture`) as `picture` ' +
						'FROM `profile` ' +
						'INNER JOIN `user` ON `user`.`ID` = `profile`.`user_ID` ' +
						'WHERE ' +
						'`profile`.`ID` > ? AND ' +
						'`profile`.`user_ID` NOT IN (?) AND ' +
						'(`profile`.`user_ID` != ?) AND ' +
						'(`profile`.`sexual_orientation` = "bisexual" OR (`profile`.`sexual_orientation` = "homosexual" AND `profile`.`gender` = "woman") OR (`profile`.`sexual_orientation` = "heterosexual" AND `profile`.`gender` = "man"))) as `users_ids` ' +
						'ORDER BY `users_ids`.`tags_common` DESC LIMIT ?',
						[tags, user.ID, req.query.lastId, req.query.ids, user.ID, req.query.limit],
						querySuccess
					).catch(err => {
						queryFailed('Request failed:<br>' + err)
					})
				}).catch(err => {
					tool.dispError(err)
					queryFailed('Request failed')
				})
				break
			default:
				tool.err(res, 'Please logout and login again.1')
			}
			break
		}
	}
}

function search (req, res) {
	let user = tool.getUser(req)
	if (user === 1) tool.err(res, 'Please logout and login again.search')
	if (!req.query.lastId || req.query.lastId === undefined || isNaN(Number(req.query.lastId))) {
		req.query.lastId = 1
	} else {
		req.query.lastId = Number(req.query.lastId)
	}
	function queryFailed (msg) {
		tool.err(res, msg)
	}
	function returnUserList (response) {
		tool.suc(res, response)
	}
	if (req.query.popularity) {
		req.query.popularity = (req.query.popularity).split(',')
		req.query.popularity[0] = Number(req.query.popularity[0])
		req.query.popularity[1] = Number(req.query.popularity[1])
		if (req.query.popularity[0] > req.query.popularity[1]) {
			[req.query.popularity[0], req.query.popularity[1]] = [req.query.popularity[1], req.query.popularity[0]]
		}
	} else {
		req.query.popularity = []
	}
	req.query.popularity[0] = req.query.popularity[0] || 0
	req.query.popularity[1] = req.query.popularity[1] || 9999

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
		var coords = getCoordsRange(Number(req.query.distance), Number(req.query.coords[0]), Number(req.query.coords[1]))
	} else {
		coords = {
			minLat: -180,
			maxLat: 180,
			minLong: -180,
			maxLong: 180
		}
	}
	if (req.query.sexual_orientation) {
		req.query.sexual_orientation = (req.query.sexual_orientation).split(',')
		if (req.query.sexual_orientation[0] === 'undefined') req.query.sexual_orientation[0] = null
		if (req.query.sexual_orientation[1] === 'undefined') req.query.sexual_orientation[1] = null
		if (req.query.sexual_orientation[2] === 'undefined') req.query.sexual_orientation[2] = null
	} else {
		req.query.sexual_orientation = [null, null, null]
	}
	if (req.query.age) {
		req.query.age = (req.query.age).split(',')
		req.query.age[0] = Number(req.query.age[0])
		req.query.age[1] = Number(req.query.age[1])
		if (req.query.age[0] > req.query.age[1]) {
			[req.query.age[0], req.query.age[1]] = [req.query.age[1], req.query.age[0]]
		}
	} else {
		req.query.age = [18, 200]
	}
	req.query.popularity[0] = req.query.popularity[0] || 0
	req.query.popularity[1] = req.query.popularity[1] || 9999
	req.query.popularity[0] = req.query.popularity[0] || 0
	req.query.popularity[1] = req.query.popularity[1] || 9999
	if (req.query.gender) {
		req.query.gender = req.query.gender.split(',')
		if (req.query.gender[0] === 'undefined') req.query.gender[0] = null
		if (req.query.gender[1] === 'undefined') req.query.gender[1] = null
	} else {
		req.query.gender = [null, null]
	}
	if (!req.query.limit || isNaN(Number(req.query.limit)) || req.query.limit > 100) {
		req.query.limit = 30
	} else {
		req.query.limit = Number(req.query.limit)
	}
	if (!req.query.sort) {
		req.query.sort = ['id', 'asc']
	} else {
		// TODO why there is a tmp var ?
		let tab = req.query.sort.split('_', 2)
		req.query.sort = tab
	}
	let tags = [null]
	if (req.query.tags && req.query.tags.length > 0) {
		req.query.tags.forEach(t => tags.push(Number(t)))
	}
	if (!req.query.ids) req.query.ids = [0]
	queryPromise.then(() => {
		tool.dbQuery(
			'SELECT * FROM (SELECT `profile`.*, `user`.`username`, ' +
			'(SELECT GROUP_CONCAT(`tag_to_user`.`tag_ID`) FROM `tag_to_user` WHERE `tag_to_user`.`user_ID` = `profile`.`user_ID`) as `tags_id`, ' +
			'(SELECT COUNT(*) FROM `block` WHERE (`user_ID_destination` = `profile`.`user_ID` AND `user_ID_source` = ?)) as `block`, ' +
			'(SELECT COUNT(`ID`) FROM `tag_to_user` WHERE `tag_ID` IN (?) AND `tag_to_user`.`user_ID` = `profile`.`user_ID`) as `tags_common`, ' +
			'(SELECT `path` FROM `picture` WHERE `picture`.`user_ID` = `profile`.`user_ID` AND `picture`.`ID` = `profile`.`profil_picture`) as `picture` ' +
			'FROM `profile` ' +
			'INNER JOIN `user` ON `user`.`ID` = `profile`.`user_ID` ' +
			'WHERE ' +
			'`profile`.`ID` > ? AND ' +
			'`profile`.`user_ID` NOT IN (?) AND ' +
			'((`profile`.`age` >= ? AND `profile`.`age` <= ?) OR ? IS NULL) AND ' +
			'(`profile`.`user_ID` != ? OR ? IS NULL) AND ' +
			'(`profile`.`gender` = ? OR `profile`.`gender` = ? OR ? IS NULL) AND ' +
			'(`profile`.`sexual_orientation` = ? OR `profile`.`sexual_orientation` = ? OR `profile`.`sexual_orientation` = ? OR ? IS NULL) AND ' +
			'((`profile`.`latitude` BETWEEN ? AND ?) OR ? is NULL) AND ((`profile`.`longitude` BETWEEN ? AND ?) OR ? is NULL) AND' +
			'((`profile`.`popularity` BETWEEN ? AND ?) OR ? IS NULL)) as `users_ids` ' +
			'ORDER BY `users_ids`.`tags_common` DESC LIMIT 30',
			[user.ID, tags, req.query.lastId, req.query.ids, req.query.age[0], req.query.age[1], req.query.age[0],
				req.query.exceptID, req.query.exceptID, req.query.gender[0], req.query.gender[1], req.query.gender[0],
				req.query.sexual_orientation[0], req.query.sexual_orientation[1], req.query.sexual_orientation[2], req.query.sexual_orientation[0],
				coords.minLat, coords.maxLat, coords.maxLat, coords.minLong, coords.maxLong, coords.maxLong,
				req.query.popularity[0], req.query.popularity[1], req.query.popularity[0]],
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
	let user = []
	function queryFailed (msg) {
		tool.err(res, msg)
	}
	function profileNotFound () {
		user['valid'] = false
		res.json({'status': 1, type: 'success', 'message': 'Vous êtes désormais connecté.', 'token': jwt.sign({user, exp: Math.floor(Date.now() / 1000) + ((60 * 60) * 24)}, 'demo')})
	}
	function profileFound (response) {
		if (response.length === 0 || response[0].ID === null) {
			user['valid'] = false
		} else {
			user['valid'] = true
			user['profile'] = []
			user['profile'] = response[0]
		}
		res.json({'status': 1, type: 'success', 'message': 'Vous êtes désormais connecté.', 'token': jwt.sign({user, exp: Math.floor(Date.now() / 1000) + ((60 * 60) * 24)}, 'demo')})
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
			user = response[0]
			tool.dbQuery(
				'SELECT `profile`.*, ' +
				'(SELECT GROUP_CONCAT(`tag_to_user`.`tag_ID`) FROM `tag_to_user` WHERE `tag_to_user`.`user_ID` = `profile`.`user_ID`) as `tags_id` ' +
				'FROM `profile` ' +
				'WHERE `profile`.`user_ID` = ?',
				[response[0].ID],
				profileFound
			).catch(err => {
				profileNotFound(err)
			})
		})
	}

	let param = req.body[0]
	if (!param || (tool.checkUsername(param.login) && tool.checkMail(param.login)) || tool.checkPassword(param.password)) {
		return queryFailed('Wrong data sent')
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
	let user = tool.getUser(req)
	if (user === 1) tool.err(res, 'Please logout and login again.profile')
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
			'SELECT `user`.*, ' +
			'`profile`.*, ' +
			'(SELECT COUNT(*) FROM `like` WHERE `user_ID_source` = ? AND `user_ID_destination` = `user`.`ID`) as already_like, ' + // TODO select specific columns TODO check if I block
			'(SELECT COUNT(*) FROM `like` WHERE `user_ID_source` = `user`.`ID` AND `user_ID_destination` = ?) as like_me, ' + // TODO select specific columns TODO check if I block
			'(SELECT COUNT(*) FROM `block` WHERE `user_ID_source` = ? AND `user_ID_destination` = `user`.`ID`) as blocked, ' + // TODO select specific columns TODO check if I block
			'(SELECT GROUP_CONCAT(`tag_to_user`.`tag_ID`) FROM `tag_to_user` WHERE `tag_to_user`.`user_ID` = `profile`.`user_ID`) as `tags_id`,' +
			'(SELECT GROUP_CONCAT(`picture`.`path`) FROM `picture` WHERE `picture`.`user_ID` = `profile`.`user_ID`) as `pictures`,' +
			'(SELECT GROUP_CONCAT(`tag`.`content`) FROM `tag` INNER JOIN `tag_to_user` ON `tag_to_user`.`tag_id` = `tag`.`id` WHERE `tag_to_user`.`user_ID` = `profile`.`user_ID`) as `tags` ' +
			'FROM `user` ' +
			'INNER JOIN `profile` ON `profile`.`user_ID` = `user`.`ID` ' +
			'WHERE `username` = ? OR `user`.`ID` = ?',
			[user.ID, user.ID, user.ID, req.params.username, req.params.username],
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
	if (user === 1) tool.err(res, 'Please logout and login again.update account')
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
			let newUser = req.body[0]
			newUser.ID = user.ID
			newUser.password = hash
			delete newUser.passwordConfirm
			res.json({'status': 1, type: 'success', 'message': 'Your informations are update.', 'token': jwt.sign({user: newUser, exp: Math.floor(Date.now() / 1000) + ((60 * 60) * 24)}, 'demo')})
			// tool.suc(res, 'Informations successfully updated')
			// TODO update server value for user and next rqt
		}
	}
	queryPromise.then(() => {
		tool.dbQuery(
			'UPDATE `user` ' +
			'SET `first_name` = ?, `last_name` = ?, `password` = ?, `email` = ? ' +
			'WHERE `username` = ?',
			[req.body[0].first_name, req.body[0].last_name, hash, req.body[0].email, user.username],
			querySuccess
		).catch(err => {
			queryFailed('Request failed:<br>' + err)
		})
	}).catch(err => {
		tool.dispError(err)
		queryFailed()
	})
}

function updateUserProfile (req, res) {
	let user = tool.getUser(req)
	if (user === 1) tool.err(res, 'Please logout and login again.')
	function queryFailed () {
		tool.err(res, 'An error occured... Your account cannot be updated')
	}
	function querySuccess (response) {
		user.valid = true
		param.tags_id = ''
		if (response.length > 0) {
			param.tags_id = response.map(o => o.tag_ID).join(',')
		} else {
			param.tags_id = '0'
		}
		user.profile = param
		res.json({'status': 1, 'type': 'success', 'message': 'Account successfully updated', 'token': jwt.sign({user, exp: Math.floor(Date.now() / 1000) + ((60 * 60) * 24)}, 'demo')})
	}
	function querySuccessTags () {
		tool.dbQuery(
			'SELECT `tag_ID` FROM `tag_to_user` ' +
			'WHERE `user_ID` = ?',
			[user.ID],
			querySuccess
		).catch(err => {
			queryFailed('Request failed:<br>' + err)
		})
	}
	function createMissingTags () {
		let count = 0
		function createTagsLinks () {
			count += 1
			if (count > param.tags.length) {
				querySuccessTags()
			} else {
				tool.dbQuery(
					'SELECT id into @tid from `tag` where `content` = ?; ' +
					'INSERT IGNORE INTO `tag_to_user` (`user_ID`, `tag_ID`) ' + // TODO approve this ignore key word
					'VALUES (?, @tid)',
					[param.tags[count - 1], user.ID],
					createTagsLinks
				).catch(err => {
					queryFailed('Request failed:<br>' + err)
				})
			}
		}
		let toto = []
		param.tags.forEach(function (entry) {
			toto.push([entry])
		})
		tool.dbQuery(
			'INSERT IGNORE INTO `tag` (`content`) ' + // TODO approve this ignore key word
			'VALUES ?',
			[toto],
			createTagsLinks
		).catch(err => {
			queryFailed('Request failed:<br>' + err)
		})
	}
	function insertProfile (response) {
		if (response === undefined || response.length === 0 || response['affectedRows'] === 0) {
			tool.dbQuery(
				'DELETE FROM `tag_to_user` WHERE `user_ID` = ?; ' +
				'INSERT INTO `profile` (`age`, `gender`, `biography`, `sexual_orientation`, `latitude`, `longitude`, `range`, `user_ID`, `profil_picture`) ' +
				'VALUES (?, ?, ?, ?, ?, ?, ?, ?, (SELECT `ID` FROM `picture` WHERE `user_ID` = ? ORDER BY `ID` ASC LIMIT 1))', // TODO ON DUPPLICATE KEY UPDATE?
				[user.ID, param.age, param.gender, param.biography, param.sexual_orientation, Number(param.latitude), Number(param.longitude), param.range, user.ID, user.ID],
				createMissingTags
			).catch(err => {
				queryFailed('Request failed:<br>' + err)
			})
		} else {
			tool.dbQuery(
				'DELETE FROM `tag_to_user` WHERE `user_ID` = ?; ' +
				'UPDATE `profile` ' +
				'SET `age` = ?, `gender` = ?, `biography` = ?, `sexual_orientation` = ?, `latitude` = ?, `longitude` = ?, `range` = ? ' +
				'WHERE `user_ID` = ?',
				[user.ID, param.age, param.gender, param.biography, param.sexual_orientation, Number(param.latitude), Number(param.longitude), param.range, user.ID],
				createMissingTags // TODO also delete tag from tag_to_user if delete by user
			).catch(err => {
				queryFailed('Request failed:<br>' + err)
			})
		}
	}
	let param = req.body[0]
	param.popularity = (!user.profile || user.profile.popularity === undefined) ? 5000 : user.profile.popularity
	if (!param || tool.checkTag(param.tags) || tool.checkAge(param.age) || tool.checkGender(param.gender) || tool.checkBio(param.biography) || tool.checkOrientationSexe(param.sexual_orientation)) { // TODO check longitude / latitude + check range
		return queryFailed('Wrong data sent')
	}
	queryPromise.then(() => {
		tool.dbQuery(
			'SELECT * FROM `profile` ' +
			'WHERE `user_ID` = ?',
			[user.ID],
			insertProfile
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

function getTags (req, res) {
	function queryFailed () {
		tool.err(res, 'An error occured... No tags found')
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
			'SELECT * FROM `tag`',
			null,
			querySuccess
		).catch(err => {
			queryFailed('Request failed:<br>' + err)
		})
	}).catch(err => {
		tool.dispError(err)
		queryFailed()
	})
}

function getHistory (req, res) {
	let user = tool.getUser(req)
	if (user === 1) tool.err(res, 'Please logout and login again.')
	function queryFailed () {
		tool.err(res, 'An error occured... Your history can\'t be loaded')
	}
	function querySuccess (response) {
		tool.suc(res, response)
	}// TODO when insert notification, created_at is not set at actual date
	queryPromise.then(() => {
		tool.dbQuery(
			'SELECT * FROM `notification` ' +//TODO insert the user_ID who send notification to make a button and go to his profile
			'WHERE `user_ID` = ? AND `type` = "visit"',
			[user.ID],
			querySuccess
		).catch(err => {
			queryFailed('Request failed:<br>' + err)
		})
	}).catch(err => {
		tool.dispError(err)
		queryFailed()
	})
}

function getNotifications (req, res) {
	let user = tool.getUser(req)
	if (user === 1) tool.err(res, 'Please logout and login again.')
	function queryFailed () {
		tool.err(res, 'An error occured... Your notifications can\'t be loaded')
	}
	function querySuccess (response) {
		tool.suc(res, response)
	}// TODO when insert notification, created_at is not set at actual date
	queryPromise.then(() => {
		tool.dbQuery(
			'SELECT *, GROUP_CONCAT(`type`), COUNT(`type`) FROM `notification` ' +//TODO insert the user_ID who send notification to make a button and go to his profile
			'WHERE `user_ID` = ? ' +
			'GROUP BY `ID` ORDER BY id DESC',
			[user.ID],
			querySuccess
		).catch(err => {
			queryFailed('Request failed:<br>' + err)
		})
	}).catch(err => {
		tool.dispError(err)
		queryFailed()
	})
}

function forgetPassword (req, res) {
	function queryFailed (msg) {
		tool.err(res, msg)
	}

	function createToken (response) {
		if (response === undefined || response.length !== 1) {
			queryFailed('Failed to execute request')
		}
		let hash = bcrypt.hashSync(Date.now() + param.username, 10).replace(/\//g, '') // Async is useless in a already async function
		function sendMail () {
			let link = 'http://localhost:8080/reset/' + encodeURI(hash) // TODO not localhost
			let mail = {
				from: 'meeting@matcha.fr',
				to: response[0].email,
				subject: 'Réinitialiser votre mot de passe !',
				html:
				'<h1>Vous avez oublié votre mot de passe ?</h1>' +
				'<p>Vous pouvez le réinitialiser ici:</p><br>' +
				'<a href="' + link + '">Reset</a>' +
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
					res.json({'status': 1, type: 'success', 'message': 'Vous allez recevoir un email afin de réinitialiser votre mot de passe'})
				}
			})
		}
		tool.dbQuery(
			'DELETE FROM `token` ' +
			'WHERE `user_ID` = ? ;' +
			'INSERT INTO `token` (`user_ID`, `token`) ' +
			'VALUES (?, ?)',
			[response[0].ID, response[0].ID, hash],
			sendMail
		).catch(err => {
			queryFailed('Request failed:<br>' + err)
		})
	}

	function processNewUser (response) {
		if (response === undefined) {
			queryFailed('Failed to execute request')
		}
		if (response.length !== 0) {
			tool.dbQuery(
				'SELECT * FROM `user` WHERE `username` = ?',
				[param.username],
				createToken
			).catch(err => {
				queryFailed('Request failed:<br>' + err)
			})
		} else {
			res.json({'status': 0, type: 'error', 'message': 'Votre compte est introuvable'})
		}
	}

	let param = req.body[0]
	if (!param || tool.checkUsername(param.username)) {
		return queryFailed('Wrong data sent')
	}
	queryPromise.then(() =>{
		tool.dbQuery(
			'SELECT * ' + // TODO replace * by specific fields
			'FROM `user`' +
			'WHERE `username` = ?',
			[param.username],
			processNewUser
		).catch(err => {
			queryFailed('Request failed:<br>' + err)
		})
	}).catch(err => {
		tool.dispError(err)
		queryFailed('Request failed')
	})
} // TODO need to finish it

module.exports = {
	index: suggestions,
	create: insertNewUser,
	login: logIn,
	forget: forgetPassword,
	history: getHistory,
	search: search,
	notifications: getNotifications,
	read: getMyUserProfile,
	update: updateMyUserAccount,
	updateAccount: updateUserProfile,
	getTags: getTags,
	delete: deleteMyAccount
}
