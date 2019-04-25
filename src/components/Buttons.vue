<template>
	<div class="Buttons">
		<div class="row">
			<Button class="myButton" text="C" @clicked='onClicked("C")'/>
			<Button class="myButton" text="D" />
			<Button class="myButton" text="E" />
			<Button class="myButton" text="F" />
			<Button class="myButton" text="A SET" />
		</div>
		<div class="row">
			<Button class="myButton" text="8" />
			<Button class="myButton" text="9" />
			<Button class="myButton" text="A" />
			<Button class="myButton" text="B" />
			<Button class="myButton" text="INCR" />
		</div>
		<div class="row">
			<Button class="myButton" text="4" />
			<Button class="myButton" text="5" />
			<Button class="myButton" text="6" />
			<Button class="myButton" text="7" />
			<Button class="myButton" text="RUN" />
		</div>
		<div class="row">
			<Button class="myButton" text="0" />
			<Button class="myButton" text="1" />
			<Button class="myButton" text="2" />
			<Button class="myButton" text="3" />
			<Button class="myButton" text="RESET" />
		</div>
	</div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import Button from './Button.vue';

@Component({
  components: {
    Button,
  },
})

export default class Buttons extends Vue {

	public onClicked(str: string) {
		console.log('Buttons:onClicked(): ' + str);
	}
}

</script>

<style lang="scss" scoped>

$baseBorder : 2px;
$baseWidth: 30px - $baseBorder * 2;
$innerMargin: 3px;
$innerWidth: ($baseWidth - $innerMargin * 2 - $baseBorder * 2);

$shadowOffset : 3px;
$shadowRadius : 2px;

div.Buttons{
	display : flex;
	flex-basis: 100%;
	flex-direction : column;
	border-radius : 10px;
	background : rgba(255,255,255,0.1);
}

div.row{
	display : flex;
}

.myButton{
	display : flex;
	flex-basis: 100%;
	height : 3em;
}



</style>
