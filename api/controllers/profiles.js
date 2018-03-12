const path		=	require('path'),
	tool		=	require(path.join(__dirname, '..', 'tools.js')),
	bcrypt		=	require('bcrypt')

let queryPromise = tool.dbLink()

function updateOrCreateMyUserAccount (req, res) {
	function queryFailed (msg) {
		tool.err(res, msg)
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

module.exports = {
	// index: getUser,
	// create: insertNewUser,
	// login: logIn,
	// read: getMyUserProfile,
	update: updateOrCreateMyUserAccount
	// delete: deleteMyAccount
}
