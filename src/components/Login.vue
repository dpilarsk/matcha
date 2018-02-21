<template>
	<v-layout row wrap>
		<v-alert
			:color="this.store.state.alert.type"
			transition="scale-transition"
			dismissible
			v-model="alert_visible"
		>
			{{ this.store.state.alert.message }}
		</v-alert>
		<v-flex xs12>
			<v-form v-model="valid">
				<v-layout row wrap>
					<v-flex xs12 sm6 md6>
						<v-text-field label="Nom d'utilisateur" v-model="user.login"
									  :rules="usernameRules" required></v-text-field>
					</v-flex>
					<v-flex xs12 sm6 md6>
						<v-text-field label="Mot de passe"
									  v-model="user.password"
									  :rules="passwordRules"
									  :type="'password'"
									  required autocomplete></v-text-field>
					</v-flex>
				</v-layout>
				<v-btn ref="submit" @click="submit()" :disabled="!valid">Se connecter</v-btn>
			</v-form>
		</v-flex>
	</v-layout>
</template>

<script>
	import 'vue-use-vuex'
	import store from '@/store/UsersStore.js'
	export default {
		name: 'register',
		data () {
			return {
				store: store,
				valid: false,
				user: {
					login: '',
					password: '',
					currentLat: null,
					currentLon: null
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
			let _this = this
			if (this.valid) this.valid = false
			navigator.geolocation.watchPosition(pos => {
				_this.user.currentLat = pos.coords.latitude
				_this.user.currentLon = pos.coords.longitude
			}, e => {
				_this.$http.get('//freegeoip.net/json/?callback=').then(response => {
					_this.user.currentLat = response.body.latitude
					_this.user.currentLon = response.body.longitude
				}, response => {
					console.error("Impossible de géolocaliser l'utilisateur.")
				})
			})
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
				this.$http.post('http://localhost:8081/api/users/login', [this.user], {
					progress (e) {
						_this.$refs['submit'].$options.propsData['disabled'] = true
						_this.$refs['submit'].$el.innerHTML = '<div class="progress-circular progress-circular--indeterminate primary--text" style="height: 32px; width: 32px;"><svg xmlns="http://www.w3.org/2000/svg" viewBox="25 25 50 50" style="transform: rotate(0deg);"><circle fill="transparent" cx="50" cy="50" r="20" stroke-width="4" stroke-dasharray="125.664" stroke-dashoffset="125.66370614359172px" class="progress-circular__overlay"></circle></svg><div class="progress-circular__info"></div></div>'
					}
				}).then(response => {
					if (response.body.type === 'success') {
						this.$ls.set('token', response.body.token, 60 * 60 * 1000 * 24)
						this.valid = false
						this.store.commit('LOGIN')
						this.store.commit('CREATE_USER', this.$jwt.decode(response.body.token).user)
						setTimeout(function () {
							_this.store.commit('DISMISS')
							_this.$router.push('/')
						}, 2000)
					}
					this.$refs['submit'].$el.innerHTML = 'Se connecter'
					this.store.commit('NEW_ALERT', {type: response.body.type, message: response.body.message})
				}, response => {
					this.$refs['submit'].$el.innerHTML = 'Se connecter'
					this.store.commit('NEW_ALERT', {type: 'error', message: 'Impossible de vous inscrire. Une erreur est survenue.'})
				})
			}
		}
	}
</script>
