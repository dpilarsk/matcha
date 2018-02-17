<template>
	<v-layout row wrap>
		<v-alert
			:color="alert.type"
			transition="scale-transition"
			dismissible
			:v-model="alert.visible"
		>
			{{ alert.message }}
		</v-alert>
	</v-layout>
</template>

<script>
	export default {
		name: 'alert',
		data () {
			return {
				alert: {
					visible: true,
					message: 'test',
					type: 'success'
				}
			}
		}
	}
</script>
