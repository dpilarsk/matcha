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
		<v-flex xs6 class="pr-1 pl-1" v-if="store.state.user.valid === true">
			<router-link :to="{name: 'History'}" style="text-decoration: none;">
				<v-btn block color="green">Historique</v-btn>
			</router-link>
		</v-flex>
		<v-flex xs6 class="pr-1 pl-1" v-if="store.state.user.valid === true">
			<router-link :to="{name: 'Like'}" style="text-decoration: none;">
				<v-btn block color="blue">Likes</v-btn>
			</router-link>
		</v-flex>
		<v-flex xs12>
			<h1 class="text-xs-center">Mon compte</h1>
			<div v-if="!loading">
				<div ref="pictures">
					<li v-for="picture in user.pictures" :key="picture.ID" style="display: inline">
						<img :src="picture.path" @click="deletePic(picture.ID + '_' + picture.user_ID)" class="delete" width="100px" :alt="picture.ID">
						<v-btn @click="updateProfilePicture(picture.ID)" v-if="picture.ID !== user.profil_picture">Definir en photo de profil</v-btn>
					</li>
				</div>
				<input ref="fileInput" v-if="this.user.pictures.length < 5" type="file" @change="change">
				<v-form v-if="photo_uploaded" v-model="valid">
					<v-layout row wrap>
						<v-flex xs12 sm6 md6 lg4 class="pb-1 pr-1">
							<v-card class="pb-2">
								<h1 class="text-xs-center">Informations personnelles</h1>
								<hr>
								<br>
								<v-layout row wrap>
									<v-flex xs12 sm6 md6 class="pl-3 pr-3">
										<v-text-field label="Age" v-model="user.age"
													  :rules="ageRules" type="number" required></v-text-field>
									</v-flex>
									<v-flex xs12 sm6 md6 class="pl-3 pr-3">
										<v-select
											:items="gender"
											v-model="user.gender"
											label="Votre sexe ?"
											:rules="genderRules"
											required></v-select>
									</v-flex>
								</v-layout>
								<v-layout row wrap>
									<v-flex xs12 class="pl-3 pr-3">
										<v-select
											:items="sexual_orientation"
											v-model="user.sexual_orientation"
											label="Votre orientation sexuelle ?"
											:rules="sexualOrientationRules"
											required></v-select>
									</v-flex>
								</v-layout>
							</v-card>
						</v-flex>
						<v-flex xs12 sm6 md6 lg4 class="pb-1 pr-1">
							<v-card>
								<h1 class="text-xs-center">Préférences</h1>
								<hr>
								<br>
								<v-layout row wrap>
									<v-flex xs12 class="pl-3 pr-3">
										<v-text-field
											label="Description" v-model="user.biography"
											:rules="biographyRules" multi-line required></v-text-field>
									</v-flex>
									<v-flex xs12 class="pl-3 pr-3">
										Distance : {{ this.user.range }}
										<v-slider
											min="0.5"
											max="150"
											v-model="user.range"
											step="0.5"
											thumb-label
											required
										></v-slider>
									</v-flex>
								</v-layout>
							</v-card>
						</v-flex>
						<v-flex xs12 sm6 md6 lg4 class="pb-1 pr-1">
							<v-card>
								<h1 class="text-xs-center">Localisation</h1>
								<hr>
								<br>
								<v-layout row wrap align-center class="pl-3 pr-3">
									<v-flex xs12>
										<v-text-field
											label="Lieu de départ"
											v-model="map.input.address"
											:rules="locationRules"
											box
											@keyup.enter="setLocation()"
										></v-text-field>
									</v-flex>
									<v-flex xs12 class="text-xs-center">
										<v-btn block @click="setLocation()" color="success">Définir comme lieu actuel</v-btn>
									</v-flex>
								</v-layout>
								<gmap-map
									:center="map.center"
									:zoom="map.zoom"
									style="width: 100%; height: 300px;"
								>
									<gmap-cluster>
										<gmap-marker
											:key="index"
											v-for="(m, index) in map.markers"
											:position="m.position"
											:clickable="true"
											:draggable="false"
											:visible="m.visible"
											@click="map.center=m.position"
										>
										</gmap-marker>
									</gmap-cluster>
								</gmap-map>
							</v-card>
						</v-flex>
						<v-flex xs12 sm6 md6 lg4 class="pb-1 pr-1">
							<v-card class="pb-2">
								<h1 class="text-xs-center">Centres d'intérêts</h1>
								<hr>
								<br>
								<v-layout row wrap>
									<v-flex xs12 class="pl-3 pr-3">
										<v-select
											:items="tagsAvailable"
											v-model="user.tags"
											chips
											tags
											label="Vos centres d'intérêts ?"
											:rules="tagsRules"
											@keyup.enter="checkList()"
											@blur="checkList()"
											required></v-select>
									</v-flex>
								</v-layout>
							</v-card>
						</v-flex>
					</v-layout>
					<v-btn ref="submit" @click="submit()" :disabled="!valid">Compléter mon profil</v-btn>
				</v-form>
			</div>
			<div v-else>
				Loading...
			</div>
		</v-flex>
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
	</v-layout>
