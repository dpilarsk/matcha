const path		=	require('path'),
	tool		=	require(path.join(__dirname, '..', 'tools.js'))

let queryPromise = tool.dbLink()
exports.read	=	(req, res) => {
	function wrongToken () {
		tool.err(res, 'An error occured... Your account cannot be verified.')
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
				tool.dispError(err)
				wrongToken()
			})
		}
	}
	queryPromise.then(() => {
		tool.dbQuery(
			'SELECT `user`.`ID` `user`.`status` ' +
			'FROM `user` ' +
			'INNER JOIN `token` ON `token`.`user_ID` = `user`.`ID` ' +
			'WHERE `token` = ?',
			[req.params.token],
			checkToken
		).catch(err => {
			tool.dispError(err)
			wrongToken()
		})
	})
}
