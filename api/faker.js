const faker			=	require('faker'),
	tool			=	require('./tools.js'),
	bcrypt			=	require('bcrypt'),
	N_FAKE_DATA		=	1000

function createFalseUser () {
	return [
		faker.internet.userName().slice(0, 20),									// username
		faker.name.firstName(),													// First Name
		faker.name.lastName(),													// Last Name
		bcrypt.hashSync('Qwerty1!', 2),												// password TODO use a password that we can use in front because `test` fail with regex verification
		faker.internet.email(),													// email
		Math.random() > 0.5														// Status
	]
}

function createFalsePicture (userID) {
	return [
		userID + 1,																// User Id (+1 is for align on table key beginning at 1)
		faker.image.avatar()													// Profile picture
	]
}

function createFalseProfile (userID) {
	let sexuality = ['heterosexual', 'homosexual', 'bisexual']
	let generateRandomPoint = () => {
		let	x0	= 2.352222,
			y0	= 48.856614,
			rd	= 50000 / 111300,
			u	= Math.random(),
			v	= Math.random(),
			w	= rd * Math.sqrt(u),
			t	= 2 * Math.PI * v,
			x	= w * Math.cos(t),
			y	= w * Math.sin(t),
			xp	= x / Math.cos(y0)
		return { 'lng': y + y0, 'lat': xp + x0 }
	}
	let coords = generateRandomPoint()
	let randomDate = (start, end) => {
		return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()))
	}

	return [
		userID + 1,																// User Id (+1 is for align on table key beginning at 1)
		Math.floor(Math.random() * 102 + 18),									// Age in [ 18 - 120 ]
		Math.random() > 0.5 ? 'man' : 'woman',									// Gender
		faker.lorem.sentences(),												// Biography
		sexuality[Math.floor(Math.random() * 3)],								// Sexual orientation
		coords.lng,																// Longitude
		coords.lat,																// Latitude
		Math.floor(Math.random() * 130 + 20),									// Range in [ 20 - 150 ]
		Math.floor(Math.random() * 10000),										// Popularity
		'user',																	// Role
		randomDate(new Date(2015, 1, 3), new Date()),							// Last visit
		userID + 1																// profil picture (+1 is for align on table key beginning at 1)
	]
}

function createFalseTag () {
	let tag = faker.random.word()												// Random tag
	if (!tool.checkTag([tag])) {
		return [ tag ]
	}
	return [ 'Ztag' ]
}

function createFalseTagToUser () {
	return [
		Math.floor(Math.random() * (N_FAKE_DATA - 1) + 1),						// user_ID in [ 1 - 1000 ]
		Math.floor(Math.random() * (N_FAKE_DATA - 499) + 1)						// tag_ID in [ 1 - 500 ]
	]
}

function createFalseData (callback) {
	let data = []
	for (let i = 0; i < N_FAKE_DATA; i++) {
		data[i] = callback(i)
	}
	return data
}

function createFalseTagToUsers () {
	return createFalseData(createFalseTagToUser)
}
function createFalseTags () {
	return createFalseData(createFalseTag)
}
function createFalseUsers () {
	return createFalseData(createFalseUser)
}
function createFalsePictures (userID) {
	return createFalseData(createFalsePicture)
}
function createFalseProfiles (userID) {
	return createFalseData(createFalseProfile)
}

module.exports = {
	user: createFalseUsers,
	tag: createFalseTags,
	tagToUser: createFalseTagToUsers,
	picture: createFalsePictures,
	profile: createFalseProfiles
}
