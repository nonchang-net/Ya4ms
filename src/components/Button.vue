<template>
	<div class="Button">
		<div class="inner" @click="onClick">
			<p>{{ text }}</p>
		</div>
	</div>
</template>

<script lang="ts">
import { Component, Emit, Prop, Vue } from 'vue-property-decorator';

@Component
export default class Button extends Vue {
	@Prop() private text!: string;

	// @Emit()
	// public clicked() {
	// 	if (false) { console.log('TODO: ignore warning : block is empty'); }
	// }

	// public GetText(): string {
	// 	return this.text;
	// }

	@Emit('clicked')
	public onClick() {
		// console.log('CLICK() ' + this.text);
		// this.clicked();
	}

}

</script>

<style scoped>

div.Button{
	padding : 3px;
}

div.Button .inner{
	width : 100%;
	height : 100%;
	border : 1px solid gray;
	border-radius: 5px;
	background: #344;

	display : flex;
	align-items: center;
	justify-content: center;
}

div.Button .inner:hover{
	background: rgb(57, 77, 77);
}

div.Button .inner:active{
	background: rgb(90, 116, 116);
}

p{
  text-align : center;
  font-weight : bold;
  color : white;
}


</style>
