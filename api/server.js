const	express =	require('express'),
	app		=	express(),
	path	=	require('path'),
	users	=	require(path.join(__dirname, '/routes/user.js')),
	profile	=	require(path.join(__dirname, '/routes/profile.js')),
	server = require('http').createServer(app),
	io = require(path.join(__dirname, '/resources/sockets.js')).listen('8082'),
	tokens	=	require(path.join(__dirname, '/routes/token.js')),
	message	=	require(path.join(__dirname, '/resources/utils.js')),
	bodyParser = require('body-parser'),
	port	=	process.env.PORT || 8080

app.use((req, res, next) => {
	res.setHeader('Access-Control-Allow-Origin', 'http://localhost:8080')

	// Request methods you wish to allow
	res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE')

	// Request headers you wish to allow
	res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type,Authorization')

	// Set to true if you need the website to include cookies in the requests sent
	// to the API (e.g. in case you use sessions)
	res.setHeader('Access-Control-Allow-Credentials', true)

	next()
})

app.use(bodyParser.json())

app.use(bodyParser.urlencoded({
	extended: true
}))

app.use('/images', express.static(path.join(__dirname, '/public/uploads')))

app.use('/api', users)
app.use('/api', profile)
app.use('/api', tokens)

app.listen(port, () => message.success('Server started !\nSomething happened on port ' + port))
