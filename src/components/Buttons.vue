<template>
	<div class="Buttons">
		<div class="row">
			<Button class="myButton" text="C" @clicked='onClickedNumber(0xC)' @touchStart='onTouchStart(0xC)' @touchEnd='onTouchEnd()' />
			<Button class="myButton" text="D" @clicked='onClickedNumber(0xD)' @touchStart='onTouchStart(0xD)' @touchEnd='onTouchEnd()' />
			<Button class="myButton" text="E" @clicked='onClickedNumber(0xE)' @touchStart='onTouchStart(0xE)' @touchEnd='onTouchEnd()' />
			<Button class="myButton" text="F" @clicked='onClickedNumber(0xF)' @touchStart='onTouchStart(0xF)' @touchEnd='onTouchEnd()' />
			<Button class="myButton" text="A SET" @clicked='onClickButton("ASET")'/>
		</div>
		<div class="row">
			<Button class="myButton" text="8" @clicked='onClickedNumber(0x8)' @touchStart='onTouchStart(0x8)' @touchEnd='onTouchEnd()' />
			<Button class="myButton" text="9" @clicked='onClickedNumber(0x9)' @touchStart='onTouchStart(0x9)' @touchEnd='onTouchEnd()' />
			<Button class="myButton" text="A" @clicked='onClickedNumber(0xA)' @touchStart='onTouchStart(0xA)' @touchEnd='onTouchEnd()' />
			<Button class="myButton" text="B" @clicked='onClickedNumber(0xB)' @touchStart='onTouchStart(0xB)' @touchEnd='onTouchEnd()' />
			<Button class="myButton" text="INCR" @clicked='onClickButton("INCR")'/>
		</div>
		<div class="row">
			<Button class="myButton" text="4" @clicked='onClickedNumber(0x4)' @touchStart='onTouchStart(0x4)' @touchEnd='onTouchEnd()' />
			<Button class="myButton" text="5" @clicked='onClickedNumber(0x5)' @touchStart='onTouchStart(0x5)' @touchEnd='onTouchEnd()' />
			<Button class="myButton" text="6" @clicked='onClickedNumber(0x6)' @touchStart='onTouchStart(0x6)' @touchEnd='onTouchEnd()' />
			<Button class="myButton" text="7" @clicked='onClickedNumber(0x7)' @touchStart='onTouchStart(0x7)' @touchEnd='onTouchEnd()' />
			<Button class="myButton" text="RUN" @clicked='onClickButton("RUN")'/>
		</div>
		<div class="row">
			<Button class="myButton" text="0" @clicked='onClickedNumber(0x0)' @touchStart='onTouchStart(0x0)' @touchEnd='onTouchEnd()' />
			<Button class="myButton" text="1" @clicked='onClickedNumber(0x1)' @touchStart='onTouchStart(0x1)' @touchEnd='onTouchEnd()' />
			<Button class="myButton" text="2" @clicked='onClickedNumber(0x2)' @touchStart='onTouchStart(0x2)' @touchEnd='onTouchEnd()' />
			<Button class="myButton" text="3" @clicked='onClickedNumber(0x3)' @touchStart='onTouchStart(0x3)' @touchEnd='onTouchEnd()' />
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

	@Emit()
	public clickNumber(num: number) {
		// note: ignore warning: block is empty
	}

	public onClickedNumber(num: number) {
		this.clickNumber(num);
	}

	@Emit()
	public clickButton(type: 'ASET' | 'INCR' | 'RUN' | 'RESET') {
		if (false) {
		// note: ignore warning: block is empty
		}
	}
	public onClickButton(type: 'ASET' | 'INCR' | 'RUN' | 'RESET') {
		this.clickButton(type);
	}

	// タッチ開始・終了検知

	@Emit()
	public touchStart(num: number) {
		// note: ignore warning: block is empty
	}
	public onTouchStart(num: number) {
		this.touchStart(num);
	}

	@Emit()
	public touchEnd() {
		// note: ignore warning: block is empty
	}
	public onTouchEnd() {
		this.touchEnd();
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
