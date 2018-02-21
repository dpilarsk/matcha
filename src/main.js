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
	console.log(to)
	if (!Vue.ls.get('token')) {
		store.commit('LOGOUT')
		if ((to.name === 'Login' || to.name === 'Register') || to.name === 'Confirm') next()
		else next('/login')
	} else {
		store.commit('LOGIN')
		if (to.path === '/logout') {
			Vue.ls.remove('token')
			store.commit('LOGOUT')
			next('/login')
		} else if ((to.path === '/login' || to.path === '/register')) next('/')
		else next()
	}
})

/* eslint-disable no-new */
new Vue({
	store,
	el: '#app',
	router,
	components: { App },
	template: '<App/>'
})
