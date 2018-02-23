import Vue from 'vue'
import Router from 'vue-router'
import HelloWorld from '@/components/HelloWorld'
import Register from '@/components/Register'
import Login from '@/components/Login'
import Confirm from '@/components/Confirm'
import Suggestions from '@/components/Suggestions'

Vue.use(Router)

export default new Router({
	mode: 'history',
	routes: [
		{
			path: '/',
			name: 'HelloWorld',
			component: HelloWorld,
			meta: {
				requireAuth: true
			}
		},
		{
			path: '/register',
			name: 'Register',
			component: Register,
			meta: {
				requireAuth: false
			}
		},
		{
			path: '/confirm/:token',
			name: 'Confirm',
			component: Confirm,
			meta: {
				requireAuth: false
			}
		},
		{
			path: '/suggestions',
			name: 'Suggestions',
			component: Suggestions,
			meta: {
				requireAuth: true
			}
		},
		{
			path: '/login',
			name: 'Login',
			component: Login,
			meta: {
				requireAuth: false
			}
		},
		{
			path: '/logout',
			name: 'Logout',
			meta: {
				requireAuth: true
			}
		}
	]
})
