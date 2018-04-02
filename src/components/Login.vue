<template>
	<v-layout row wrap>
		<v-alert
			:color="this.store.state.alert.type"
			transition="scale-transition"
			dismissible
			v-model="alert_visible"
			v-html="this.store.state.alert.message"
		>
		</v-alert>
		<v-flex xs12>
			<v-form v-model="valid">
				<v-layout row wrap>
					<v-flex xs12 sm6 md6 class="pb-1 pr-1">
						<v-text-field @keyup.enter="valid ? submit() : 0" label="Nom d'utilisateur" v-model="user.login"
									  :rules="usernameRules" required></v-text-field>
					</v-flex>
					<v-flex xs12 sm6 md6 class="pb-1 pr-1">
						<v-text-field @keyup.enter="valid ? submit() : 0" label="Mot de passe"
									  v-model="user.password"
									  :rules="passwordRules"
									  :type="'password'"
									  required autocomplete></v-text-field>
					</v-flex>
				</v-layout>
				<v-btn ref="submit" @click="submit()" :disabled="!valid">Se connecter</v-btn>
			</v-form>
			<v-btn block @click="$router.push('/forget')">Réinitialiser le mot de passe</v-btn>
		</v-flex>
	</v-layout>
</template>

<script>
	import 'vue-use-vuex'
	import store from '@/store/UsersStore.js'
	export default {
		name: 'login',
		// sockets: {
		// 	connect: function () {
		// 		this.$socket.emit('connected', {'name': null})
		// 	}
		// },
		data () {
			return {
				store: store,
				valid: false,
				user: {
					login: '',
					password: ''
				},
				usernameRules: [
					v => !!v || 'Ce champ est requis.'
				],
				passwordRules: [
					v => !!v || 'Un mot de passe est requis.'
				]
			}
		},
		mounted () {
		},
		computed: {
			alert_visible: {
				get () {
					return this.store.state.alert.visible
				},
				set () {
					this.store.commit('DISMISS')
				}
			}
		},
		methods: {
			submit () {
				let _this = this
				this.axios.post('/users/login', [this.user])
					.then(response => {
						if (response.data.type === 'success') {
							this.$ls.set('token', response.data.token, 60 * 60 * 1000 * 24)
							this.valid = false
							this.store.commit('LOGIN')
							this.store.commit('CREATE_USER', this.$jwt.decode(response.data.token).user)
							if (this.$jwt.decode(response.data.token).user.profile && this.$jwt.decode(response.data.token).user.profile.latitude && this.$jwt.decode(response.data.token).user.profile.longitude) {
								this.$ls.set('latitude', this.$jwt.decode(response.data.token).user.profile.latitude, 60 * 60 * 1000 * 24)
								this.$ls.set('longitude', this.$jwt.decode(response.data.token).user.profile.longitude, 60 * 60 * 1000 * 24)
							} else {
								this.$ls.set('latitude', null, 60 * 60 * 1000 * 24)
								this.$ls.set('longitude', null, 60 * 60 * 1000 * 24)
							}
							this.$socket.emit('connect_user', {'name': this.$jwt.decode(response.data.token).user.username})
							if (this.$jwt.decode(response.data.token).user.valid) {
								this.$router.push({name: 'Search'})
							} else {
								this.$router.push({name: 'Account'})
							}
						}
						this.store.commit('NEW_ALERT', {type: response.data.type, message: response.data.message})
						setTimeout(function () {
							_this.store.commit('DISMISS')
						}, 2000)
					})
					.catch(err => {
						console.log(err)
					})
			}
		}
	}
</script>
