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
					<v-flex xs12 sm6 md6 class="pb-1 pr-1">
						<v-text-field
							label="Prénom"
							v-model="user.first_name"
							:rules="nameRules"
							required></v-text-field>
					</v-flex>
					<v-flex xs12 sm6 md6 class="pb-1 pr-1">
						<v-text-field
							label="Nom"
							v-model="user.last_name"
							:rules="nameRules"
							required></v-text-field>
					</v-flex>
				</v-layout>
				<v-layout row wrap>
					<v-flex xs12 sm6 md6 class="pb-1 pr-1">
						<v-text-field
							label="Nom d'utilisateur"
							v-model="user.username"
							:rules="usernameRules"
							:counter="12"
							readonly></v-text-field>
					</v-flex>
					<v-flex xs12 sm6 md6 class="pb-1 pr-1">
						<v-text-field
							label="Adresse E-mail"
							v-model="user.email"
							:rules="emailRules"
							type="email"
							required></v-text-field>
					</v-flex>
				</v-layout>
				<v-layout row wrap>
					<v-flex xs12 sm6 md6 class="pb-1 pr-1">
						<v-text-field
							label="Mot de passe"
							v-model="user.password"
							:rules="passwordRules"
							hint="Au moins 8 caractères (1 majuscule, 1 minuscule, 1 chiffre, 1 caractère spécial)."
							min="8"
							type="password"
							required></v-text-field>
					</v-flex>
					<v-flex xs12 sm6 md6 class="pb-1 pr-1">
						<v-text-field
							label="Confirmation du mot de passe"
							v-model="user.passwordConfirm"
							:rules="passwordConfirmRules"
							min="8"
							type="password"
							required></v-text-field>
					</v-flex>
				</v-layout>
				<v-btn ref="submit" block @click="submit" :disabled="!valid">Changer mes informations</v-btn>
			</v-form>
		</v-flex>
	</v-layout>
</template>

<script>
	import 'vue-use-vuex'
	import store from '@/store/UsersStore.js'
	export default {
		name: 'informations',
		data () {
			return {
				store,
				valid: false,
				user: {
					first_name: '',
					last_name: '',
					username: '',
					email: '',
					password: '',
					passwordConfirm: ''
				},
				nameRules: [
					v => !!v || 'Ce champ est requis.'
				],
				usernameRules: [
					v => !!v || 'Un nom d\'utilisateur est requis.',
					v => v.length >= 3 || 'Votre nom d\'utilisateur doit comporter au moins 3 caractères.',
					v => v.length <= 12 || 'Votre nom d\'utilisateur ne doit pas comporter plus de 12 caractères.'
				],
				emailRules: [
					v => !!v || 'Votre email est requis.',
					v => v.match('^[a-zA-Z0-9.!#$%&\'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$') !== null || 'Votre adresse email est invalide.'
				],
				passwordRules: [
					v => !!v || 'Un mot de passe est requis.',
					v => v.length >= 8 || 'Votre mot de passe doit faire au moins 8 caractères.',
					v => v.length <= 50 || 'Votre mot de passe ne doit pas faire plus de 50 caractères.',
					v => v.match('^(?=.*[A-Z])(?=.*\\d)(?=.*[$@$!%*?&])[A-Za-z\\d$@$!%*?&]') !== null || 'Votre mot de passe ne respecte pas le minimum recommandé.'
				],
				passwordConfirmRules: [
					v => !!v || 'La confirmation de votre mot de passe est nécessaire.',
					v => v === this.user.password || 'Vos mots de passe ne correspondent pas.'
				]
			}
		},
		mounted () {
			if (this.valid) this.valid = false
			this.user.first_name = this.store.state.user.first_name
			this.user.last_name = this.store.state.user.last_name
			this.user.username = this.store.state.user.username
			this.user.email = this.store.state.user.email
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
				this.axios.patch('/users/informations', [this.user], { headers: { 'Authorization': 'Bearer ' + this.$ls.get('token') } })
					.then(response => {
						if (response.data.message) {
							this.$ls.set('token', response.data.token, 60 * 60 * 1000 * 24)
							this.store.commit('DELETE_USER')
							this.store.commit('CREATE_USER', this.$jwt.decode(JSON.parse(this.$jwt.getToken()).value).user)
							this.store.commit('NEW_ALERT', {type: response.data.type, message: response.data.message})
						} else {
							this.store.commit('NEW_ALERT', {type: 'error', message: 'Une erreur est survenue.'})
						}
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
