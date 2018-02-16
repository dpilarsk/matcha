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

/* eslint-disable no-new */
new Vue({
	store: require('./store/UsersStore.js'),
	el: '#app',
	router,
	components: { App },
	template: '<App/>'
})
