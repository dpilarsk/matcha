const socketIO = require('socket.io')

module.exports.listen = app => {
	const io = socketIO.listen(app)

	io.on('connection', socket => {
		// console.log(socket.id)
		socket.on('connect_user', data => {
			socket.join(data.name)
			let users = io.sockets.adapter.rooms[data.name].sockets
			for (let client in users) {
				console.log(client)
			}
			console.log(data, Object.keys(io.sockets.adapter.sids[socket.id]), socket.id, io.sockets.adapter.sids[socket.id])
		})

		socket.on('disconnect', data => {
			console.log(data, socket.id)
		})
	})
}
