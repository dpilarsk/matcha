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
		<v-flex xs12>
			<v-card class="pb-2 pt-2">
				<v-layout row wrap>
					<v-flex xs12 md4 lg6 xl4 class="pl-1 pr-1">
						<v-carousel>
							<v-carousel-item
								src="http://lorempicsum.com/nemo/255/200/2"
							></v-carousel-item>
							<v-carousel-item
								src="http://lorempicsum.com/nemo/255/200/5"
							></v-carousel-item>
							<v-carousel-item
								src="http://lorempicsum.com/up/255/200/5"
							></v-carousel-item>
							<v-carousel-item
								src="http://lorempicsum.com/up/255/200/2"
							></v-carousel-item>
							<v-carousel-item
								src="http://lorempicsum.com/simpsons/255/200/5"
							></v-carousel-item>
						</v-carousel>
					</v-flex>
					<v-flex xs12 md8 lg6 xl8>
						<v-layout row wrap>
							<v-flex xs12>
								<hr>
								<v-layout row wrap>
									<v-flex xs6 sm6 md6>
										<h1 class="text-xs pl-3">< User ></h1>
									</v-flex>
									<v-flex xs6 sm6 md6>
										<h1 class="text-xs-right pr-3">2140|<v-icon color="red">offline_pin</v-icon></h1>
									</v-flex>
								</v-layout>
								<hr>
							</v-flex>
							<v-flex xs6 class="pl-1 pr-1 pt-1">
								<v-btn block outline color="green">Like</v-btn>
							</v-flex>
							<v-flex xs6 class="pr-1 pt-1">
								<v-btn block outline color="orange">Bloquer</v-btn>
							</v-flex>
							<v-flex xs12 class="pr-1 pl-1">
								<v-btn block outline color="red">Reporter un faux compte</v-btn>
							</v-flex>
							<v-flex xs12 xl6 class="pt-1 pl-3 pr-3">
								<v-card color="blue">
									<h1 class="text-xs-center">À propos de moi</h1>
									<hr>
									<p class="pl-2 pr-2">
										Lorem ipsum dolor sit amet, consectetur adipisicing elit. Autem cupiditate deserunt dicta dolore id itaque nulla sequi voluptatibus? Aliquam debitis eaque earum, hic illum mollitia odit quia sunt unde voluptate? <br>
										Lorem ipsum dolor sit amet, consectetur adipisicing elit. Consectetur deleniti eos exercitationem id in odio perspiciatis recusandae soluta. Laborum, nobis, odit! Magni, sunt tenetur? Facere in libero nam repudiandae soluta? <br>
										Lorem ipsum dolor sit amet, consectetur adipisicing elit. Ad alias blanditiis commodi cupiditate dolor inventore ipsum labore minus mollitia nulla obcaecati quis quisquam quos repudiandae similique, sit suscipit, tempora voluptas? <br>
										Lorem ipsum dolor sit amet, consectetur adipisicing elit. Illo, iste, quibusdam. A aliquid cum debitis distinctio expedita explicabo ipsa iste labore, laboriosam libero mollitia nihil quia quis quisquam quos repellendus. <br>
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
												:center="{ lat: 48.856614, lng: 2.3522219 }"
												:zoom="16"
												style="width: 100%; height: 200px;"
											>
												<!--<gmap-cluster>-->
												<!--<gmap-marker-->
												<!--:key="index"-->
												<!--v-for="(m, index) in map.markers"-->
												<!--:position="m.position"-->
												<!--:clickable="true"-->
												<!--:draggable="false"-->
												<!--:visible="m.visible"-->
												<!--@click="map.center=m.position"-->
												<!--&gt;-->
												<!--</gmap-marker>-->
												<!--</gmap-cluster>-->
											</gmap-map>
										</v-flex>
										<v-flex xs12 md6 class="pl-1">
											<v-layout row wrap>
												<v-flex xs9 sm9>
													<h2>Prenom Nom</h2>
												</v-flex>
												<v-flex xs3 sm3>
													<h3 class="text-xs-right pr-1">29 ans</h3>
												</v-flex>
												<v-flex xs12>
													<h3 class="pr-1">Homme Heterosexuel</h3>
												</v-flex>
												<v-flex xs12>
													<v-select label="tags"></v-select>
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
		data () {
			return {
				store
			}
		},
		mounted () {
			this.$socket.emit('connect_user', {'name': this.store.state.user.username})
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
