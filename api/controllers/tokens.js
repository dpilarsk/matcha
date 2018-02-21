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

exports.read	=	(req, res) => {
	connectionPromise
		.then(() =>
			connection.query('SELECT * FROM user WHERE token = ? AND status = 0', [req.params.token], (err, response) => {
				if (err || response.length === 0 || response.length !== 1) res.json({'status': 0, type: 'error', 'message': 'Une erreur est survenue, nous ne parvenons pas à valider votre compte.'})
				else {
					connection.query('UPDATE user SET status = 1 WHERE id = ?', [response[0].id], (err, response) => {
						if (err) res.json({'status': 0, type: 'error', 'message': 'Une erreur est survenue, nous ne parvenons pas à valider votre compte.'})
						else res.json({'status': 1, type: 'success', 'message': 'Votre compte est désormais validé, vous pouvez à présent vous connecter.'})
					})
				}
			})
		)
		.catch(err => {
			message.error('Connexion au serveur MySQL échouée:\n' + err)
			res.json({'status': 0})
		})
}
