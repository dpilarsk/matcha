const socketIO = require('socket.io'),
	fs = require('fs'),
	path = require('path'),
	tool		=	require(path.join(__dirname, '..', 'tools.js')),
	jwt			=	require('jsonwebtoken'),
	nodemailer	=	require('nodemailer'),
	message		=	require(path.join(__dirname, 'utils.js'))

let queryPromise = tool.dbLink()
let transporter = nodemailer.createTransport({
	port: 1025,
	ignoreTLS: true
})
module.exports.listen = app => {
	const io = socketIO.listen(app)

	function getMimeType (header) {
		if (header === 'ffd8ffe0' || header === 'ffd8ffe1' ||
		header === 'ffd8ffe2' || header === 'ffd8ffe3' || header === 'ffd8ffe8') {
			return 'png'
		} else if (header === '89504e47'){
			return 'jpeg'
		} else {
			return 1
		}
	}
	function socketError (socket, message) {
		try {
			socket.emit('error_message', {'type': 'error', 'message': message})
		} catch (e) {
			console.log(e)
		}
	}
	function queryFailed (res, msg) {
		tool.err(res, msg)
	}
	function getUserFromToken (token) {
		try {
			let decode = jwt.verify(token, 'demo')
			return decode.user
		} catch (err) {
			return 1
		}
	}
	function changePopularity (userId, type) {
		function queryFailed (response) {
			console.log('La requete a echouee.')
		}
		function querySuccess (response) {
			if ((Number(response[0].popularity) + counter) < 0) {
				counter = 0
			} else if (Number(response[0].popularity) + counter > 10000) {
				counter = 10000
			} else {
				counter += response[0].popularity
			}
			tool.dbQuery(
				'UPDATE `profile` ' +
				'SET `popularity` = ? ' +
				'WHERE `user_ID` = ?',
				[counter, userId],
				tool.void
			).catch(err => {
				queryFailed('Request failed:<br>' + err)
			})
		}
		let counter = 0
		switch (type) {
		case 'like':
			counter += 100
			break
		case 'match':
			counter += 250
			break
		case 'dislike':
			counter -= 100
			break
		case 'unmatch':
			counter -= 250
			break
		case 'report':
			counter -= 1000
			break
		case 'block':
			counter -= 750
			break
		}
		queryPromise.then(() => {
			tool.dbQuery(
				'SELECT `popularity` ' +
				'FROM `profile` ' +
				'WHERE `user_ID` = ?',
				[userId],
				querySuccess
			).catch(err => {
				queryFailed('Request failed:<br>' + err)
			})
		}).catch(err => {
			tool.dispError(err)
			queryFailed('Request failed')
		})
	}

	io.on('connection', socket => {
		socket.on('connect_user', data => {
			socket.join(data.name)
			function checkProfile (response) {
				if (response.length !== 0) {
					tool.dbQuery(
						'UPDATE `profile` ' +
						'SET `last_visit` = ? ' +
						'WHERE `user_ID` = ?',
						[new Date(), response[0].ID],
						tool.void
					).catch(err => {
						queryFailed('Request failed:<br>' + err)
					})
				}
			}
			queryPromise.then(() => {
				tool.dbQuery(
					'SELECT * FROM `user` ' +
					'WHERE `username` = ?',
					[data.name],
					checkProfile
				).catch(err => {
					queryFailed('Request failed:<br>' + err)
				})
			}).catch(err => {
				tool.dispError(err)
				queryFailed('Request failed')
			})
		})
		socket.on('get_user_status', data => {
			if (io.sockets.adapter.rooms[data.username]) {
				socket.emit('user_status', {status: 1})
			} else {
				socket.emit('user_status', {status: 0})
			}
		})
		socket.on('new_message', data => {
			function sendMessage (response) {
				io.to(data.username_destination).emit('receive_message', {
					ID: response.insertId,
					content: data.message,
					conv_ID: data.conv_ID,
					created_at: new Date().toISOString(),
					user_ID: user.ID
				})
			}
			function querySuccess () {
				tool.dbQuery(
					'INSERT INTO `message` (`user_ID`, `conv_ID`, `content`) ' +
					'VALUES (?, ?, ?)',
					[user.ID, data.conv_ID, data.message],
					sendMessage
				).catch(err => {
					queryFailed('Request failed:<br>' + err)
				})
				io.to(data.username_destination).emit('notification', { type: 'message', message: content })
			}
			function checkConv (response) {
				if (response.length === 0) {
					socketError(socket, 'This conversation is not active')
				} else {
					tool.dbQuery(
						'INSERT INTO `notification` (`user_ID`, `user_ID_source`, `content`, `type`) ' +
						'VALUES (?, ?, ?, ?)',
						[data.user_ID_destination, user.ID, content, 'message'],
						querySuccess
					).catch(err => {
						queryFailed('Request failed:<br>' + err)
					})
				}
			}
			function checkBlock (response) {
				console.log(response)
				if (response.length === 0) {
					tool.dbQuery(
						'SELECT * FROM `conversation` ' +
						'WHERE `ID` = ? AND `active` = 1',
						[data.conv_ID],
						checkConv
					).catch(err => {
						queryFailed('Request failed:<br>' + err)
					})
				} else {
					socketError(socket, 'This conversation is not active')
				}
			}
			let user = getUserFromToken(data.user_source)
			if (user === 1) {
				socketError(socket, 'Please logout and login again.')
			} else {
				var content = user.username + ' vous a envoyé un message.'
				queryPromise.then(() => {
					console.log(user.ID, data.user_ID_destination)
					tool.dbQuery(
						'SELECT * FROM `block` ' +
						'WHERE (`user_ID_destination` = ? AND `user_ID_source` = ?) OR (`user_ID_source` = ? AND `user_ID_destination` = ?)',
						[user.ID, data.user_ID_destination, user.ID, data.user_ID_destination],
						checkBlock
					).catch(err => {
						queryFailed('Request failed:<br>' + err)
					})
				}).catch(err => {
					tool.dispError(err)
					queryFailed('Request failed')
				})
			}
		})
		socket.on('upload_pic', data => {
			function querySuccess (response) {
				socket.emit('success', { ID: response.insertId, path: pathImgRq })
				console.log('Successfully uploaded1.')
			}
			let type = getMimeType(data.type)
			let user = getUserFromToken(data.token)
			if (user === 1 || user.ID !== data.user) {
				socketError(socket, 'Please logout and login again.')
			} else {
				if (type === 'jpeg' || type === 'png') {
					let file = (String(data.user) + '_' + String(Date.now()) + '.' + type)
					let pathImgWr = path.join(__dirname, '/../public/uploads/') + file
					var pathImgRq = 'http://localhost:8081/images/' + file
					fs.mkdir(path.join(__dirname, '/../public'), (err, dataErr) => {
						if (err && err.code !== 'EEXIST') throw dataErr
						fs.mkdir(path.join(__dirname, '/../public/uploads/'), (err, dataErr) => {
							if (err && err.code !== 'EEXIST') throw dataErr
							fs.writeFileSync(pathImgWr, Buffer.from(new Uint8Array(data.picture)))
						})
					})
					queryPromise.then(() => {
						tool.dbQuery(
							'INSERT INTO `picture` (user_ID, path)' +
							'VALUES (?, ?)',
							[data.user, pathImgRq],
							querySuccess
						).catch(err => {
							queryFailed('Request failed:<br>' + err)
						})
					}).catch(err => {
						tool.dispError(err)
						queryFailed('Request failed')
					})
				} else {
					socketError(socket, 'Your file is not an image !')
				}
			}
		})
		socket.on('set_profile_pic', data => {
			function updateSuccess () {
				socket.emit('success_change', {ID: data.ID})
				console.log('Successfully change.')
			}
			function querySuccess (response) {
				if (response === 0) {
					socketError(socket, 'Cette photo est introuvable.')
				} else {
					tool.dbQuery(
						'UPDATE `profile` ' +
						'SET `profil_picture` = ? ' +
						'WHERE `user_ID` = ?',
						[data.ID, user.ID],
						updateSuccess
					).catch(err => {
						queryFailed('Request failed:<br>' + err)
					})
				}
			}
			let user = getUserFromToken(data.user)
			if (user === 1) {
				socketError(socket, 'Please logout and login again.')
			} else {
				queryPromise.then(() => {
					tool.dbQuery(
						'SELECT * ' +
						'FROM `picture` ' +
						'WHERE `ID` = ? AND `user_ID` = ?',
						[data.ID, user.ID],
						querySuccess
					).catch(err => {
						queryFailed('Request failed:<br>' + err)
					})
				}).catch(err => {
					tool.dispError(err)
					queryFailed('Request failed')
				})
			}
		})
		socket.on('delete_pic', data => {
			let link = ''
			function deletePic () {
				socket.emit('delete_success', { id: picture_ID })
				console.log('Successfully deleted.')
				fs.unlink(link, err => {
					if (err) console.log('L\'image ne peut pas etre supprimée du disque')
				})
			}
			function checkProfile (response) {
				if (response.length === 0) {
					tool.dbQuery(
						'DELETE FROM `picture` ' +
						'WHERE ID = ? and user_ID = ?',
						[picture_ID, user_ID],
						deletePic
					).catch(err => {
						queryFailed('Request failed:<br>' + err)
					})
				} else {
					socketError(socket, 'Votre photo ne peut pas être supprimée.')
				}
			}
			function querySuccess (response) {
				link = path.join(__dirname, '/../public/uploads/' + response[0].path.split('/')[4])
				tool.dbQuery(
					'SELECT `ID` FROM `profile` ' +
					'WHERE `user_ID` = ? AND `profil_picture` = ?',
					[user_ID, picture_ID],
					checkProfile
				).catch(err => {
					queryFailed('Request failed:<br>' + err)
				})
			}

			function queryFailed () {
				socketError(socket, 'Votre photo ne peut-être supprimée.')
			}

			var picture_ID = data.ID.split('_')[0]
			let user_ID = data.user

			queryPromise.then(() => {
				tool.dbQuery(
					'SELECT * FROM `picture` ' +
					'WHERE `user_ID` = ? AND `ID` = ?',
					[user_ID, picture_ID],
					querySuccess
				).catch(err => {
					queryFailed('Request failed:<br>' + err)
				})
			}).catch(err => {
				tool.dispError(err)
				queryFailed('Request failed')
			})
		})
		socket.on('visit_user', data => {
			function querySuccess (response) {
				io.to(data.username_destination).emit('notification', { type: 'visit', message: content })
			}
			function checkBlock (response) {
				if (response.length === 0) {
					tool.dbQuery(
						'INSERT INTO `notification` (`user_ID`, `user_ID_source`, `content`, `type`) ' +
						'SELECT * FROM (SELECT ?, ?, ?, ?) AS tmp ' +
						'WHERE NOT EXISTS (' +
						'SELECT `ID` FROM `notification` WHERE (`user_ID` = ? AND `user_ID_source` = ? AND `type` = "visit")' +
						') LIMIT 1',
						[data.user_ID_destination, user.ID, content, 'visit', data.user_ID_destination, user.ID],
						querySuccess
					).catch(err => {
						queryFailed('Request failed:<br>' + err)
					})
				}
			}
			let user = getUserFromToken(data.user_source)
			if (user === 1) {
				socketError(socket, 'Please logout and login again.')
			} else {
				var content = user.username + ' à visité votre profil.'
				queryPromise.then(() => {
					tool.dbQuery(
						'SELECT * FROM `block` ' +
						'WHERE (`user_ID_destination` = ? AND `user_ID_source` = ?) OR (`user_ID_destination` = ? AND `user_ID_source` = ?)',
						[user.ID, data.user_ID_destination, data.user_ID_destination, user.ID],
						checkBlock
					).catch(err => {
						queryFailed('Request failed:<br>' + err)
					})
				}).catch(err => {
					tool.dispError(err)
					queryFailed('Request failed')
				})
			}
		})
		socket.on('like_user', data => {
			function updateConversation (response) {
				if (response.length === 0) {
					tool.dbQuery(
						'INSERT INTO `conversation` (`user_ID_source`, `user_ID_destination`) ' +
						'SELECT * FROM (SELECT ?, ?) AS tmp ' +
						'WHERE NOT EXISTS (' +
						'SELECT `user_ID_source` FROM `conversation` WHERE (`user_ID_source` = ? AND `user_ID_destination` = ?) OR (`user_ID_destination` = ? AND `user_ID_source` = ?)' +
						') LIMIT 1',
						[data.user_ID_destination, user.ID, data.user_ID_destination, user.ID, data.user_ID_destination, user.ID, user.ID, data.user_ID_destination, user.ID],
						tool.void
					).catch(err => {
						queryFailed('Request failed:<br>' + err)
					})
				} else {
					tool.dbQuery(
						'UPDATE `conversation` ' +
						'SET `active` = 1 ' +
						'WHERE `ID` = ?',
						[response[0].ID],
						tool.void
					).catch(err => {
						queryFailed('Request failed:<br>' + err)
					})
				}
			}
			function likeBack () {
				tool.dbQuery(
					'SELECT * FROM `conversation` ' +
					'WHERE (`user_ID_source` = ? AND `user_ID_destination` = ?) OR (`user_ID_destination` = ? AND `user_ID_source` = ?)',
					[data.user_ID_destination, user.ID, data.user_ID_destination, user.ID],
					updateConversation
				).catch(err => {
					queryFailed('Request failed:<br>' + err)
				})
			}
			function querySuccess (response) {
				if (response.length === 0) {
					changePopularity(data.user_ID_destination, 'like')
					io.to(data.username_destination).emit('notification', { type: 'like', message: content })
					tool.dbQuery(
						'INSERT INTO `notification` (`user_ID`, `user_ID_source`, `content`, `type`) ' +
						'VALUES (?, ?, ?, ?)',
						[data.user_ID_destination, user.ID, content, 'like'],
						tool.void
					).catch(err => {
						queryFailed('Request failed:<br>' + err)
					})
				} else {
					changePopularity(data.user_ID_destination, 'match')
					io.to(data.username_destination).emit('notification', { type: 'like_back', message: (user.username + ' vous a liké en retour !') })
					tool.dbQuery(
						'INSERT INTO `notification` (`user_ID`, `user_ID_source`, `content`, `type`) ' +
						'VALUES (?, ?, ?, ?)',
						[data.user_ID_destination, user.ID, (user.username + ' vous a liké en retour !'), 'like_back'],
						likeBack
					).catch(err => {
						queryFailed('Request failed:<br>' + err)
					})
				}
			}
			function likeSuccess (response) {
				if (response.affectedRows === 0) {
					console.log('Already liked')
				} else {
					socket.emit('like_success')
					tool.dbQuery(
						'SELECT * FROM `like` ' +
						'WHERE `user_ID_destination` = ? AND `user_ID_source` = ?',
						[user.ID, data.user_ID_destination],
						querySuccess
					).catch(err => {
						queryFailed('Request failed:<br>' + err)
					})
				}
			}
			function checkBlock (response) {
				if (response.length === 0) {
					tool.dbQuery(
						'INSERT INTO `like` (`user_ID_source`, `user_ID_destination`) ' +
						'SELECT * FROM (SELECT ?, ?) AS tmp ' +
						'WHERE NOT EXISTS (' +
						'SELECT user_ID_source FROM `like` WHERE user_ID_source = ? AND user_ID_destination = ?' +
						') LIMIT 1',
						[user.ID, data.user_ID_destination, user.ID, data.user_ID_destination, data.user_ID_destination, content, 'like'],
						likeSuccess
					).catch(err => {
						queryFailed('Request failed:<br>' + err)
					})
				} else {
					socketError(socket, 'This request can\'t be done.')
				}
			}
			let user = getUserFromToken(data.user_source)
			if (user === 1) {
				socketError(socket, 'Please logout and login again.')
			} else {
				var content = user.username + ' vous a liké.'
				queryPromise.then(() => {
					tool.dbQuery(
						'SELECT * FROM `block` ' +
						'WHERE (`user_ID_destination` = ? AND `user_ID_source` = ?) OR (`user_ID_destination` = ? AND `user_ID_source` = ?)',
						[user.ID, data.user_ID_destination, data.user_ID_destination, user.ID],
						checkBlock
					).catch(err => {
						queryFailed('Request failed:<br>' + err)
					})
				}).catch(err => {
					tool.dispError(err)
					queryFailed('Request failed')
				})
			}
		})
		socket.on('dislike_user', data => {
			function deactivateTalk () {
				tool.dbQuery(
					'UPDATE `conversation` ' +
					'SET `active` = 0 ' +
					'WHERE (`user_ID_source` = ? AND `user_ID_destination` = ?) OR (`user_ID_destination` = ? AND `user_ID_source` = ?)',
					[user.ID, data.user_ID_destination, user.ID, data.user_ID_destination],
					tool.void
				).catch(err => {
					queryFailed('Request failed:<br>' + err)
				})
			}
			function querySuccess (response) {
				if (response.length === 0) {
					socket.emit('dislike_success')
					changePopularity(data.user_ID_destination, 'dislike')
				} else {
					changePopularity(data.user_ID_destination, 'unmatch')
					socket.emit('dislike_success')
					io.to(data.username_destination).emit('notification', { type: 'dislike', message: (user.username + ' vous a disliké !') })
					tool.dbQuery(
						'INSERT INTO `notification` (`user_ID`, `user_ID_source`, `content`, `type`) ' +
						'VALUES (?, ?, ?, ?)',
						[data.user_ID_destination, user.ID, (user.username + ' vous a disliké !'), 'dislike'],
						deactivateTalk
					).catch(err => {
						queryFailed('Request failed:<br>' + err)
					})
				}
				tool.dbQuery(
					'DELETE FROM `like` ' +
					'WHERE user_ID_source = ? AND user_ID_destination = ?',
					[user.ID, data.user_ID_destination],
					tool.void
				).catch(err => {
					queryFailed('Request failed:<br>' + err)
				})
				socket.emit('dislike_success')
				console.log('Successfully dislike')
			}
			function checkBlock (response) {
				if (response.length === 0) {
					tool.dbQuery(
						'SELECT * FROM `like` ' +
						'WHERE `user_ID_source` = ? AND `user_ID_destination` = ?',
						[data.user_ID_destination, user.ID],
						querySuccess
					).catch(err => {
						queryFailed('Request failed:<br>' + err)
					})
				} else {
					socketError(socket, 'This request can\'t be done.')
				}
			}
			let user = getUserFromToken(data.user_source)
			if (user === 1) {
				socketError(socket, 'Please logout and login again.')
			} else {
				queryPromise.then(() => {
					tool.dbQuery(
						'SELECT * FROM `block` ' +
						'WHERE (`user_ID_destination` = ? AND `user_ID_source` = ?) OR (`user_ID_destination` = ? AND `user_ID_source` = ?)',
						[user.ID, data.user_ID_destination, data.user_ID_destination, user.ID],
						checkBlock
					).catch(err => {
						queryFailed('Request failed:<br>' + err)
					})
				}).catch(err => {
					tool.dispError(err)
					queryFailed('Request failed')
				})
			}
		})
		socket.on('block_user', data => {
			function blockUser () {
				tool.dbQuery(
					'INSERT INTO `block` (`user_ID_destination`, `user_ID_source`) ' +
					'VALUES (?, ?)',
					[data.user_ID_destination, user.ID],
					tool.void
				).catch(err => {
					queryFailed('Request failed:<br>' + err)
				})
				changePopularity(data.user_ID_destination, 'block')
			}
			function deactivateTalk () {
				tool.dbQuery(
					'UPDATE `conversation` ' +
					'SET `active` = 0 ' +
					'WHERE (`user_ID_source` = ? AND `user_ID_destination` = ?) OR (`user_ID_destination` = ? AND `user_ID_source` = ?)',
					[user.ID, data.user_ID_destination, user.ID, data.user_ID_destination],
					blockUser
				).catch(err => {
					queryFailed('Request failed:<br>' + err)
				})
			}
			function querySuccess (response) {
				if (response.length === 0) {
					socket.emit('dislike_success')
					changePopularity(data.user_ID_destination, 'dislike')
					blockUser()
				} else {
					changePopularity(data.user_ID_destination, 'unmatch')
					socket.emit('dislike_success')
					io.to(data.username_destination).emit('notification', { type: 'dislike', message: (user.username + ' vous a disliké !') })
					tool.dbQuery(
						'INSERT INTO `notification` (`user_ID`, `user_ID_source`, `content`, `type`) ' +
						'VALUES (?, ?, ?, ?)',
						[data.user_ID_destination, user.ID, (user.username + ' vous a disliké !'), 'dislike'],
						deactivateTalk
					).catch(err => {
						queryFailed('Request failed:<br>' + err)
					})
				}
				tool.dbQuery(
					'DELETE FROM `like` ' +
					'WHERE user_ID_source = ? AND user_ID_destination = ?',
					[user.ID, data.user_ID_destination],
					tool.void
				).catch(err => {
					queryFailed('Request failed:<br>' + err)
				})
				socket.emit('dislike_success')
				console.log('Successfully dislike')
			}
			let user = getUserFromToken(data.user_source)
			if (user === 1) {
				socketError(socket, 'Please logout and login again.')
			} else {
				queryPromise.then(() => {
					tool.dbQuery(
						'SELECT * FROM `like` ' +
						'WHERE `user_ID_source` = ? AND `user_ID_destination` = ?',
						[data.user_ID_destination, user.ID],
						querySuccess
					).catch(err => {
						queryFailed('Request failed:<br>' + err)
					})
				}).catch(err => {
					tool.dispError(err)
					queryFailed('Request failed')
				})
			}
		})
		socket.on('report_user', data => {
			let mail = {
				from: 'meeting@matcha.fr',
				to: 'meeting@matcha.fr',
				subject: 'Un utilisateur a été reporté!',
				html:
				'<h1>Report utilisateur</h1>' +
				'<p>L\'utilisateur ayant l\'ID: ' + data.user_ID_destination + ' à été reporté comme un faux compte.</p>' +
				''
			}
			let user = getUserFromToken(data.user_source)
			if (user === 1) {
				socketError(socket, 'Please logout and login again.')
			} else {
				changePopularity(data.user_ID_destination, 'report')
				transporter.sendMail(mail, (err, info) => {
					if (err) {
						message.error(err)
					} else {
						console.log('report success')
					}
				})
			}
		})
		socket.on('disconnect_user', (data) => {
			let user = getUserFromToken(data)
			if (io.sockets.adapter.rooms[user.username]) {
				Object.keys(io.sockets.adapter.rooms[user.username].sockets).forEach(function (s) {
					io.sockets.connected[s].leave(user.username)
				})
			}
		})
	})
}
