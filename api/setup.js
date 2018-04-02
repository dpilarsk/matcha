const path		=	require('path'),
	fs			=	require('fs'),
	message		=	require(path.join(__dirname, 'resources', 'utils.js')),
	faker		=	require(path.join(__dirname, 'faker.js')),
	tool		=	require(path.join(__dirname, 'tools.js')),
	filePath	=	path.join(__dirname, 'resources', 'matcha.mysql')

let queryPromise = tool.dbLink(true)
queryPromise.then(() => {
	initDatabase()
}).catch(err => { tool.fatal(err) })

function databaseCompleted () {
	message.success('\t Database filled with fake profiles')
	message.success(' Database creation is now completed.')
	process.exit(0)
}

function fillTagToUserDatabase () {
	message.success('\t Database filled with fake tags link')
	tool.dbQuery(
		'INSERT IGNORE INTO `tag_to_user` (`user_ID`, `tag_ID`) VALUES ?',
		[faker.tagToUser()],
		databaseCompleted
	).catch(err => { tool.fatal(err, 'Cannot insert tag in database') })
}

function fillTagDatabase () {
	message.success('\t Database filled with fake tags')
	tool.dbQuery(
		'INSERT IGNORE INTO `tag` (`content`) VALUES ?',
		[faker.tag()],
		fillTagToUserDatabase
	).catch(err => { tool.fatal(err, 'Cannot insert tag in database') })
}

function fillProfileDatabase () {
	message.success('\t Database filled with fake pictures')
	tool.dbQuery(
		'INSERT IGNORE INTO `profile` (`user_ID`, `age`, `gender`, `biography`, `sexual_orientation`, `latitude`, `longitude`, `range`, `popularity`, `role`, `last_visit`, `profil_picture`) VALUES ?',
		[faker.profile()],
		fillTagDatabase
	).catch(err => { tool.fatal(err, 'Cannot insert profiles in database') })
}

function fillPictureDatabase () {
	message.success('\t Database filled with fake users')
	tool.dbQuery(
		'INSERT IGNORE INTO `picture` (`user_ID`, `path`) VALUES ?',
		[faker.picture()],
		fillProfileDatabase
	).catch(err => { tool.fatal(err, 'Cannot insert pictures in database') })
}

function fillUserDatabase () {
	message.success(' Database structure is created succesfully.')
	tool.dbQuery(
		'INSERT IGNORE INTO `user` (`username`, `first_name`, `last_name`, `password`, `email`, `status`) VALUES ?',
		[faker.user()],
		fillPictureDatabase
	).catch(err => { tool.fatal(err, 'Cannot insert users in database') })
}

function createDatabase (databaseSetupRqt) {
	tool.dbQuery(
		databaseSetupRqt,
		null,
		fillUserDatabase
	).catch(err => { tool.fatal(err, 'Cannot init database structure') })
}

function initDatabase () {
	fs.readFile(filePath, {encoding: 'utf-8'}, function (err, fileContent) {
		if (err) {
			tool.fatal(err, 'FATAL: Cannot read mysql setup file')
		} else {
			createDatabase(fileContent)
		}
	})
}
