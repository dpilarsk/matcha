const	express		=	require('express'),
	router		=	express.Router(),
	path	=	require('path'),
	controller	=	require(path.join(__dirname, '/../controllers/tokens.js'))


router.route('/tokens/confirm/:token')
	.get(controller.read)

router.route('/tokens/reset/:token')
	.get(controller.update)

module.exports = router
