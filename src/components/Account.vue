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
			<h1 class="text-xs-center">Mon compte</h1>
			<div v-if="!loading">
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
										<v-text-field label="Description" v-model="user.biography"
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
				<div v-else>
					<input type="file" @change="change">
					<img :src="img" width="50%" alt="1">
				</div>
			</div>
			<div v-else>
				Loading...
			</div>
		</v-flex>
	</v-layout>
</template>

<script>
	import 'vue-use-vuex'
	import store from '@/store/UsersStore.js'
	export default {
		name: 'account',
		sockets: {
			error_message (data) {
				this.store.commit('NEW_ALERT', {type: 'error', message: data.message})
				setTimeout(function () {
					this.store.commit('DISMISS')
				}, 2000)
			},
			success () {
				this.photo_uploaded = true
			}
		},
		data () {
			return {
				store,
				valid: false,
				img: 'a',
				photo_uploaded: false,
				loading: true,
				tagsAvailable: ['test1', 'test2', 'test3'],
				user: {
					user_id: null,
					age: null,
					gender: null,
					biography: null,
					sexual_orientation: null,
					latitude: null,
					longitude: null,
					range: null,
					profile_picture: null,
					tags: []
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
					v => v <= 99 || 'Vous ne devez pas avoir plus de 99 ans pour vous inscrire.'
				],
				genderRules: [
					v => !!v || 'Votre sexe est requis.'
				],
				sexualOrientationRules: [
					v => !!v || 'Votre orientation sexuelle est requise.'
				],
				biographyRules: [
					v => !!v || 'Une description de vous est obligatoire.'
				],
				tagsRules: [
					v => v.length > 0 || 'Des centres d\'intérêts sont obligatoire.'
				]
			}
		},
		mounted () {
			if (this.valid) this.valid = false
			this.user.user_id = this.store.state.user.id
			this.user.age = this.store.state.user.age
			this.user.gender = this.store.state.user.gender
			this.user.biography = this.store.state.user.biography
			this.user.sexual_orientation = this.store.state.user.sexual_orientation
			this.user.range = this.store.state.user.range || 0
			let latitude = JSON.parse(this.$ls.get('latitude'))
			let longitude = JSON.parse(this.$ls.get('longitude'))
			this.$http.get('http://localhost:8081/api/profile/' + this.store.state.user.ID).then(response => {
				if (response.body.message.length > 0) {
					this.photo_uploaded = true
				}
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
					this.$http.get('//freegeoip.net/json/?callback=').then(response => {
						this.$ls.set('latitude', response.body.latitude)
						this.$ls.set('longitude', response.body.longitude)
						this.user.longitude = this.map.input.lng = this.map.center.lng = response.body.longitude
						this.user.latitude = this.map.input.lat = this.map.center.lat = response.body.latitude
						this.getLocation(JSON.parse(this.$ls.get('latitude')), JSON.parse(this.$ls.get('longitude')))
					}, response => {
						console.error("Impossible de géolocaliser l'utilisateur.")
					})
				})
			}
		},
		methods: {
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
								'user': this.store.state.user.ID,
								'type': header,
								'picture': e.target.result
							})
						}
					}
					reader.readAsArrayBuffer(input.files[0])
				}
			},
			setLocation: function () {
				this.$http.get('https://maps.googleapis.com/maps/api/geocode/json?address=' + (this.map.input.address) + '&sensor=true&key=AIzaSyCfnDMO2EoO16mtlYuh6ceq2JbgGFzTEo8').then(response => {
					this.user.latitude = response.body.results[0].geometry.location.lat
					this.user.longitude = response.body.results[0].geometry.location.lng
					this.map.center = this.map.markers[0].position
					this.map.input.address = response.body.results[0].formatted_address
					this.map.markers[0] = {
						position: {
							lat: response.body.results[0].geometry.location.lat,
							lng: response.body.results[0].geometry.location.lng
						},
						visible: true
					}
					this.$ls.set('latitude', this.user.latitude)
					this.$ls.set('longitude', this.user.longitude)
					this.map.center = this.map.markers[0].position
				}, response => {
					console.error(response)
				})
			},
			getLocation: function (latitude, longitude) {
				this.loading = true
				this.$http.get('https://maps.googleapis.com/maps/api/geocode/json?latlng=' + (Number(latitude) + ',' + Number(longitude)) + '&sensor=true&key=AIzaSyCfnDMO2EoO16mtlYuh6ceq2JbgGFzTEo8').then(response => {
					this.map.input.address = response.body.results[0].formatted_address
					this.user.longitude = this.map.input.lng = this.map.center.lng = longitude
					this.user.latitude = this.map.input.lat = this.map.center.lat = latitude
					this.map.markers[0] = {
						position: {
							lat: this.map.input.lat,
							lng: this.map.input.lng
						}
					}
					this.loading = false
				}, response => {
					console.error(response)
				})
			},
			checkList: function () {
				this.user.tags = this.user.tags.filter(t => t.trim().length > 0)
			},
			submit: function () {
				let _this = this
				this.$http.patch('http://localhost:8081/api/users/account', [this.user], {headers: {'Authorization': 'Basic ' + this.$ls.get('token')}}, {
					progress (e) {
						_this.$refs['submit'].$options.propsData['disabled'] = true
						_this.$refs['submit'].$el.innerHTML = '<div class="progress-circular progress-circular--indeterminate primary--text" style="height: 32px; width: 32px;"><svg xmlns="http://www.w3.org/2000/svg" viewBox="25 25 50 50" style="transform: rotate(0deg);"><circle fill="transparent" cx="50" cy="50" r="20" stroke-width="4" stroke-dasharray="125.664" stroke-dashoffset="125.66370614359172px" class="progress-circular__overlay"></circle></svg><div class="progress-circular__info"></div></div>'
					}
				}).then(response => {
					this.$refs['submit'].$el.innerHTML = 'Changer mes informations'
//					this.$ls.set('token', response.body.token, 60 * 60 * 1000 * 24)
//					this.store.commit('DELETE_USER')
//					this.store.commit('CREATE_USER', this.$jwt.decode(JSON.parse(this.$jwt.getToken()).value).user)
					this.store.commit('NEW_ALERT', {type: response.body.type, message: response.body.message})
					setTimeout(function () {
						_this.store.commit('DISMISS')
					}, 2000)
				}, response => {
					this.$refs['submit'].$el.innerHTML = 'S\'inscrire'
					this.store.commit('NEW_ALERT', {type: 'error', message: 'Impossible de changer vos informations. Une erreur est survenue.'})
					setTimeout(function () {
						_this.store.commit('DISMISS')
					}, 2000)
				})
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
