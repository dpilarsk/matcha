const	express		=	require('express'),
	router		=	express.Router(),
	path	=	require('path'),
	controller	=	require(path.join(__dirname, '/../controllers/tokens.js'))

router.use((req, res, next) => {
	console.log('Time: ', Date.now())
	next()
})

router.route('/tokens/confirm/:token')
	.get(controller.read)

module.exports = router
