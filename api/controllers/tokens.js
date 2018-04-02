const path		=	require('path'),
	bcrypt		=	require('bcrypt'),
	tool		=	require(path.join(__dirname, '..', 'tools.js')),
	nodemailer	=	require('nodemailer')


let queryPromise = tool.dbLink()
let transporter = nodemailer.createTransport({
	port: 1025,
	ignoreTLS: true
})
exports.read	=	(req, res) => {
	function wrongToken (msg) {
		tool.err(res, 'An error occured... Your account cannot be verified:<br>' + msg)
	}
	function alreadyToken () {
		tool.err(res, 'Your account was already verified. Please proceed to log in')
	}
	function validToken () {
		tool.suc(res, 'Your account has been verified. You can now proceed to log in')
	}
	function checkToken (response) {
		if (response === undefined || response.length === 0 || response.length !== 1) {
			wrongToken()
		} else if (response[0].status) {
			alreadyToken()
		} else {
			tool.dbQuery(
				'UPDATE `user` ' +
				'SET `status` = 1 ' +
				'WHERE `ID` = ?',
				response[0].ID,
				validToken
			).catch(err => {
				wrongToken(err)
			})
		}
	}
	queryPromise.then(() => {
		tool.dbQuery(
			'SELECT `user`.`ID`, `user`.`status` ' +
			'FROM `user` ' +
			'INNER JOIN `token` ON `token`.`user_ID` = `user`.`ID` ' +
			'WHERE `token` = ?',
			[req.params.token],
			checkToken
		).catch(err => {
			wrongToken(err)
		})
	})
}

exports.update	=	(req, res) => {
	let email = ''
	let pass = ''
	function sendMail () {
		let mail = {
			from: 'meeting@matcha.fr',
			to: email,
			subject: 'Nouveau mot de passe !',
			html:
			'<h1>Vous avez oublié votre mot de passe ?</h1>' +
			'<p>Voici le nouveau, changez le vite:</p><br>' +
			'<p>' + pass + '</p>' +
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
	function wrongToken (msg) {
		tool.err(res, 'An error occured... Your account cannot be verified:<br>' + msg)
	}
	function alreadyToken () {
		tool.err(res, 'Your account was already verified. Please proceed to log in')
	}
	function validToken () {
		sendMail()
		tool.suc(res, 'Un nouveau mot de passe vous a été envoyé.')
	}
	function checkToken (response) {
		if (response === undefined || response.length === 0 || response.length !== 1) {
			wrongToken()
		} else {
			email = response[0].email
			pass = bcrypt.hashSync(Date.now() + response[0].username, 10).replace(/\//g, '').substring(1, 14)
			let hash = bcrypt.hashSync(pass, 10)
			tool.dbQuery(
				'DELETE FROM `token` ' +
				'WHERE `user_ID` = ?; ' +
				'UPDATE `user` ' +
				'SET `password` = ? ' +
				'WHERE `ID` = ?',
				[response[0].ID, hash, response[0].ID],
				validToken
			).catch(err => {
				wrongToken(err)
			})
		}
	}
	queryPromise.then(() => {
		tool.dbQuery(
			'SELECT `user`.`ID`, `user`.`status`, `user`.`username`, `user`.`email` ' +
			'FROM `user` ' +
			'INNER JOIN `token` ON `token`.`user_ID` = `user`.`ID` ' +
			'WHERE `token` = ?',
			[req.params.token],
			checkToken
		).catch(err => {
			wrongToken(err)
		})
	})
}
