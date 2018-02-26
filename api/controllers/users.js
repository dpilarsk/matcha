const path		=	require('path'),
	tool		=	require(path.join(__dirname, '..', 'tools.js'))

let queryPromise = tool.dbLink()

// TODO same for adding profile
function insertNewUser (req, res) {
	function queryFailed (msg) {
		tool.err(res, msg)
	}

	function alreadyPresent (response) {
		let msg = 'Cannot create user:\n'
		let index = 0
		while (index < response.length) {
			if (param.username === response[index].username) {
				msg = msg + 'Username \'' + param.username + '\' is already used\n'
			}
			if (param.email === response[index].email) {
				msg = msg + 'Email \'' + param.email + '\' is already used\n'
			}
			index += 1
		}
		queryFailed(msg) // TODO check if msg formating is good
	}

	function sendMail () {
		bcrypt.hash(Date.now() + param.username, 10, function (err, token) {
			if (err) return queryFailed('Wrong data sent')
			let token1 = encodeURI(token) // token.split('/').join('').split('.').join('')
			let mail = {
				from: 'meeting@matcha.fr',
				to: param.email,
				subject: 'Confirmer votre compte sur Matcha !',
				html:
				'<h1>Bienvenue sur Matcha</h1>' +
				'<p>Veuillez confirmer votre compte en cliquant juste en dessous.</p><br>' +
				'<a href="http://localhost:8080/confirm/' + token1 + '">Valider mon compte</a>'// TODO not localhost
			}
			transporter.sendMail(mail, (err, info) => {
				if (err) {
					message.error(err)
					res.json({'status': 0, type: 'error', 'message': 'Une erreur est survenue durant l\'envoi de l\'email.'})
				} else {
					res.json({'status': 1, type: 'success', 'message': 'Votre compte à bien été crée, veuillez consulter votre boite mail.'})
				}
			})
		})
	}

	function processNewUser (response) {
		if (response === undefined && response.length !== 0) {
			return alreadyPresent(response)
		}
		let hash = bcrypt.hashSync(param.password, 10) // Async is useless in a already async function
		queryPromise.then(() => {
			tool.dbQuery(
				'INSERT INTO `user` (`username`, `first_name`, `last_name`, `password`, `email`)' +
				'VALUES (?, ?, ?, ?, ?)',
				[param.username, param.firstName, param.lastName, hash, param.email],
				sendMail
			)
		}).catch(err => {
			tool.dispError(err)
			queryFailed('Request failed')
		})

		// bcrypt.genSalt(10, function (err, salt) {
		// 	if (err) return queryFailed('Wrong data sent')
		// 	bcrypt.hash(param.password, salt, function (err, hash) {
		// 		if (err) return queryFailed('Wrong data sent')
		// 		queryPromise.then(() => {
		// 			tool.dbQuery(
		// 				'INSERT INTO `user` (`username`, `first_name`, `last_name`, `password`, `email`)' +
		// 				'VALUES (?, ?, ?, ?, ?)',
		// 				[param.username, param.firstName, param.lastName, hash, param.email],
		// 				sendMail
		// 			)
		// 		}).catch(err => {
		// 			tool.dispError(err)
		// 			queryFailed('Request failed')
		// 		})
		// 	})
		// })
	}

	let param = req.body[0]
	if (!param || (tool.checkUsername(param.username) && tool.checkMail(param.email)) || tool.checkPassword(param.password) || tool.checkName(param.firstName) || tool.checkName(param.lastName)) {
		return queryFailed('Wrong data sent')
	}
	queryPromise.then(() => {
		tool.dbQuery(
			'SELECT * ' + // TODO replace * by specific fields
			'FROM `user`' +
			'WHERE `username` = ? OR `email` = ?',
			[param.username, param.email],
			processNewUser
		)
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
			'INNER JOIN `profile` ON `profile`.`user_ID` = `user`.`ID` ' +
			'INNER JOIN `picture` ON `picture`.`user_ID` = `user`.`ID` ' +
			'WHERE `username` = ? XOR `email` = ?',
			[param.login, param.login],
			processLogin
		)
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
		)
	}).catch(err => {
		tool.dispError(err)
		queryFailed()
	})
}

function updateMyUserAccount (req, res) {
	// TODO profile update
	// TODO check params
	function queryFailed () {
		tool.err(res, 'An error occured... Your account cannot be updated')
	}
	function querySuccess (response) {
		if (response === undefined || response.length === 0 || response['affectedRows'] === 0) {
			queryFailed()
		} else {
			tool.suc(res, 'Account successfully updated')
			// TODO update server value for user and next rqt
		}
	}
	queryPromise.then(() => {
		tool.dbQuery(
			'UPDATE `user` ' +
			'SET `username` = ?, `password` = ?, `email` = ?' +
			'WHERE `username` = ?',
			[req.params.username, req.params.password, req.params.email, req.params.username], // TODO BODY not params
			querySuccess
		)
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
		)
	}).catch(err => {
		tool.dispError(err)
		queryFailed()
	})
}

