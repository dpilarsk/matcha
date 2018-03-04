import Vue from 'vue'
import Router from 'vue-router'
import HelloWorld from '@/components/HelloWorld'
import Register from '@/components/Register'
import Login from '@/components/Login'
import Confirm from '@/components/Confirm'
import Suggestions from '@/components/Suggestions'
import Informations from '@/components/Informations'
import Account from '@/components/Account'
import Profile from '@/components/Profile'

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
			path: '/informations',
			name: 'Informations',
			component: Informations,
			meta: {
				requireAuth: true
			}
		},
		{
			path: '/profile/:id',
			name: 'Profile',
			component: Profile,
			meta: {
				requireAuth: true
			}
		},
		{
			path: '/account',
			name: 'Account',
			component: Account,
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
		},
		{
			path: '*',
			redirect: '/'
		}
	]
})
