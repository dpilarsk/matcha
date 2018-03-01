const	mysql		=	require('mysql2'),
	bcrypt		=	require('bcrypt'),
	path	=	require('path'),
	jwt			=	require('jsonwebtoken'),
	moment		=	require('moment'),
	nodemailer	=	require('nodemailer'),
	db			=	require(__dirname + '/../resources/db.js'),
	message		=	require(__dirname + '/../resources/utils.js'),
	connection	=	mysql.createConnection({
		host: db.cred().host,
		user: db.cred().user,
		password: db.cred().password
	})

let connectionPromise = new Promise(function(resolve, reject) {
	connection.connect(err => {
		if (err)
			reject(err)
		else
			message.success('Connexion au serveur MySQL réussie.')
		resolve()
	})
});

let transporter = nodemailer.createTransport({
	host: 'smtp.mailtrap.io',
	port: 2525,
	auth: {
		user: 'd4119f6ed6c5a1',
		pass: '8ac2d72a7253e3'
	}
})

connectionPromise.then(() => {
	connection.query('USE matcha', (err) => {
		if (err)
		{
			message.error('Impossible d\'accéder a la bdd')
			return
		}
	})
})

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

exports.index	=	(req, res) => {
	connectionPromise
		.then(() => {
			if (req.query.pop) req.query.pop = (req.query.pop).split(',')
			else req.query.pop = []
			req.query.pop[0] = req.query.pop[0] || 0
			req.query.pop[1] = req.query.pop[1] || 9999

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

			if (req.query.sexual_orientation) req.query.sexual_orientation = (req.query.sexual_orientation[0]).split(',')
			else req.query.sexual_orientation = []
			req.query.sexual_orientation[0] = req.query.sexual_orientation[0] === undefined ? undefined : 'heterosexual'
			req.query.sexual_orientation[1] = req.query.sexual_orientation[1] === undefined ? undefined : 'bisexual'
			req.query.sexual_orientation[2] = req.query.sexual_orientation[2] === undefined ? undefined : 'homosexual'

			if (!req.query.limit || isNaN(Number(req.query.limit)) || req.query.limit > 100) req.query.limit = 30
			else req.query.limit = Number(req.query.limit)

			if (!req.query.page || isNaN(Number(req.query.page))) req.query.page = 0
			else req.query.page = Number(req.query.page) - 1

			if (!req.query.sort) req.query.sort = ['id', 'asc']
			else {
				let tab = req.query.sort.split('_', 2)
				req.query.sort = tab
			}

			let request = 'SELECT * FROM user WHERE (gender = ? OR ? IS NULL) AND ' +
				'(sexual_orientation = ? OR sexual_orientation = ? OR sexual_orientation = ? OR ? IS NULL)' +
				'AND ((popularity BETWEEN ? AND ?) OR ? IS NULL) AND ((latitude BETWEEN ? AND ?) OR ? is NULL) AND ((longitude BETWEEN ? AND ?) OR ? is NULL) ORDER BY ' + req.query.sort[0] + ' ' + req.query.sort[1] + ' LIMIT ? OFFSET ?'
			connection.query(request, [req.query.gender, req.query.gender,
				req.query.sexual_orientation[0], req.query.sexual_orientation[1], req.query.sexual_orientation[2], req.query.sexual_orientation[0],
				req.query.pop[0], req.query.pop[1], req.query.pop[0], coords.minLat, coords.maxLat, coords.maxLat, coords.minLong, coords.maxLong, coords.maxLong, req.query.limit, req.query.page * req.query.limit], (err, response, fields) => {
					if (err) {
						message.error(err)
						res.json({'status': 0})
					} else res.json({'status': 1, 'users': response})
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
		|| (!req.body[0].password || (req.body[0].password).match('^(?=.*[A-Z])(?=.*\\d)(?=.*[$@$!%*?&])[A-Za-z\\d$@$!%*?&]') === null))
		res.json({'status': 0, type: 'error', 'message': 'Un des champs est manquant ou erroné.'})
	else
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

exports.login	=	(req, res) => {
	if (!req.body[0] || !req.body[0].login || !req.body[0].password)
		res.json({'status': 0, type: 'error', 'message': 'Une erreur est survenue.'})
	else
		connectionPromise.then(() => {
			connection.query('SELECT id, password, username, first_name, last_name, age, gender, biography, sexual_orientation, email, latitude, longitude, max_distance, popularity FROM user WHERE username = ? AND status = 1', [req.body[0].login], (err, result) => {
				if (err)
				{
					message.error(err)
					res.json({'status': 0, type: 'error', 'message': 'Une erreur est survenue.'})
				}
				else if (result.length === 0)
					res.json({'status': 0, type: 'error', 'message': 'Votre compte est introuvable ou n\'est pas encore validé !'})
				else
				{
					bcrypt.compare(req.body[0].password, result[0].password, (err, res1) => {
						if (!res1) res.json({'status': 0, type: 'error', 'message': 'Le mot de passe est incorrect.'})
						else
						{
							connection.query('UPDATE user SET connected = 1 WHERE username = ? AND password = ?', [req.body[0].login, result[0].password], (err, result1) => {
								if (err)
								{
									message.error(err)
									res.json({'status': 0, type: 'error', 'message': 'Une erreur est survenue, nous ne parvenons pas à vous connecter.'})
								}
								else
								{
									res.json({'status': 1, type: 'success', 'message': 'Vous êtes désormais connecté.', token: jwt.sign({user: result[0], exp: Math.floor(Date.now() / 1000) + ((60 * 60) * 24),}, 'demo')})
								}
							})
						}
					})
				}
			})
		})
			.catch(e => {
				message.error(err)
				res.json({'status': 0, type: 'error', 'message': 'Une erreur est survenue.'})
			})
}

exports.read	=	(req, res) => {
	connectionPromise
		.then(() => {
			connection.query('SELECT * FROM user WHERE username = ? XOR id = ?', [req.params.username, req.params.username], (err, response) => {
				if (err || response.length === 0)
				{
					message.error(err)
					res.json({'status': 0})
				}
				else
					res.json({'status': 1, 'user': response})
			})
		})
		.catch(err => {
			message.error('Connexion au serveur MySQL échouée:\n' + err)
			res.json({'status': 0})
		})
}

exports.update	=	(req, res) => {
	connectionPromise
		.then(() => {
			let request = 'UPDATE user SET password = ?, latitude = ?, longitude = ?, max_distance = ? WHERE username = ?'
			connection.query(request, [req.params.password, req.params.latitude, req.params.longitude, req.params.max_distance, req.params.username], (err, response) => {
				if (err || response.length === 0)
				{
					message.error(err)
					res.sendStatus(404).json({'status': 0})
				}
				else
					res.json({'status': 1})
			})
		})
		.catch(err => {
			message.error('Connexion au serveur MySQL échouée:\n' + err)
			res.sendStatus(404).json({'status': 0})
		})
}

exports.delete	=	(req, res) => {
	connectionPromise
		.then(() =>
			connection.query('DELETE FROM user WHERE username = ? XOR id = ?', [req.params.username, req.params.username], (err, response) => {
				if (err || response.length === 0 || response['affectedRows'] === 0)
				{
					res.json({'status': 0})
				}
				else
					res.json({'status': 1})
			})
		)
		.catch(err => {
			message.error('Connexion au serveur MySQL échouée:\n' + err)
			res.json({'status': 0})
		})
}
