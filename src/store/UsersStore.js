import Vuex from 'vuex'

let store = new Vuex.Store({
	state: {
		logged: false,
		alert: {
			visible: false,
			message: null,
			type: null
		},
		user: null,
		notifications_count: 0
	},
	mutations: {
		LOGIN: state => {
			state.logged = true
		},
		LOGOUT: state => {
			state.logged = false
		},
		NEW_ALERT: (state, payload) => {
			state.alert.type = payload.type
			state.alert.message = payload.message
			state.alert.visible = true
		},
		DISMISS: (state) => {
			state.alert.type = null
			state.alert.message = null
			state.alert.visible = false
		},
		CREATE_USER: (state, payload) => {
			state.user = payload
		},
		DELETE_USER: (state) => {
			state.user = null
		},
		INS_NOTIFICATION: (state, payload) => {
			state.notifications_count = payload.count
		},
		CLEAR_NOTIFICATIONS: (state) => {
			state.notifications_count = 0
		}
	},
	getters: {
		logged: state => state.logged,
		alert: state => state.alert,
		notifications: state => state.notifications_count
	},
	actions: {}
})

global.store = store

export default store