module.exports = {
	create: insertNewUser,
	login: logIn,
	read: getMyUserProfile,
	update: updateMyUserAccount,
	delete: deleteMyAccount
}

const	mysql		=	require('mysql2'),
	bcrypt			=	require('bcrypt'),
	jwt				=	require('jsonwebtoken'),
	// moment		=	require('moment'),
	nodemailer		=	require('nodemailer'),
	db				=	require(path.join(__dirname, '..', 'resources', 'db.js')),
	message			=	require(path.join(__dirname, '..', 'resources', 'utils.js')),
	connection		=	mysql.createConnection({
		host: db.cred().host,
		user: db.cred().user,
		password: db.cred().password
	})

// TODO Tools here
let connectionPromise = new Promise(function (resolve, reject) {_
	connection.connect(err => {
		if (err) {
			reject(err)
		} else {
			message.success('Connexion au serveur MySQL réussie.')
		}
		resolve()
	})
})

let transporter = nodemailer.createTransport({
	port: 1025,	
	ignoreTLS: true
})

connectionPromise.then(() => {
	connection.query('USE matcha', (err) => {
		if (err) {
			message.error('Impossible d\'accéder a la bdd')
			// return
			// TODO WHY THIS SHIT HAPPEND >>> si pas de bdd, ne devrait t-on pas exit violemment car ca veut dire catastrophe sur le serveur ? le return ne return nul part
		}
	})
})

exports.index	=	(req, res) => {
	connectionPromise
		.then(() => {
			if (req.query.pop) {
				req.query.pop = (req.query.pop[0]).split(',')
			} else {
				req.query.pop = []
			}
			req.query.pop[0] = req.query.pop[0] || 0
			req.query.pop[1] = req.query.pop[1] || 9999

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

			let request = 'SELECT * FROM user WHERE (gender = ? OR ? IS NULL) AND ' +
				'(sexual_orientation = ? OR sexual_orientation = ? OR sexual_orientation = ? OR ? IS NULL)' +
				'AND ((popularity BETWEEN ? AND ?) OR ? IS NULL) ORDER BY ' + req.query.sort[0] + ' ' + req.query.sort[1] + ' LIMIT ? OFFSET ?'
			connection.query(request, [req.query.gender, req.query.gender,
				req.query.sexual_orientation[0], req.query.sexual_orientation[1], req.query.sexual_orientation[2], req.query.sexual_orientation[0],
				req.query.pop[0], req.query.pop[1], req.query.pop[0], req.query.limit, req.query.page * req.query.limit], (err, response, fields) => {
					if (err) {
						message.error(err)
						res.json({'status': 0})
					} else {
						res.json({'status': 1, 'users': response})
					}
				})
		})
		.catch(err => {
			message.error('Un probleme est survenu:\n' + err)
			res.json({'status': 0})
		})
}

exports.create	=	(req, res) => {
	if (!req.body[0] || !req.body[0].first_name || !req.body[0].last_name
		|| !req.body[0].username ||(!req.body[0].email || (req.body[0].email.match('^[a-zA-Z0-9.!#$%&\'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$') === null)) || (!req.body[0].age || req.body[0].age < 18 || req.body[0].age > 99)
		|| !req.body[0].gender || !req.body[0].orientation
		|| (!req.body[0].password || (req.body[0].password).match('^(?=.*[A-Z])(?=.*\\d)(?=.*[$@$!%*?&])[A-Za-z\\d$@$!%*?&]') === null)) {
		res.json({'status': 0, type: 'error', 'message': 'Un des champs est manquant ou erroné.'})
	} else {
		connectionPromise.then(() => {
			connection.query('SELECT username, email FROM user WHERE username = ? OR email = ?', [req.body[0].username, req.body[0].email], (err, response) => {
				if (err) {
					message.error(err)
					res.json({'status': 0, type: 'error', 'message': 'Une erreur est survenue.'})
				}
				else if (response.length !== 0) res.json({'status': 0, type: 'error', 'message': 'Le nom d\'utilisateur ou l\'email est déjà utilisé.'})
				else
				{
					bcrypt.genSalt(10, function(err, salt) {
						bcrypt.hash(req.body[0].password, salt, function(err, hash) {
							bcrypt.hash(Date.now() + req.body[0].username, 10, function(err, token) {
								let pass = hash
								let token1 = token.split('/').join('').split('.').join('')
								connection.query('INSERT INTO user (first_name, last_name, username, email, password, age, gender, sexual_orientation, latitude, longitude, token) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
									[req.body[0].first_name, req.body[0].last_name, req.body[0].username, req.body[0].email, pass, req.body[0].age, req.body[0].gender, req.body[0].orientation, req.body[0].currentLat,
										req.body[0].currentLon, token1], (err, result) => {
											if (err) {
												message.error(err)
												res.json({'status': 0, type: 'error', 'message': 'Une erreur est survenue.'})
											}
											else {
												let mail = {
													from: 'meeting@matcha.fr',
													to: req.body[0].email,
													subject: 'Confirmer votre compte sur Matcha !',
													html:
													'<h1>Bienvenue sur Matcha</h1>' +
													'<p>Veuillez confirmer votre compte en cliquant juste en dessous.</p><br>' +
													'<a href="http://localhost:8080/confirm/' + token1 + '">Valider mon compte</a>'
												}
												transporter.sendMail(mail, (error, info) => {
													if (err)
													{
														message.error(err)
														res.json({'status': 0, type: 'error', 'message': 'Une erreur est survenue durant l\'envoi de l\'email.'})
													}
													else
														res.json({'status': 1, type: 'success', 'message': 'Votre compte à bien été crée, veuillez consulter votre boite mail.'})
												})
											}
										})
							})
						})
					})
				}
			})
		})
			.catch(err => {
				message.error('Connexion au serveur MySQL échouée:\n' + err)
				res.json({'status': 0})
			})
	}
}

