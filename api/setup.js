const mysql		=	require('mysql2'),
	path		=	require('path'),
	fs			=	require('fs'),
	message		=	require(path.join(__dirname, 'resources', 'utils.js')),
	faker		=	require(path.join(__dirname, 'faker.js')),
	db			=	require(path.join(__dirname, 'resources', 'db.js')),
	filePath	=	path.join(__dirname, 'resources', 'matcha.mysql')

var connection	=	mysql.createConnection({
	host: db.cred().host,
	user: db.cred().user,
	password: db.cred().password,
	multipleStatements: true
})

let connectionPromise = new Promise(function (resolve, reject) {
	connection.connect(err => {
		if (err) {
			reject(err)
		} else {
			message.success('Connected to MySQL server')
		}
		resolve()
	})
})

function error (err, msg) {
	message.error(err + '\n\n\t' + msg)
	process.exit(1)
}

function fillDatabase () {
	// TODO USE SAME FUNCTION AS FUNCTION USED IN normal activity ??? why... if value are multiples it will failed and take more time....
	connection.query('INSERT INTO `user` (`username`, `password`, `email`) VALUES ?',
		[faker.user()], (err) => {
			if (err) {
				error(err, 'FATAL: Cannot insert users in database')
			} else {
				message.success('\t Database filled with fake users')
				connection.query('INSERT INTO `picture` (`user_ID`, `path`) VALUES ?',
					[faker.picture()], (err) => {
						if (err) {
							error(err, 'FATAL: Cannot insert pictures in database')
						} else {
							message.success('\t Database filled with fake profile pictures')
							connection.query('INSERT INTO `profile` (`user_ID`, `first_name`, `last_name`, `age`, `gender`, `biography`, `sexual_orientation`, `status`, `latitude`, `longitude`, `range`, `popularity`, `role`, `last_visit`, `profil_picture`) VALUES ?',
								[faker.profile()], (err) => {
									if (err) {
										error(err, 'FATAL: Cannot insert profiles in database')
									} else {
										message.success('\t Database filled with fake profiles')
										message.success(' Database creation is now completed.')
										process.exit(0)
									}
								})
						}
					})
			}
		})
}

function createDatabase (databaseSetupRqt) {
	connection.query(databaseSetupRqt, (err) => {
		if (err) {
			error(err, 'FATAL: Cannot init database structure')
		} else {
			message.success(' Database structure is created succesfully.')
			fillDatabase()
		}
	})
}

connectionPromise.then(() => {
	fs.readFile(filePath, {encoding: 'utf-8'}, function (err, fileContent) {
		if (err) {
			error(err, 'FATAL: Cannot read mysql setup file')
		} else {
			createDatabase(fileContent)
		}
	})
}).catch(err => {
	error(err, 'FATAL: Cannot connect to MySQL server')
	process.exit(1)
})
