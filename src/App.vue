<template>
	<div id="app">
		<header>
			<h1>Ya4ms: Yet Another 4bit Micon Simulator</h1>
			<p>ver: 2019 0506 0023</p>
		</header>

		<div class="board">
			<div class="container-item">
				
				<Leds ref="binaryLeds" />

				<div class="sevenSegAndDumpView">
					
					<DumpView ref="dumpView"/>

					<div class="sevenSegmentWrapper">
						<SevenSegment ref="sevenSegment" class="SevenSegment"/>
					</div>
				</div>

				<div class="programMemory">
					<p>PROGRAM MEMORY:</p>
					<div class="programMemoryText" ref="programMemory" v-html="dumpedProgramMemory" />
					</div>

				<div class="programInput">
					<p>PROGRAM INPUT:</p>
					<input type="text" ref="testCode" value="8A91">
					<div class="buttons">
						<Button class="myButton" text="SET TO MEMORY" @clicked='onClickProgramInputSetToMemory()'/>
						<Button class="myButton" text="SET AND RUN" @clicked='onClickProgramInputSetAndRun()'/>
						<Button class="myButton" text="HARD RESET" @clicked='onClickHardReset()'/>
					</div>
				</div>
			</div>

			<div class="container-item">
				<Buttons
					class="Buttons"
					ref="buttons"
					@click-number="onClickNumber"
					@click-button="onClickButton"
				/>
			</div>
		</div>
		<hr>

		<div class="sampleCodes">
			<h2>サンプルコード</h2>
			<dl>
				<dt>0.5秒置きにLEDが1,2,3と変化するコード</dt>
				<dd>811 85EC 821 85EC 831</dd>
			</dl>
		</div>

		<a href="https://github.com/nonchang-net/Ya4ms">Fork me on GitHub</a>

		<!--github ribbon-->
		<!-- <span id="forkongithub">
			<a href="https://github.com/nonchang-net/Ya4ms">Fork me on GitHub</a>
		</span> -->

	</div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import Buttons from './components/Buttons.vue';
import Button from './components/Button.vue';
import SevenSegment from './components/SevenSegment.vue';
import Leds from './components/Leds.vue';
import DumpView from './components/DumpView/DumpView.vue';

import GMC4 from './pureTypeScriptSrc/gmc4/gmc4';
import { Calls } from './pureTypeScriptSrc/gmc4/Enums';

import Beep from './pureTypeScriptSrc/Sound/Beep';

@Component({
	components: {
		Buttons,
		Button,
		SevenSegment,
		Leds,
		DumpView,
	},
})
export default class App extends Vue {


	private sevenSegment: SevenSegment;
	private binaryLeds: Leds;
	private gmc4: GMC4;
	private beep: Beep;

	private innerDumpedProgramMemory: string = '';
	public get dumpedProgramMemory() {
		return this.innerDumpedProgramMemory;
	}

	// キーバッファ
	// - ASETボタンが押された時、直前の入力二つを繋げてアドレスとする必要がある
	// - 直前の入力は表示中のLEDを使い、
	private keyBuffer: number = 0;

	constructor() {
		super();
		// const myTest: MyTest = new MyTest('test string here!');
		// console.log('mytest.GetTest(): ' + myTest.GetTest());

		// TODO: ここでは取れない。コンパイルエラー対策で一応記述
		this.sevenSegment = this.$refs.sevenSegment as SevenSegment;
		// TODO: ここでは取れない。コンパイルエラー対策で一応記述
		this.binaryLeds = this.$refs.binaryLeds as Leds;

		this.gmc4 = new GMC4();
		this.beep = new Beep();
	}

