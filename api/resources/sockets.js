const socketIO = require('socket.io')

module.exports.listen = app => {
	const io = socketIO.listen(app)

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
		socket.on('disconnect', () => {
			// console.log(socket)
			// let rooms = io.sockets.adapter.rooms[data.name].sockets
			// rooms.forEach(n => {
			// 	socket.leave(n)
			// 	console.log(socket.id + ' leave the room: ' + n)
			// })
		})
	})
}
