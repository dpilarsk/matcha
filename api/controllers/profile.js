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

function getProfile (req, res) {
	function queryFailed (msg) {
		tool.err(res, msg)
	}
	function returnUserProfile (response) {
		tool.suc(res, response)
	}
	queryPromise.then(() => {
		tool.dbQuery(
			'SELECT * ' +
			'FROM `picture` ' +
			'WHERE user_ID = ?',
			[req.params.id],
			returnUserProfile
		).catch(err => {
			queryFailed('Request failed:<br>' + err)
		})
	}).catch(err => {
		tool.dispError(err)
		queryFailed('Request failed')
	})
}

module.exports = {
	index: getProfile
}