	public mounted() {
		// 遅延初期化
		if (!this.sevenSegment) {
			// undone: もっといい書き方ないのかな。いちいちダウンキャストしたくない
			this.sevenSegment = this.$refs.sevenSegment as SevenSegment;
		}
		if (!this.binaryLeds) {
			this.binaryLeds = this.$refs.binaryLeds as Leds;
		}

		// 7セグ表示を初期化
		this.sevenSegment.Set(0x0);

		// 2進Ledsを初期化
		this.binaryLeds.Set(0x0);

		// コールバック定義
		this.gmc4.SetCallback( async (arg1, arg2?) => {
			// console.log(`gmc4.callback called: ${arg1} ${arg2}`);

			switch (arg1) {
				case Calls.SetSevenSegment:
					if (!arg2) {
						throw new Error(`[Opcode 0x1: AO] missing argument error: Calls.SetSevenSegmentには第二引数が必要です`);
					}
					this.sevenSegment.Set(arg2);
					return 0;

				case Calls.BeepShort:
					await this.beep.PlayShort();
					return 0;

				case Calls.BeepLong:
					await this.beep.PlayLong();
					return 0;

				case Calls.BeepEnd:
					await this.beep.PlayEnd();
					return 0;

				case Calls.BeepError:
					await this.beep.PlayError();
					return 0;

				// TODO: 他のサービスはまだ。
			}
			return 0;
		});

		// dumpコールバック設定
		this.gmc4.SetDebugCallback((dumps) => {
			(this.$refs.dumpView as any).Set(dumps);

			let dumpProgram = '';
			for (let i = 0 ; i < dumps.program.length; i++) {
				if (i !== 0) {
					if (i % 32 === 0) {
						dumpProgram += '<br />';
					} else if (i % 16 === 0) {
						dumpProgram += '  ';
					} else if (i % 4 === 0) {
						dumpProgram += ' ';
					}
				}
				dumpProgram += dumps.program[i].toString(16).toUpperCase();
			}
			this.innerDumpedProgramMemory = dumpProgram;

		});

		// 初回dump
		this.gmc4.DoDumpCallback();
	}

	public onClickNumber(num: number) {
		// console.log('App.vue: onClickButton() num:', num);
		this.sevenSegment.Set(num);
	}

	public onClickButton(type: 'ASET' | 'INCR' | 'RUN' | 'RESET') {

		switch (type) {

			case 'ASET':
				this.beep.PlayShort();
				this.gmc4.SetAddress(this.sevenSegment.buffer * 0x10 + this.sevenSegment.num);
				this.binaryLeds.Set(this.gmc4.GetCurrentStep());
				this.sevenSegment.Set(this.gmc4.GetCurrentAddressValue());
				this.gmc4.DoDumpCallback();
				break;

			case 'INCR':
				this.beep.PlayShort();
				this.gmc4.IncrementAddress(this.sevenSegment.num);
				this.binaryLeds.Set(this.gmc4.GetCurrentStep());
				this.sevenSegment.Set(this.gmc4.GetCurrentAddressValue());
				this.gmc4.DoDumpCallback();

				break;

			case 'RUN':

				// 1,2,5,6以外だったらエラー音を出してコンソールに注意出力
				// UNDONE: 組み込みアプリ実行の実装予定はありません
				if (
					this.sevenSegment.num !== 1 &&
					this.sevenSegment.num !== 2 &&
					this.sevenSegment.num !== 5 &&
					this.sevenSegment.num !== 6
				) {
					this.beep.PlayError();
					console.log(`error: 未実装: RUNボタンは7セグ表示が1,2,5,6の時のみ実行可能です`);
					return;
				}

				this.beep.PlayShort();
				this.gmc4.Run();
				break;

			case 'RESET':
				this.gmc4.Reset();
				this.binaryLeds.Set(this.gmc4.GetCurrentStep());
				this.sevenSegment.Set(this.gmc4.GetCurrentAddressValue());
				this.gmc4.DoDumpCallback();
				break;

		}
	}

	public onClickProgramInputSetToMemory() {
		this.gmc4.HardReset();
		const code: string = (this.$refs.testCode as HTMLInputElement).value;
		this.gmc4.SetCode(code);
		this.binaryLeds.Set(this.gmc4.GetCurrentStep());
		this.sevenSegment.Set(this.gmc4.GetCurrentAddressValue());
		this.gmc4.DoDumpCallback();
	}

	public onClickProgramInputSetAndRun() {
		this.onClickProgramInputSetToMemory();
		this.gmc4.Run();
	}

	public onClickHardReset() {
		this.gmc4.HardReset();
		this.binaryLeds.Set(this.gmc4.GetCurrentStep());
		this.sevenSegment.Set(this.gmc4.GetCurrentAddressValue());
		this.gmc4.DoDumpCallback();
	}
}
</script>

