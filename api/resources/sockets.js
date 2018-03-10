const socketIO = require('socket.io'),
	fs = require('fs'),
	path = require('path'),
	tool		=	require(path.join(__dirname, '..', 'tools.js')),
	jwt			=	require('jsonwebtoken'),
	message		=	require(path.join(__dirname, 'utils.js'))

let queryPromise = tool.dbLink()

module.exports.listen = app => {
	const io = socketIO.listen(app)

	function getMimeType(header) {
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
	function queryFailed (msg) {
		tool.err(res, msg)
	}

	io.on('connection', socket => {
		// console.log(socket.id)
		socket.on('connect_user', data => {
			socket.join(data.name)
			console.log(socket.id + ' join the room: ' + data.name)
			// let users = io.sockets.adapter.rooms[data.name].sockets
			// for (let client in users) {
			// 	console.log(client)
			// }
			// console.log(data, Object.keys(io.sockets.adapter.sids[socket.id]), socket.id, io.sockets.adapter.sids[socket.id])
		})
		socket.on('upload_pic', data => {

			function querySuccess() {
				console.log('Successfully uploaded.')
			}
			let type = getMimeType(data.type)
			console.log(type)
			if (type === 'jpeg' || type === 'png') {
				let file = (String(data.user) + '_' + String(Date.now()) + '.' + type)
				let pathImgWr = path.join(__dirname, '/../public/uploads/') + file
				let pathImgRq = '/images/' + file
				fs.writeFileSync(pathImgWr, Buffer.from(new Uint8Array(data.picture)))
				// TODO: Need to verify the JWT
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
				socket.emit('success')
			} else {
				socketError(socket, 'Your file is not an image !')
			}
		})
		socket.on('disconnect', () => {
			// console.log(socket)
			// let rooms = io.sockets.adapter.rooms[data.name].sockets
			// rooms.forEach(n => {
			// 	socket.leave(n)
			console.log(socket.id + ' leave')
			// })
		})
	})
}
