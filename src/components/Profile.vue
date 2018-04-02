<template>
	<v-layout row wrap>
		<v-alert
			:color="this.store.state.alert.type"
			transition="scale-transition"
			v-model="alert_visible"
			v-html="this.store.state.alert.message"
			dismissible
		>
		</v-alert>
		<v-flex v-if="!loading" xs12>
			<v-alert icon="favorite" :value="true" color="pink" v-if="user.like_me === 1">
				He likes you !
			</v-alert>
			<v-card class="pb-2 pt-2">
				<v-layout row wrap>
					<v-flex xs12 md4 lg6 xl4 class="pl-1 pr-1">
						<v-carousel>
							<v-carousel-item v-for="(picture, index) in user.pictures" :key="index" :src="picture"></v-carousel-item>
						</v-carousel>
					</v-flex>
					<v-flex xs12 md8 lg6 xl8>
						<v-layout row wrap>
							<v-flex xs12>
								<hr>
								<v-layout row wrap>
									<v-flex xs6 sm6 md6>
										<h1 class="text-xs pl-3">{{ user.username }}</h1>
									</v-flex>
									<v-flex xs6 sm6 md6>
										<h1 class="text-xs-right pr-3" v-if="user.connected === 1">{{ user.popularity }}|<v-icon color="green">offline_pin</v-icon></h1>
										<h1 class="text-xs-right pr-3" v-else>{{ user.popularity }}|<v-icon color="red">offline_pin</v-icon><h6>{{ user.last_visit | convDate }}</h6></h1>
									</v-flex>
								</v-layout>
								<hr>
							</v-flex>
							<v-flex xs12 xl6 class="pr-1 pl-1" v-if="user.blocked">
								<v-btn block color="orange">Déjà bloqué</v-btn>
							</v-flex>
							<v-flex xs6 class="pl-1 pr-1 pt-1" v-if="!user.blocked">
								<v-btn v-if="!user.already_like" block outline @click="like()" color="green">Like</v-btn>
								<v-btn v-else block @click="dislike()" color="red">Dislike</v-btn>
							</v-flex>
							<v-flex xs6 class="pr-1 pt-1" v-if="!user.blocked">
								<v-btn block outline color="orange" @click="block()">Bloquer</v-btn>
							</v-flex>
							<v-flex xs12 xl6 class="pr-1 pl-1">
								<v-btn block outline color="red" @click="reportUser">Reporter un faux compte</v-btn>
							</v-flex>
							<v-flex xs12 xl6 class="pt-1 pl-3 pr-3">
								<v-card color="blue">
									<h1 class="text-xs-center">À propos de moi</h1>
									<hr>
									<p class="pl-2 pr-2">
										{{ user.biography }}
									</p>
								</v-card>
							</v-flex>
							<v-flex xs12 xl6 class="pt-1 pl-3 pr-3">
								<v-card color="brown">
									<h1 class="text-xs-center">Mes informations</h1>
									<hr>
									<v-layout row wrap>
										<v-flex xs12 md6>
											<gmap-map
												:center="{ lat: user.latitude, lng: user.longitude}"
												:zoom="16"
												style="width: 100%; height: 200px;"
											>
												<gmap-marker
												:position="{ lat: user.latitude, lng: user.longitude }"
												:clickable="true"
												:draggable="false"
												>
												</gmap-marker>
											</gmap-map>
										</v-flex>
										<v-flex xs12 md6 class="pl-1">
											<v-layout row wrap>
												<v-flex xs9 sm9>
													<h2>{{ user.first_name }} {{ user.last_name }}</h2>
												</v-flex>
												<v-flex xs3 sm3>
													<h3 class="text-xs-right pr-1">{{ user.age }} ans</h3>
												</v-flex>
												<v-flex xs12>
													<h3 class="pr-1">{{ user.gender }} {{ user.sexual_orientation }}</h3>
												</v-flex>
												<v-flex xs12>
													<v-select
														label="tags"
														tags
														chips
														v-model="user.tags"
														readonly
													></v-select>
												</v-flex>
											</v-layout>
										</v-flex>
									</v-layout>
								</v-card>
							</v-flex>
						</v-layout>
					</v-flex>
				</v-layout>
			</v-card>
		</v-flex>
	</v-layout>
</template>

<script>
	import 'vue-use-vuex'
	import store from '@/store/UsersStore.js'
	export default {
		name: 'profile',
		sockets: {
			like_success () {
				this.user.already_like = 1
			},
			dislike_success () {
				this.user.already_like = 0
			},
			user_status (data) {
				if (data.status === 1) this.user.connected = 1
				else this.user.connected = 0
			}
		},
		data () {
			return {
				store,
				loading: true,
				user: {}
			}
		},
		mounted () {
			this.axios.get('/users/' + this.$route.params.id, { headers: { 'Authorization': 'Bearer ' + this.$ls.get('token') } })
				.then(response => {
					if (response.data.status === 0 || !response.data.message) {
						this.$router.push('/search')
					} else {
						this.user = response.data.message[0]
						this.user.pictures = this.user.pictures.split(',')
						switch (this.user.gender) {
						case 'man':
							switch (this.user.sexual_orientation) {
							case 'heterosexual':
								this.user.sexual_orientation = 'Hétérosexuel'
								break
							case 'homosexual':
								this.user.sexual_orientation = 'Homosexuel'
								break
							case 'bisexual':
								this.user.sexual_orientation = 'Bisexuel'
								break
							default:
								console.log('ERREUR')
							}
							break
						case 'woman':
							switch (this.user.sexual_orientation) {
							case 'heterosexual':
								this.user.sexual_orientation = 'Hétérosexuelle'
								break
							case 'homosexual':
								this.user.sexual_orientation = 'Homosexuelle'
								break
							case 'bisexual':
								this.user.sexual_orientation = 'Bisexuelle'
								break
							default:
								console.log('ERREUR')
							}
							break
						}
						this.user.gender = this.user.gender === 'man' ? 'Homme' : 'Femme'
						this.user.tags = this.user.tags ? this.user.tags.split(',') : ''
						this.loading = false
						this.$socket.emit('visit_user', {
							user_source: this.$ls.get('token'),
							user_ID_destination: this.$route.params.id,
							username_destination: this.user.username
						})
						this.$socket.emit('get_user_status', {
							username: this.user.username
						})
					}
				})
				.catch(err => {
					console.log(err)
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
		filters: {
			convDate: function (value) {
				let date = new Date(value)
				return date.toDateString()
			}
		},
		methods: {
			like () {
				this.$socket.emit('like_user', {
					user_source: this.$ls.get('token'),
					user_ID_destination: this.$route.params.id,
					username_destination: this.user.username
				})
			},
			block () {
				this.$socket.emit('block_user', {
					user_source: this.$ls.get('token'),
					user_ID_destination: this.$route.params.id
				})
				this.$router.push('/search')
			},
			reportUser () {
				this.$socket.emit('report_user', {
					user_source: this.$ls.get('token'),
					user_ID_destination: this.$route.params.id
				})
				this.$router.push('/search')
			},
			dislike () {
				this.$socket.emit('dislike_user', {
					user_source: this.$ls.get('token'),
					user_ID_destination: this.$route.params.id,
					username_destination: this.user.username
				})
			}
		}
	}
</script>