<style lang="scss">
*,
*:before,
*:after {
	box-sizing: border-box;
	margin: 0;
	padding: 0;
}

#app {
	font-family: "Avenir", Helvetica, Arial, sans-serif;
	-webkit-font-smoothing: antialiased;
	-moz-osx-font-smoothing: grayscale;
	text-align: center;
	color: #2c3e50;
}

header {
	color: white;
	background: rgb(53, 122, 32);
	padding-bottom: 1em;
	padding-top: 1em;
	margin: 0;
}

.sampleCodes {
	margin: 1em;
	font-size: 12px;
	text-align: left;
	padding: 5px;
	border: 1px solid gray;
	border-radius: 5px;
	background: #eee;

	h2 {
		font-size: 14px;
		border-bottom: 1px solid gray;
	}
	dl {
		margin-top: 5px;
	}
	dt {
		border-left: 5px solid gray;
		padding-left: 5px;
		font-weight: bold;
	}
	dd {
		border: none;
		margin-left: 10px;
		font-weight: normal;
	}
}

.board {
	display: flex;
	width: 100%;

	background: rgb(53, 122, 32);
	padding: 1em;
}

.container-item {
	flex-basis: 100%;
}


// ボタンセット全体
.Buttons {
	border: 2px solid rgb(34, 58, 27);
	width: 100%;
}

// 7セグ
.sevenSegAndDumpView {
	display: flex;
}

.sevenSegmentWrapper {
	padding: 5px;
	height: 80px;
	width: 50px;
	background: #333;
	border-radius: 5px;
}

.SevenSegment {
	transform: skewX(-5deg);
}

// プログラムメモリ表示＋入力枠

@mixin label{
	text-align: left;
	font-weight: bold;
	color: white;
	margin-right: 1em;
}

@mixin textInputGreen{
	width: 100%;
	background: rgb(40, 109, 46);
	border: none;
	border-radius: 5px;
	padding: 5px;
	color: white;
	font-weight: bold;
}

.programMemory{
	@include label();
	.programMemoryText{
		@include textInputGreen();
		font-size : 12px ;
		margin-bottom : 0.5em;
	}
}

.programInput {
	@include label();
	input {
		@include textInputGreen();
		box-shadow: 3px 3px 2px rgba(0, 0, 0, 0.4);
	}
	.buttons{
		display: flex;
	}
}

@media screen and (max-width: 480px) {
	.board {
		flex-direction: column;
		// .container-item{
		// }
	}
	.sevenSegmentWrapper {
		margin-top: 15px;
		height: 50px;
		width: 50px;
	}
	.sevenSegAndDumpView {
		flex-direction: row;
	}

	#app {
		margin-top: 3px;
	}
	h1,
	p {
		font-size: 12px;
	}
	.program {
		margin-right: 0;
		margin-bottom: 0.5em;
	}
}

// Github Ribbon
// 参考: http://codepo8.github.io/css-fork-on-github-ribbon/
#forkongithub a {
	background: #000;
	color: #fff;
	text-decoration: none;
	font-family: arial, sans-serif;
	text-align: center;
	font-weight: bold;
	padding: 5px 40px;
	font-size: 1rem;
	line-height: 2rem;
	position: relative;
	transition: 0.5s;
}
#forkongithub a:hover {
	background: #c11;
	color: #fff;
}
#forkongithub a::before,
#forkongithub a::after {
	content: "";
	width: 100%;
	display: block;
	position: absolute;
	top: 1px;
	left: 0;
	height: 1px;
	background: #fff;
}
#forkongithub a::after {
	bottom: 1px;
	top: auto;
}
@media screen and (min-width: 800px) {
	#forkongithub {
		position: fixed;
		display: block;
		top: 0;
		right: 0;
		width: 200px;
		overflow: hidden;
		height: 200px;
		z-index: 9999;
	}
	#forkongithub a {
		width: 200px;
		position: absolute;
		top: 60px;
		right: -60px;
		transform: rotate(45deg);
		-webkit-transform: rotate(45deg);
		-ms-transform: rotate(45deg);
		-moz-transform: rotate(45deg);
		-o-transform: rotate(45deg);
		box-shadow: 4px 4px 10px rgba(0, 0, 0, 0.8);
	}
}
</style>