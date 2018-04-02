const path		=	require('path'),
	tool		=	require(path.join(__dirname, '..', 'tools.js')),
	bcrypt		=	require('bcrypt'),
	jwt			=	require('jsonwebtoken'),
	message		=	require(path.join(__dirname, '..', 'resources', 'utils.js')),
	nodemailer	=	require('nodemailer')

let queryPromise = tool.dbLink()

function getNotifications (req, res) {
	let user = tool.getUser(req)
	if (user === 1) tool.err(res, 'Please logout and login again.')
	function queryFailed () {
		tool.err(res, 'An error occured... Your notifications can\'t be loaded')
	}
	function querySuccess (response) {
		if (response.length === 0) {
			tool.suc(res, null)
		} else {
			tool.dbQuery(
				'UPDATE `notification` ' +
				'SET `viewed` = 1 ' +
				'WHERE `user_id` = ? and `viewed` = 0',
				[user.ID],
				tool.void
			).catch(err => {
				queryFailed('Request failed:<br>' + err)
			})
			tool.suc(res, response)
		}
	}// TODO when insert notification, created_at is not set at actual date
	queryPromise.then(() => {
		tool.dbQuery(
			'SELECT `notification`.* FROM `notification` ' +
			'WHERE `notification`.`user_ID` = ? ' +
			'ORDER BY `created_at` ASC',
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

module.exports = {
	index: getNotifications
}
