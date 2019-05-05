<!--

# 2進数LED表現

- GMC4では7つの2進数LEDとして、現在アドレスの表示に使われる
- サービスコールでも表示制御ができる
- (実装しないつもりだけど) 中央LEDはアンプに繋がれており、音声再生時に高速に明滅するんだとか。実装するとしたらWebAudio APIに繋いできっちり明滅させたいところかな……。面倒そうなので多分保留。

-->

<template>
	<div class="leds">
		<p>LEDS</p>
		<Led class="led" :state="led1"/>
		<Led class="led" :state="led2"/>
		<Led class="led" :state="led3"/>
		<Led class="led" :state="led4"/>
		<Led class="led" :state="led5"/>
		<Led class="led" :state="led6"/>
		<Led class="led" :state="led7"/>
	</div>
</template>


<script lang="ts">
/*tslint:disable:no-bitwise*/

import { Component, Prop, Vue } from 'vue-property-decorator';
import Led from './Led.vue';
import Utils from '../pureTypeScriptSrc/gmc4/Utils';

@Component({
	components: {
		Led,
	},
})
export default class Leds extends Vue {

	private led1: boolean = false;
	private led2: boolean = false;
	private led3: boolean = false;
	private led4: boolean = false;
	private led5: boolean = false;
	private led6: boolean = false;
	private led7: boolean = false;

	public Set(num: number): void {
		num = Utils.RoundTo8Bit(num);
		// note: 右が小さい桁なので、評価するindexに注意
		this.led7 = Utils.GetBit(num, 0);
		this.led6 = Utils.GetBit(num, 1);
		this.led5 = Utils.GetBit(num, 2);
		this.led4 = Utils.GetBit(num, 3);
		this.led3 = Utils.GetBit(num, 4);
		this.led2 = Utils.GetBit(num, 5);
		this.led1 = Utils.GetBit(num, 6);
	}

}

</script>

<style lang="scss" scoped>

.leds {
	display: flex;
	width: 100%;
	margin-left: 0;
	margin-right: 0;
	p {
		text-align: left;
		font-weight: bold;
		color: white;
	}
}

.led {
	margin-left: 0.5em;
}
</style>