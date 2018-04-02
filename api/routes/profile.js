const
	express		=	require('express'),
	router		=	express.Router(),
	path		=	require('path'),
	controller	=	require(path.join(__dirname, '/../controllers/profile.js'))


router.route('/profile/:id')
	.get(controller.index)

module.exports = router