// exports.login	=	(req, res) => {
// 	if (!req.body[0] || !req.body[0].login || !req.body[0].password)
// 		res.json({'status': 0, type: 'error', 'message': 'Une erreur est survenue.'})
// 	else
// 		connectionPromise.then(() => {
// 			connection.query('SELECT id, password, username, first_name, last_name, age, gender, biography, sexual_orientation, email, latitude, longitude, max_distance, popularity FROM user WHERE username = ? AND status = 1', [req.body[0].login], (err, result) => {
// 				if (err)
// 				{
// 					message.error(err)
// 					res.json({'status': 0, type: 'error', 'message': 'Une erreur est survenue.'})
// 				}
// 				else if (result.length === 0)
// 					res.json({'status': 0, type: 'error', 'message': 'Votre compte est introuvable ou n\'est pas encore validé !'})
// 				else
// 				{
// 					bcrypt.compare(req.body[0].password, result[0].password, (err, res1) => {
// 						if (!res1) res.json({'status': 0, type: 'error', 'message': 'Le mot de passe est incorrect.'})
// 						else
// 						{
// 							connection.query('UPDATE user SET connected = 1 WHERE username = ? AND password = ?', [req.body[0].login, result[0].password], (err, result1) => {
// 								if (err)
// 								{
// 									message.error(err)
// 									res.json({'status': 0, type: 'error', 'message': 'Une erreur est survenue, nous ne parvenons pas à vous connecter.'})
// 								}
// 								else
// 								{
// 									res.json({'status': 1, type: 'success', 'message': 'Vous êtes désormais connecté.', token: jwt.sign({user: result[0], exp: Math.floor(Date.now() / 1000) + ((60 * 60) * 24),}, 'demo')})
// 								}
// 							})
// 						}
// 					})
// 				}
// 			})
// 		})
// 			.catch(e => {
// 				message.error(err)
// 				res.json({'status': 0, type: 'error', 'message': 'Une erreur est survenue.'})
// 			})
// }

// exports.read	=	(req, res) => {
// 	connectionPromise
// 		.then(() => {
// 			connection.query('SELECT * FROM user WHERE username = ? XOR id = ?', [req.params.username, req.params.username], (err, response) => {
// 				if (err || response.length === 0)
// 				{
// 					message.error(err)
// 					res.json({'status': 0})
// 				}
// 				else
// 					res.json({'status': 1, 'user': response})
// 			})
// 		})
// 		.catch(err => {
// 			message.error('Connexion au serveur MySQL échouée:\n' + err)
// 			res.json({'status': 0})
// 		})
// }

// exports.update	=	(req, res) => {
// 	connectionPromise
// 		.then(() => {
// 			let request = 'UPDATE user SET password = ?, latitude = ?, longitude = ?, max_distance = ? WHERE username = ?'
// 			connection.query(request, [req.params.password, req.params.latitude, req.params.longitude, req.params.max_distance, req.params.username], (err, response) => {
// 				if (err || response.length === 0)
// 				{
// 					message.error(err)
// 					res.sendStatus(404).json({'status': 0})
// 				}
// 				else
// 					res.json({'status': 1})
// 			})
// 		})
// 		.catch(err => {
// 			message.error('Connexion au serveur MySQL échouée:\n' + err)
// 			res.sendStatus(404).json({'status': 0})
// 		})
// }

// exports.delete	=	(req, res) => {
// 	connectionPromise
// 		.then(() =>
// 			connection.query('DELETE FROM user WHERE username = ? XOR id = ?', [req.params.username, req.params.username], (err, response) => {
// 				if (err || response.length === 0 || response['affectedRows'] === 0)
// 				{
// 					res.json({'status': 0})
// 				}
// 				else
// 					res.json({'status': 1})
// 			})
// 		)
// 		.catch(err => {
// 			message.error('Connexion au serveur MySQL échouée:\n' + err)
// 			res.json({'status': 0})
// 		})
// }
