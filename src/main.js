// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import router from './router'
import VueResource from 'vue-resource'
import VueLocalStorage from 'vue-ls'
import VueJWT from 'vuejs-jwt'
import 'vue-use-vuex'
import Vuex from 'vuex'
import App from './App'
import Vuetify from 'vuetify'
import store from './store/UsersStore.js'
import 'vuetify/dist/vuetify.min.css'

let options = {
	namespace: 'matcha__'
}

Vue.use(Vuetify, { theme: {
	primary: '#ee44aa',
	secondary: '#424242',
	accent: '#82B1FF',
	error: '#FF5252',
	info: '#2196F3',
	success: '#4CAF50',
	warning: '#FFC107'
}})
Vue.use(Vuex)
Vue.use(VueLocalStorage, options)
Vue.use(VueJWT, {signKey: 'demo', keyName: 'matcha__token'})
Vue.use(VueResource)

Vue.config.productionTip = false

router.beforeEach((to, from, next) => {
	if (to.meta.requireAuth) {
		if (to.name === 'Logout') {
			console.log('TTT')
			Vue.ls.remove('token')
			if (store.state.logged === true) store.commit('LOGOUT')
			next('/login')
		} else if (!Vue.ls.get('token')) {
			if (store.state.logged === true) store.commit('LOGOUT')
			next('/login')
		} else if (Vue.$jwt.getToken() !== null) {
			let token = JSON.parse(Vue.$jwt.getToken()).value
			if (token) {
				if ((Vue.$jwt.decode(token)) !== null) next()
				else {
					Vue.ls.remove('token')
					if (store.state.logged === true) store.commit('LOGOUT')
					next('/login')
				}
			} else {
				Vue.ls.remove('token')
				if (store.state.logged === true) store.commit('LOGOUT')
				next('/login')
			}
		} else next('/login')
	} else if (!to.meta.requireAuth && (to.name === 'Login' || to.name === 'Register')) {
		if (Vue.ls.get('token')) {
			if (store.state.logged === false) store.commit('LOGIN')
			next('/')
		} else next()
	} else next()
})

/* eslint-disable no-new */
new Vue({
	store,
	el: '#app',
	router,
	components: { App },
	template: '<App/>'
})