</template>

<style>
	.delete {
		transition: all .5s;
	}

	.delete:hover {
		cursor: pointer;
		filter: blur(2px);
	}
</style>

<script>
	import 'vue-use-vuex'
	import store from '@/store/UsersStore.js'
	export default {
		name: 'account',
		sockets: {
			success_change (data) {
				this.user.profil_picture = data.ID
				this.store.commit('NEW_ALERT', {type: 'success', message: 'Votre photo a bien été changée.'})
				setTimeout(function () {
					this.store.commit('DISMISS')
				}, 2000)
			},
			success (data) {
				this.user.pictures.push(data)
				if (this.user.pictures.length === 1) {
					this.user.profil_picture = data.ID
				}
				this.store.commit('NEW_ALERT', {type: 'success', message: 'Votre photo a bien été uploadée.'})
				setTimeout(function () {
					this.store.commit('DISMISS')
				}, 2000)
				let fileInput = this.$refs.fileInput
				fileInput.value = ''
				this.photo_uploaded = true
			},
			delete_success (data) {
				this.user.pictures = this.user.pictures.filter(t => t.ID !== Number(data.id))
				if (!this.user.pictures || this.user.pictures.length === 0) {
					this.photo_uploaded = false
				}
				this.store.commit('NEW_ALERT', {type: 'success', message: 'Votre photo a bien été supprimée.'})
				setTimeout(function () {
					this.store.commit('DISMISS')
				}, 2000)
			}
		},
		data () {
			return {
				store,
				notification: {
					timeout: 2000,
					color: 'green',
					icon: '',
					text: '',
					active: false
				},
				valid: false,
				img: 'a',
				photo_uploaded: false,
				loading: true,
				tagsAvailable: [],
				user: {
					user_id: null,
					age: null,
					gender: null,
					biography: null,
					sexual_orientation: null,
					latitude: null,
					profile: {},
					longitude: null,
					range: null,
					profil_picture: null,
					tags: [],
					pictures: []
				},
				map: {
					center: {lng: 2.349014, lat: 48.864716},
					zoom: 14,
					markers: [
						{
							position: {
								lat: 48.864716,
								lng: 2.349014
							}
						}
					],
					input: {
						address: 'TEST',
						lat: 2.397766,
						lng: 2.349014
					}
				},
				gender: [
					{
						value: 'man',
						text: 'Homme'
					},
					{
						value: 'woman',
						text: 'Femme'
					}
				],
				sexual_orientation: [
					{
						value: 'homosexual',
						text: 'Homosexuel(le)'
					},
					{
						value: 'bisexual',
						text: 'Bisexuel(le)'
					},
					{
						value: 'heterosexual',
						text: 'Hétérosexuel(le)'
					}
				],
				ageRules: [
					v => !!v || 'Votre age est requis',
					v => v >= 18 || 'Vous devez avoir au moins 18 ans pour vous inscrire.',
					v => v <= 200 || 'Vous ne devez pas avoir plus de 200 ans pour vous inscrire.'
				],
				locationRules: [
					v => !!v || 'Votre localisation est requise'
				],
				genderRules: [
					v => !!v || 'Votre sexe est requis.'
				],
				sexualOrientationRules: [
					v => !!v || 'Votre orientation sexuelle est requise.'
				],
				biographyRules: [
					v => !!v || 'Une description de vous est obligatoire.',
					v => (v && v.length >= 10) || 'Votre description est trop courte.',
					v => (v && v.length <= 65535) || 'Votre description est trop longue.'
				],
				tagsRules: [
					v => v.length > 0 || 'Des centres d\'intérêts sont obligatoire.',
					v => (v[v.length - 1] && v[v.length - 1].match('^[a-zA-Z0-9-_\\.]{1,20}$') !== null) || 'Un de vos centres d\'intérêts n\'est pas valide.'
				]
			}
		},
		mounted () {
			let _this = this
			if (this.valid) this.valid = false
			this.user.user_id = this.store.state.user.id
			this.user.age = this.store.state.user.age
			this.user.gender = this.store.state.user.gender
			this.user.biography = this.store.state.user.biography
			this.user.sexual_orientation = this.store.state.user.sexual_orientation
			this.user.range = this.store.state.user.range || 0
			let latitude = JSON.parse(this.$ls.get('latitude'))
			let longitude = JSON.parse(this.$ls.get('longitude'))
			this.axios.get('/profile/' + this.store.state.user.ID)
				.then(response => {
					if (response.data.message && response.data.message.length > 0) {
						this.photo_uploaded = true
						this.user.pictures.push(response.data.message)
						this.user.pictures = this.user.pictures[0]
					} else {
						this.store.commit('NEW_ALERT', {type: 'info', message: 'Veuillez uploader une photo.'})
						setTimeout(function () {
							_this.store.commit('DISMISS')
						}, 2000)
					}
				})
				.catch(err => {
					console.log(err)
				})
			if (latitude !== null && longitude !== null) {
				this.getLocation(latitude, longitude)
			} else {
				navigator.geolocation.watchPosition(pos => {
					this.$ls.set('latitude', pos.coords.latitude)
					this.$ls.set('longitude', pos.coords.longitude)
					this.user.longitude = this.map.input.lng = this.map.center.lng = pos.coords.longitude
					this.user.latitude = this.map.input.lat = this.map.center.lat = pos.coords.latitude
					this.getLocation(JSON.parse(this.$ls.get('latitude')), JSON.parse(this.$ls.get('longitude')))
				}, e => {
					this.axios.get('//freegeoip.net/json/?callback=')
						.then(response => {
							this.$ls.set('latitude', response.data.latitude)
							this.$ls.set('longitude', response.data.longitude)
							this.user.longitude = this.map.input.lng = this.map.center.lng = response.data.longitude
							this.user.latitude = this.map.input.lat = this.map.center.lat = response.data.latitude
							this.getLocation(JSON.parse(this.$ls.get('latitude')), JSON.parse(this.$ls.get('longitude')))
						})
						.catch(err => {
							console.log(err)
						})
				})
			}
		},
		methods: {
			updateProfilePicture: function (id) {
				if (this.user.pictures.length > 1 && id !== this.user.profile_picture) {
					this.$socket.emit('set_profile_pic', {
						'user': this.$ls.get('token'),
						'ID': id
					})
				}
			},
			change: function (e) {
				var input = e.target
				if (input.files && input.files[0]) {
					var reader = new FileReader()
					if (Math.round(input.files[0].size / 1000000) > 50) {
						this.store.commit('NEW_ALERT', { type: 'error', message: 'Your picture is too big.' })
						setTimeout(function () {
							this.store.commit('DISMISS')
						}, 2000)
					} else {
						reader.onload = (e) => {
							var arr = (new Uint8Array(e.target.result)).subarray(0, 4)
							var header = ''
							for (var i = 0; i < arr.length; i++) {
								header += arr[i].toString(16)
							}
							this.img = 'data:image/jpeg;base64, ' + Buffer.from(e.target.result).toString('base64')
							this.$socket.emit('upload_pic', {
								'token': this.$ls.get('token'),
								'user': this.store.state.user.ID,
								'type': header,
								'picture': e.target.result
							})
						}
					}
					reader.readAsArrayBuffer(input.files[0])
				}
			},
			deletePic: function (e) {
				if (this.user.pictures.length > 1) {
					this.$socket.emit('delete_pic', {
						'user': this.store.state.user.ID,
						'ID': e
					})
				}
			},
			setLocation: function () {
				this.axios.get('https://maps.googleapis.com/maps/api/geocode/json?address=' + (this.map.input.address) + '&sensor=true&key=AIzaSyCfnDMO2EoO16mtlYuh6ceq2JbgGFzTEo8')
					.then(response => {
						this.user.latitude = response.data.results[0].geometry.location.lat
						this.user.longitude = response.data.results[0].geometry.location.lng
						this.map.center = this.map.markers[0].position
						this.map.input.address = response.data.results[0].formatted_address
						this.map.markers[0] = {
							position: {
								lat: response.data.results[0].geometry.location.lat,
								lng: response.data.results[0].geometry.location.lng
							},
							visible: true
						}
						this.$ls.set('latitude', this.user.latitude)
						this.$ls.set('longitude', this.user.longitude)
						this.map.center = this.map.markers[0].position
					})
					.catch(err => {
						console.log(err)
					})
			},
			getLocation: function (latitude, longitude) {
				this.loading = true
				this.axios.get('https://maps.googleapis.com/maps/api/geocode/json?latlng=' + (Number(latitude) + ',' + Number(longitude)) + '&sensor=true&key=AIzaSyCfnDMO2EoO16mtlYuh6ceq2JbgGFzTEo8')
					.then(response => {
						if (response.data.results.length > 0) {
							this.map.input.address = response.data.results[0].formatted_address
							this.user.longitude = this.map.input.lng = this.map.center.lng = longitude
							this.user.latitude = this.map.input.lat = this.map.center.lat = latitude
							this.map.markers[0] = {
								position: {
									lat: this.map.input.lat,
									lng: this.map.input.lng
								}
							}
							this.loading = false
						}
					})
					.catch(err => {
						console.log(err)
					})
			},
			checkList: function () {
				this.user.tags = this.user.tags.filter(t => t.match('^[a-zA-Z0-9-_\\.]{1,20}$') !== null)
			},
			submit: function () {
				let _this = this
				this.axios.patch('/users/account', [this.user], { headers: { 'Authorization': 'Bearer ' + this.$ls.get('token') } })
					.then(response => {
						if (response.data.status === 1) {
							this.$ls.set('token', response.data.token, 60 * 60 * 1000 * 24)
							this.store.commit('DELETE_USER')
							this.store.commit('CREATE_USER', this.$jwt.decode(JSON.parse(this.$jwt.getToken()).value).user)
							setTimeout(function () {
								_this.$router.push({ name: 'Search' })
							}, 1200)
						}
						this.notification.text = response.data.message
						this.notification.color = response.data.type
						this.notification.active = false
						this.notification.active = true
					})
					.catch(err => {
						console.log(err)
					})
			}
		},
		watch: {
			photo_uploaded () {
				if (this.photo_uploaded) {
					this.axios.get('/tags')
						.then(response => {
							if (response.data.message) {
								let _this = this
								response.data.message.forEach(t => _this.tagsAvailable.push(t.content))
							}
						})
						.catch(err => {
							console.log(err)
						})
					this.axios.get('/users/' + this.store.state.user.username, { headers: { 'Authorization': 'Bearer ' + this.$ls.get('token') } })
						.then(response => {
							if (response.data.message && response.data.status === 1) {
								response.data.message = response.data.message[0]
								this.user.tags = response.data.message.tags !== null ? response.data.message.tags.split(',') : []
								this.user.age = String(response.data.message.age)
								this.user.gender = response.data.message.gender
								this.user.biography = response.data.message.biography
								this.user.sexual_orientation = response.data.message.sexual_orientation
								this.user.profile.latitude = response.data.message.latitude
								this.user.profile.longitude = response.data.message.longitude
								this.user.range = response.data.message.range
								this.user.profil_picture = response.data.message.profil_picture
							}
						})
						.catch(err => {
							console.log(err)
						})
				}
			}
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
		}
	}
</script>
