const	mysql		=	require('mysql2'),
	path = require('path'),
	message		=	require(path.join(__dirname, 'resources', 'utils.js')),
	faker		=	require(__dirname + '/faker.js'),
	fs			=	require('fs'),
	db			=	require(__dirname + '/resources/db.js')
var connection	=	mysql.createConnection({
	host: db.cred().host,
	user: db.cred().user,
	password: db.cred().password
})

let connectionPromise = new Promise(function(resolve, reject) {
	connection.connect(err => {
		if (err) reject(err)
		else message.success('Connexion au serveur MySQL réussie.')
		resolve()
	})
})

connectionPromise.then(() => {
	let users = []
	connection.query('DROP DATABASE IF EXISTS matcha;')
	connection.query('CREATE DATABASE IF NOT EXISTS matcha;', (err) => {
		if (err) {
			message.error('Une erreur est survenue lors de la creation de la base de donnees:\n' + err)
			process.exit(1)
		} else message.success('La base de donnees vient d\'etre creee.')
	})
	connection.query('USE matcha;')
	connection.query('CREATE TABLE IF NOT EXISTS user (' +
		'id INT(11) AUTO_INCREMENT NOT NULL,' +
		'username VARCHAR(12) NOT NULL,' +
		'first_name VARCHAR(255) NOT NULL,' +
		'last_name VARCHAR(255) NOT NULL,' +
		'age int(2),' +
		'gender ENUM("man", "woman"),' +
		'biography TEXT DEFAULT NULL,' +
		'sexual_orientation ENUM("heterosexual", "bisexual", "homosexual") DEFAULT "bisexual",' +
		'password VARCHAR(255) NOT NULL,' +
		'email VARCHAR(255) NOT NULL,' +
		'status INT(1) DEFAULT 0,' +
		'latitude DOUBLE DEFAULT 0,' +
		'longitude DOUBLE DEFAULT 0,' +
		'max_distance INT(11) DEFAULT 2,' +
		'popularity INT(4) DEFAULT 5000,' +
		'role ENUM("user", "admin") DEFAULT "user",' +
		'token VARCHAR(255) DEFAULT NULL,' +
		'connected INT(1) DEFAULT 0,' +
		'last_visit DATETIME,' +
		'end_at DATETIME,' +
		'picture TEXT,' +
		'PRIMARY KEY(id)' +
		');', (err) => {
		if (err) {
			message.error('Une erreur est survenue lors de la creation de la table des utilisateurs:\n' + err)
			process.exit(1)
		} else {
			message.success('La table des utilisateurs vient d\'etre creee.')
			for (let i = 0; i < 1000; i++) {
				users[i] = faker()
			}
			connection.query('INSERT INTO user (username, first_name, last_name, email, age, gender, sexual_orientation, password, status, longitude, latitude, max_distance, popularity, role, token, biography, last_visit, picture) VALUES ?',
				[users], (err) => {
					if (err) {
						message.error('Une erreur est survenue lors de la creation des utilisateurs:\n' + err)
						process.exit(1)
					} else message.success('Les utilisateurs viennent d\'etre crees.')
					process.exit(0)
				})
		}
	})
	connection.query('CREATE TABLE IF NOT EXISTS tag (' +
		'id INT(11) AUTO_INCREMENT NOT NULL,' +
		'content VARCHAR(255) NOT NULL,' +
		'PRIMARY KEY(id)' +
		');', (err) => {
		if (err) {
			message.error('Une erreur est survenue lors de la creation de la table des tags:\n' + err)
			process.exit(1)
		} else message.success('La table des tags vient d\'etre creee.')
	})
	connection.query('CREATE TABLE IF NOT EXISTS tag_to_user (' +
		'id INT(11) AUTO_INCREMENT NOT NULL,' +
		'user_id INT(11) NOT NULL,' +
		'tag_id INT(11) NOT NULL,' +
		'FOREIGN KEY(user_id) REFERENCES user(id) ON DELETE CASCADE,' +
		'FOREIGN KEY(tag_id) REFERENCES tag(id) ON DELETE CASCADE,' +
		'PRIMARY KEY(id)' +
		');', (err) => {
		if (err) {
			message.error('Une erreur est survenue lors de la creation de la table d\'association des tags aux utilisateurs:\n' + err)
			process.exit(1)
		} else message.success('La table d\'association des tags aux utilisateurs vient d\'etre creee.')
	})
	connection.query('CREATE TABLE IF NOT EXISTS picture (' +
		'id INT(11) AUTO_INCREMENT NOT NULL,' +
		'user_id INT(11) NOT NULL,' +
		'path VARCHAR(255) NOT NULL,' +
		'profile_picture INT(1) DEFAULT 0,' +
		'FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE,' +
		'PRIMARY KEY(id)' +
		');', (err) => {
		if (err) {
			message.error('Une erreur est survenue lors de la creation de la table des photos:\n' + err)
			process.exit(1)
		} else message.success('La table des photos vient d\'etre creee.')
	})
	connection.query('CREATE TABLE IF NOT EXISTS message (' +
		'id INT(11) AUTO_INCREMENT NOT NULL,' +
		'user_id_source INT(11) NOT NULL,' +
		'user_id_destination INT(11) NOT NULL,' +
		'content LONGBLOB NOT NULL,' +
		'created_at DATETIME,' +
		'FOREIGN KEY (user_id_source) REFERENCES user(id) ON DELETE CASCADE,' +
		'FOREIGN KEY (user_id_destination) REFERENCES user(id) ON DELETE CASCADE,' +
		'PRIMARY KEY(id)' +
		');', (err) => {
		if (err) {
			message.error('Une erreur est survenue lors de la creation de la table des messages:\n' + err)
			process.exit(1)
		} else message.success('La table des messages vient d\'etre creee.')
	})
	connection.query('CREATE TABLE IF NOT EXISTS notification (' +
		'id INT(11) AUTO_INCREMENT NOT NULL,' +
		'user_id INT(11) NOT NULL,' +
		'content LONGBLOB NOT NULL,' +
		'viewed INT(1) DEFAULT 0,' +
		'type ENUM("like", "visit", "message", "like_back", "dislike", "other") DEFAULT "other",' +
		'created_at DATETIME,' +
		'FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE,' +
		'PRIMARY KEY(id)' +
		');', (err) => {
		if (err) {
			message.error('Une erreur est survenue lors de la creation de la table des notifications:\n' + err)
			process.exit(1)
		} else message.success('La table des notifications vient d\'etre creee.')
	})
}).catch(err => {
	message.error('Connexion au serveur MySQL échouée:\n' + err)
	process.exit(1)
})
