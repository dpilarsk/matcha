const
	express		=	require('express'),
	router		=	express.Router(),
	path		=	require('path'),
	controller	=	require(path.join(__dirname, '/../controllers/talks.js'))


router.route('/talks')
	.get(controller.index)

router.route('/talks/:id')
	.get(controller.read)

module.exports = router
