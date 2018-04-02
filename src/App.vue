<template>
	<v-app dark>
		<v-navigation-drawer
			fixed
			:clipped="$vuetify.breakpoint.width > 1264"
			v-model="drawer"
			class="primary"
			app
		>
			<v-list>
				<div v-if="!this.store.state.logged">
					<router-link :to="{name: 'Register'}" exact tag="v-list-tile">
						<v-list-tile-action>
							<v-icon>account_circle</v-icon>
						</v-list-tile-action>
						<v-list-tile-content>
							<v-list-tile-title>Inscription</v-list-tile-title>
						</v-list-tile-content>
					</router-link>

					<router-link :to="{name: 'Login'}" exact tag="v-list-tile">
						<v-list-tile-action>
							<v-icon>lock_open</v-icon>
						</v-list-tile-action>
						<v-list-tile-content>
							<v-list-tile-title>Connexion</v-list-tile-title>
						</v-list-tile-content>
					</router-link>
				</div>

				<div v-else>
					<router-link :to="{name: 'Search'}" exact tag="v-list-tile">
						<v-list-tile-action>
							<v-icon>home</v-icon>
						</v-list-tile-action>
						<v-list-tile-content>
							<v-list-tile-title>Accueil</v-list-tile-title>
						</v-list-tile-content>
					</router-link>
					<router-link :to="{name: 'Search'}" exact tag="v-list-tile">
						<v-list-tile-action>
							<v-icon>search</v-icon>
						</v-list-tile-action>
						<v-list-tile-content>
							<v-list-tile-title>Rechercher</v-list-tile-title>
						</v-list-tile-content>
					</router-link>
					<router-link :to="{name: 'Suggestions'}" exact tag="v-list-tile">
						<v-list-tile-action>
							<v-icon>people</v-icon>
						</v-list-tile-action>
						<v-list-tile-content>
							<v-list-tile-title>Découvrir</v-list-tile-title>
						</v-list-tile-content>
					</router-link>
					<router-link :to="{name: 'Logout'}" exact tag="v-list-tile">
						<v-list-tile-action>
							<v-icon>play_for_work</v-icon>
						</v-list-tile-action>
						<v-list-tile-content>
							<v-list-tile-title>Déconnexion</v-list-tile-title>
						</v-list-tile-content>
					</router-link>
					<v-subheader>
						Mon compte
					</v-subheader>
					<router-link :to="{name: 'Informations'}" exact tag="v-list-tile">
						<v-list-tile-action>
							<v-icon>info</v-icon>
						</v-list-tile-action>
						<v-list-tile-content>
							<v-list-tile-title>Mes informations</v-list-tile-title>
						</v-list-tile-content>
					</router-link>
					<router-link :to="{name: 'Account'}" exact tag="v-list-tile">
						<v-list-tile-action>
							<v-icon>account_circle</v-icon>
						</v-list-tile-action>
						<v-list-tile-content>
							<v-list-tile-title>Mon compte</v-list-tile-title>
						</v-list-tile-content>
					</router-link>
				</div>

			</v-list>
		</v-navigation-drawer>
		<v-toolbar fixed app :clipped-left="clipped">
			<v-toolbar-side-icon @click.stop="drawer = !drawer"></v-toolbar-side-icon>
			<router-link :to="{name: 'HelloWorld'}" style="cursor: pointer;" exact tag="v-toolbar-title">Matcha</router-link>
			<v-spacer></v-spacer>
			<div v-if="this.store.state.logged">
				<router-link :to="{name: 'Notifications'}" exact tag="span" class="badge badge--left badge--overlap" style="cursor: pointer;" color="primary">
					<span class="badge__badge primary"><span>{{ this.store.state.notifications_count }}</span></span>
					<v-icon
						large
						color="grey darken-1"
					>
						notifications
					</v-icon>
				</router-link>
				<router-link :to="{name: 'Messages'}" exact tag="span" class="badge badge--left badge--overlap" style="cursor: pointer;" color="primary">
					<!--<span class="badge__badge primary"><span>{{ messages_count }}</span></span>-->
					<v-icon
						large
						color="grey darken-1"
					>
						messages
					</v-icon>
				</router-link>
			</div>
		</v-toolbar>
		<v-content dark>
			<v-container fluid>
				<v-slide-y-transition mode="out-in">
					<v-layout row wrap>
						<router-view transition="fade-transition"></router-view>
					</v-layout>
				</v-slide-y-transition>
				<v-snackbar
					:timeout="notification.timeout"
					:color="notification.color"
					:top="true"
					:right="true"
					v-model="notification.active"
				>
					<v-icon>{{ notification.icon }}</v-icon> {{ notification.text }}
					<v-btn dark flat @click.native="notification.active = false">Close</v-btn>
				</v-snackbar>
			</v-container>
		</v-content>
		<v-footer app>
			<span>&copy; dpilarsk | wescande 2018</span>
		</v-footer>
	</v-app>
</template>

<script>
	import store from './store/UsersStore.js'
	export default {
		name: 'app',
		sockets: {
			connect () {
				if (this.store.state.user) {
					this.$socket.emit('connect_user', {'name': this.store.state.user.username})
				}
			},
			error_message (data) {
				this.store.commit('NEW_ALERT', {type: 'error', message: data.message})
				setTimeout(function () {
					this.store.commit('DISMISS')
				}, 2000)
			},
			notification (data) {
				this.notification.text = data.message
				if (data.type !== 'message') {
					if (this.notifications_count < 99) {
						this.store.commit('INS_NOTIFICATION', {count: this.store.state.notifications_count + 1})
					} else {
						this.store.commit('INS_NOTIFICATION', {count: '99+'})
					}
				}
				if (this.store.state.logged) {
					switch (data.type) {
					case 'like':
						this.notification.icon = 'thumb_up'
						this.notification.color = 'green'
						break
					case 'dislike':
						this.notification.icon = 'thumb_down'
						this.notification.color = 'red'
						break
					case 'visit':
						this.notification.icon = 'history'
						this.notification.color = 'grey'
						break
					case 'message':
						this.notification.icon = 'message'
						this.notification.color = 'blue'
						break
					case 'like_back':
						this.notification.icon = 'favorite'
						this.notification.color = 'pink'
						break
					}
					this.notification.active = true
				}
			}
		},
		data () {
			return {
				notifications_count: 0,
				messages_count: 0,
				notification: {
					timeout: 2000,
					color: 'green',
					icon: '',
					text: '',
					active: false
				},
				store: store,
				clipped: true,
				fixed: false,
				drawer: null,
				title: 'Matcha'
			}
		},
		mounted () {
			if (this.store.state.user) {
				this.$socket.emit('connect_user', {'name': this.store.state.user.username})
				this.axios.get('/notifications', { headers: { 'Authorization': 'Bearer ' + this.$ls.get('token') } })
					.then(response => {
						if (response.data.message) {
							response.data.message = response.data.message.filter(r => r.viewed === 0)
							if (response.data.message.length < 99) {
								this.store.commit('INS_NOTIFICATION', {count: response.data.message.length})
							} else {
								this.store.commit('INS_NOTIFICATION', {count: '99+'})
							}
						}
					})
					.catch(err => {
						console.log(err)
					})
			}
		}
	}
</script>
