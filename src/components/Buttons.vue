<template>
	<div class="Buttons">
		<div class="row">
			<Button class="myButton" text="C" @clicked='onClickedNumber(0xC)'/>
			<Button class="myButton" text="D" @clicked='onClickedNumber(0xD)'/>
			<Button class="myButton" text="E" @clicked='onClickedNumber(0xE)'/>
			<Button class="myButton" text="F" @clicked='onClickedNumber(0xF)'/>
			<Button class="myButton" text="A SET" @clicked='onClickButton("ASET")'/>
		</div>
		<div class="row">
			<Button class="myButton" text="8" @clicked='onClickedNumber(0x8)'/>
			<Button class="myButton" text="9" @clicked='onClickedNumber(0x9)'/>
			<Button class="myButton" text="A" @clicked='onClickedNumber(0xA)'/>
			<Button class="myButton" text="B" @clicked='onClickedNumber(0xB)'/>
			<Button class="myButton" text="INCR" @clicked='onClickButton("INCR")'/>
		</div>
		<div class="row">
			<Button class="myButton" text="4" @clicked='onClickedNumber(0x4)'/>
			<Button class="myButton" text="5" @clicked='onClickedNumber(0x5)'/>
			<Button class="myButton" text="6" @clicked='onClickedNumber(0x6)'/>
			<Button class="myButton" text="7" @clicked='onClickedNumber(0x7)'/>
			<Button class="myButton" text="RUN" @clicked='onClickButton("RUN")'/>
		</div>
		<div class="row">
			<Button class="myButton" text="0" @clicked='onClickedNumber(0x0)'/>
			<Button class="myButton" text="1" @clicked='onClickedNumber(0x1)'/>
			<Button class="myButton" text="2" @clicked='onClickedNumber(0x2)'/>
			<Button class="myButton" text="3" @clicked='onClickedNumber(0x3)'/>
			<Button class="myButton" text="RESET" @clicked='onClickButton("RESET")'/>
		</div>
	</div>
</template>

<script lang="ts">
import { Component, Emit, Prop, Vue } from 'vue-property-decorator';
import Button from './Button.vue';

@Component({
  components: {
    Button,
  },
})

export default class Buttons extends Vue {

	// public LastSelected: number = -1;

	@Emit()
	public clickNumber(num: number) {
		// console.log('Buttons.vue: clickNumber(): ' + num);
		if (false) {
			console.log('TODO: ignore warning: block is empty');
		}
	}

	public onClickedNumber(num: number) {
		// console.log('Buttons.vue: onClicked(): ' + num);
		// this.LastSelected = num;
		this.clickNumber(num);
	}

	@Emit()
	public clickButton(type: 'ASET' | 'INCR' | 'RUN' | 'RESET') {
		if (false) {
			console.log('TODO: ignore warning: block is empty');
		}
	}
	public onClickButton(type: 'ASET' | 'INCR' | 'RUN' | 'RESET') {
		this.clickButton(type);
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
