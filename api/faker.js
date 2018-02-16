const	faker		=	require('faker'),
	path =	require('path'),
	message	=	require(path.join(__dirname, '/resources/utils.js')),
	bcrypt	=	require('bcrypt')

module.exports = (() => {
	let getGender = title => {
		if (title === 'Mrs.' || title === 'Mme' || title === 'Ms.' || title === 'Mlle' || title === 'Miss') return 'woman'
		else if (title === 'M' || title === 'Mr.') return 'man'
		else if (title === 'Dr.' || title === 'Prof') return (Math.floor(Math.random()*(1-0+1)+0) === 1 ? 'man' : 'woman')
		else {
			message.success(title)
			return title
		}
	}

	let getSexualOrientation = () => {
		let orientations = ['heterosexual', 'homosexual', 'bisexual']

		return orientations[Math.floor(Math.random() * (2 - 0 + 1) + 0)]
	}

	let generateRandomPoint = () => {
		let	x0	= 2.352222,
			y0	= 48.856614,
			rd	= 50000/111300,
			u	= Math.random(),
			v	= Math.random(),
			w	= rd * Math.sqrt(u),
			t	= 2 * Math.PI * v,
			x	= w * Math.cos(t),
			y	= w * Math.sin(t),
			xp	= x / Math.cos(y0)
		return { 'lat': y + y0, 'lng': xp + x0 }
	}

	let randomDate = (start, end) => {
		return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
	}

	let genCoords = generateRandomPoint()
	let user = [
		username = faker.internet.userName().slice(0, 11),
		first_name = faker.name.firstName(),
		last_name = faker.name.lastName(),
		email = faker.internet.email(),
		age = Math.floor(Math.random()*(73-18+1)+18),
		gender = getGender(faker.name.prefix()),
		sexual_orientation = getSexualOrientation(),
		password = bcrypt.hashSync('test', 2),
		status = Math.floor(Math.random()*(1-0+1)+0),
		longitude = coords.lng,
		latitude = coords.lat,
		distance = 50,
		popularity = Math.floor(Math.random()*(9999-0+1)+0),
		role = 'user',
		token = 'd',
		biography = faker.lorem.sentences(),
		last_visit = randomDate(new Date(2015, 1, 3), new Date()),
		picture = faker.image.avatar()
	]
	return user
})
