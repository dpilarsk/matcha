const	express =	require('express'),
	app		=	express(),
	path	=	require('path'),
	users	=	require(path.join(__dirname, '/routes/user.js')),
	message	=	require(path.join(__dirname, '/resources/utils.js')),
	bodyParser = require('body-parser'),
	port	=	process.env.PORT || 8080

app.use((req, res, next) => {
	res.setHeader('Access-Control-Allow-Origin', '*')

	// Request methods you wish to allow
	res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE')

	// Request headers you wish to allow
	res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type')

	// Set to true if you need the website to include cookies in the requests sent
	// to the API (e.g. in case you use sessions)
	res.setHeader('Access-Control-Allow-Credentials', true)

	next()
})

app.use(bodyParser.json())

app.use(bodyParser.urlencoded({
	extended: true
}))

app.use('/api', users)

app.listen(port, () => message.success('Server started !\nSomething happened on port ' + port))
