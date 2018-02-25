const	mysql		=	require('mysql2'),
	path			=	require('path'),
	db				=	require(path.join(__dirname, 'resources', 'db.js')),
	message			=	require(path.join(__dirname, 'resources', 'utils.js'))

var connection		=	mysql.createConnection({
	host: db.cred().host,
	user: db.cred().user,
	password: db.cred().password
})

let connectionPromise = new Promise(function (resolve, reject) {
	connection.connect(err => {
		if (err) {
			reject(err)
		} else {
			message.success('Connexion au serveur MySQL réussie.')
		}
		resolve()
	})
})

// let transporter = nodemailer.createTransport({
// 	host: 'smtp.mailtrap.io',
// 	port: 2525,
// 	auth: {
// 		user: 'd4119f6ed6c5a1',
// 		pass: '8ac2d72a7253e3'
// 	}
// })

connectionPromise.then(() => {
	connection.query('USE matcha', (err) => {
		if (err) {
			message.error('Impossible d\'accéder a la bdd')
			// return
			// TODO WHY THIS SHIT HAPPEND >>> si pas de bdd, ne devrait t-on pas exit violemment car ca veut dire catastrophe sur le serveur ? le return ne return nul part
		}
	})
})

function databaseLink () {

}
function returnError (res, msg) {
	message.error(msg)// TODO U want a nsg here ?
	res.json({'status': 0, type: 'error', 'message': msg})
}

module.exports = {
	init: databaseLink,
	err: returnError
}
