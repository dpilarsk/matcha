const
	express		=	require('express'),
	router		=	express.Router(),
	path		=	require('path'),
	controller	=	require(path.join(__dirname, '/../controllers/users.js'))

router.route('/tags')
	.get(controller.getTags)

router.route('/users/search')
	.get(controller.search)

router.route('/users')
	.get(controller.index)
	.post(controller.create)

router.route('/users/forget')
	.post(controller.forget)

router.route('/users/history')
	.get(controller.history)

router.route('/users/notifications')
	.get(controller.notifications)

router.route('/users/login')
	.post(controller.login)

router.route('/users/informations')
	.patch(controller.update)

router.route('/users/account')
	.patch(controller.updateAccount)

router.route('/users/:username')
	.get(controller.read)
	.put(controller.update)
	.delete(controller.delete)

module.exports = router
