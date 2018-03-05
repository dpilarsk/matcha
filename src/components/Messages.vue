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
			<v-flex xs3 sm3 md2>
				<v-card style="height: 400px;overflow: auto;">
					<v-list subheader>
						<v-subheader>Amis</v-subheader>
						<v-divider></v-divider>
						<v-list-tile avatar @click="">
							<v-list-tile-avatar><img src="https://vuetifyjs.com/static/doc-images/lists/1.jpg" alt="1"></v-list-tile-avatar>
							<v-list-tile-content>
							</v-list-tile-content>
						</v-list-tile>
						<v-divider></v-divider>
						<v-list-tile avatar @click="">
							<v-list-tile-avatar><img src="https://vuetifyjs.com/static/doc-images/lists/1.jpg" alt="1"></v-list-tile-avatar>
							<v-list-tile-content>
							</v-list-tile-content>
						</v-list-tile>
						<v-divider></v-divider>
						<v-list-tile avatar @click="">
							<v-list-tile-avatar><img src="https://vuetifyjs.com/static/doc-images/lists/1.jpg" alt="1"></v-list-tile-avatar>
							<v-list-tile-content>
							</v-list-tile-content>
						</v-list-tile>
						<v-divider></v-divider>
						<v-list-tile avatar @click="">
							<v-list-tile-avatar><img src="https://vuetifyjs.com/static/doc-images/lists/1.jpg" alt="1"></v-list-tile-avatar>
							<v-list-tile-content>
							</v-list-tile-content>
						</v-list-tile>
						<v-divider></v-divider>
						<v-list-tile avatar @click="">
							<v-list-tile-avatar><img src="https://vuetifyjs.com/static/doc-images/lists/1.jpg" alt="1"></v-list-tile-avatar>
							<v-list-tile-content>
							</v-list-tile-content>
						</v-list-tile>
						<v-divider></v-divider>
						<v-list-tile avatar @click="">
							<v-list-tile-avatar><img src="https://vuetifyjs.com/static/doc-images/lists/1.jpg" alt="1"></v-list-tile-avatar>
							<v-list-tile-content>
							</v-list-tile-content>
						</v-list-tile>
						<v-divider></v-divider>
						<v-list-tile avatar @click="">
							<v-list-tile-avatar><img src="https://vuetifyjs.com/static/doc-images/lists/1.jpg" alt="1"></v-list-tile-avatar>
							<v-list-tile-content>
							</v-list-tile-content>
						</v-list-tile>
						<v-divider></v-divider>
						<v-list-tile avatar @click="">
							<v-list-tile-avatar><img src="https://vuetifyjs.com/static/doc-images/lists/1.jpg" alt="1"></v-list-tile-avatar>
							<v-list-tile-content>
							</v-list-tile-content>
						</v-list-tile>
						<v-divider></v-divider>
						<v-list-tile avatar @click="">
							<v-list-tile-avatar><img src="https://vuetifyjs.com/static/doc-images/lists/1.jpg" alt="1"></v-list-tile-avatar>
							<v-list-tile-content>
							</v-list-tile-content>
						</v-list-tile>
						<v-divider></v-divider>
						<v-list-tile avatar @click="">
							<v-list-tile-avatar><img src="https://vuetifyjs.com/static/doc-images/lists/1.jpg" alt="1"></v-list-tile-avatar>
							<v-list-tile-content>
							</v-list-tile-content>
						</v-list-tile>
						<v-divider></v-divider>
						<v-list-tile avatar @click="">
							<v-list-tile-avatar><img src="https://vuetifyjs.com/static/doc-images/lists/1.jpg" alt="1"></v-list-tile-avatar>
							<v-list-tile-content>
							</v-list-tile-content>
						</v-list-tile>
						<v-divider></v-divider>
						<v-list-tile avatar @click="">
							<v-list-tile-avatar><img src="https://vuetifyjs.com/static/doc-images/lists/1.jpg" alt="1"></v-list-tile-avatar>
							<v-list-tile-content>
							</v-list-tile-content>
						</v-list-tile>
						<v-divider></v-divider>
						<v-list-tile avatar @click="">
							<v-list-tile-avatar><img src="https://vuetifyjs.com/static/doc-images/lists/1.jpg" alt="1"></v-list-tile-avatar>
							<v-list-tile-content>
							</v-list-tile-content>
						</v-list-tile>
						<v-divider></v-divider>
						<v-list-tile avatar @click="">
							<v-list-tile-avatar><img src="https://vuetifyjs.com/static/doc-images/lists/1.jpg" alt="1"></v-list-tile-avatar>
							<v-list-tile-content>
							</v-list-tile-content>
						</v-list-tile>
						<v-divider></v-divider>
						<v-list-tile avatar @click="">
							<v-list-tile-avatar><img src="https://vuetifyjs.com/static/doc-images/lists/1.jpg" alt="1"></v-list-tile-avatar>
							<v-list-tile-content>
							</v-list-tile-content>
						</v-list-tile>
						<v-divider></v-divider>
						<v-list-tile avatar @click="">
							<v-list-tile-avatar><img src="https://vuetifyjs.com/static/doc-images/lists/1.jpg" alt="1"></v-list-tile-avatar>
							<v-list-tile-content>
							</v-list-tile-content>
						</v-list-tile>
						<v-divider></v-divider>
						<v-list-tile avatar @click="">
							<v-list-tile-avatar><img src="https://vuetifyjs.com/static/doc-images/lists/1.jpg" alt="1"></v-list-tile-avatar>
							<v-list-tile-content>
							</v-list-tile-content>
						</v-list-tile>
					</v-list>
				</v-card>
			</v-flex>
			<v-flex xs9 sm9 md10>
				<v-card style="height: 400px;overflow: auto;">
					<h2 class="text-xs-center">John Doe</h2>
					<hr>
					<v-card style="height: 293px;overflow: auto;">
						<v-layout row wrap>
							<v-flex xs12 class="pl-2 pt-2 pb-2">
								<v-layout row wrap>
									<v-flex xs3>
										<v-card color="primary">
											tttt
										</v-card>
									</v-flex>
									<v-flex xs3 offset-xs9 class="pr-2">
										<v-card color="green">
											tttt
										</v-card>
									</v-flex>
								</v-layout>
							</v-flex>
						</v-layout>
					</v-card>
					<v-layout row wrap>
						<v-flex xs10>
							<v-text-field></v-text-field>
						</v-flex>
						<v-flex xs2>
							<v-btn outline large color="primary">
								<v-icon>send</v-icon>
							</v-btn>
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
		name: 'messages',
		data () {
			return {
				store
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
