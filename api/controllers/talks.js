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

function getTalks (req, res) {
	let user = tool.getUser(req)
	if (user === 1) tool.err(res, 'Please logout and login again.')
	function queryFailed () {
		tool.err(res, 'An error occured... Your talks can\'t be loaded')
	}
	function querySuccess (response) {
		if (response.length === 0) {
			tool.suc(res, null)
		} else {
			tool.suc(res, response)
		}
	}// TODO when insert notification, created_at is not set at actual date
	queryPromise.then(() => {
		tool.dbQuery(
			'SELECT `conversation`.*, `conversation`.`ID` as `talk_id`, `picture`.`path`, `user`.`username`, `user`.`first_name`, `user`.`last_name` FROM `conversation` ' +
			'INNER JOIN `profile` ON (`profile`.`user_ID` = `conversation`.`user_ID_source` AND `conversation`.`user_ID_source` != ?) OR (`profile`.`user_ID` = `conversation`.`user_ID_destination` AND `conversation`.`user_ID_destination` != ?) ' +
			'INNER JOIN `picture` ON `picture`.`user_ID` = `profile`.`user_ID` AND `picture`.`ID` = `profile`.`profil_picture` ' +
			'INNER JOIN `user` ON `user`.`ID` = `profile`.`user_ID`' +
			'WHERE (`conversation`.`user_ID_source` = ? OR `conversation`.`user_ID_destination` = ?) AND `active` = 1 ' +
			'ORDER BY created_at ASC',
			[user.ID, user.ID, user.ID, user.ID, user.ID],
			querySuccess
		).catch(err => {
			queryFailed('Request failed:<br>' + err)
		})
	}).catch(err => {
		tool.dispError(err)
		queryFailed()
	})
}

function getMessages (req, res) {
	let user = tool.getUser(req)
	if (user === 1) tool.err(res, 'Please logout and login again.')
	function queryFailed () {
		tool.err(res, 'An error occured... Your talks can\'t be loaded')
	}
	function querySuccess (response) {
		if (response.length === 0) {
			tool.suc(res, null)
		} else {
			tool.suc(res, response)
		}
	}// TODO when insert notification, created_at is not set at actual date
	queryPromise.then(() => {
		tool.dbQuery(
			'SELECT * FROM `message` ' +
			'WHERE `conv_ID` = ?',
			[req.params.id],
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
	index: getTalks,
	read: getMessages
}
