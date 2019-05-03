<template>
	<div id="app">
		<h1>Ya4ms: Yet Another 4bit Micon Simulator</h1>
		<p>test 2019 0502 1948</p>
		<hr />

		<div class="board">

			<div class="container-item">
				<div class="leds">
					<p>LEDS</p>
					<Led class="led" state="true" />
					<Led class="led"  state="true" />
					<Led class="led"  state="false" />
					<Led class="led"  state="true" />
					<Led class="led"  state="true" />
					<Led class="led"  state="true" />
					<Led class="led"  state="true" />
				</div>

				<div class="sevenSegAndDumpView">
					<div class="sevenSegmentWrapper">
						<SevenSegment ref="sevenSegment" class="SevenSegment"/>
					</div>

					<DumpView ref="dumpView" />
				</div>


			</div>

			<div class="container-item">
				<Buttons class="Buttons" ref="buttons" @click-number="onClickButton"/>
			</div>

		</div>
		<hr />
		<input type="text" ref="testCode" value="8A91" />
		<button ref="testRunButton" @click="testRunButtonClick"> test run </button>

		<div class="sampleCodes">
			<h2>サンプルコード</h2>
			<dl>
				<dt>
					0.5秒置きにLEDが1,2,3と変化するコード
				</dt>
				<dd>
					811 85EC 821 85EC 831
				</dd>
			</dl>
		</div>
	</div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import Buttons from './components/Buttons.vue';
import SevenSegment from './components/SevenSegment.vue';
import Led from './components/Led.vue';
import DumpView from './components/DumpView/DumpView.vue';

import GMC4 from './pureTypeScriptSrc/gmc4/gmc4';
import { Calls } from './pureTypeScriptSrc/gmc4/Enums';


import MyTest from './pureTypeScriptSrc/MyTest';


@Component({
	components: {
		Buttons,
		SevenSegment,
		Led,
		DumpView,
	},
})

export default class App extends Vue {

	private sevenSegment: SevenSegment;
	private gmc4: GMC4;

	constructor() {
		super();
		// const myTest: MyTest = new MyTest('test string here!');
		// console.log('mytest.GetTest(): ' + myTest.GetTest());

		// TODO: ここで代入しても取れないが、コンストラクタで何か入れないとコンパイルエラーになる……。多分筋の悪いことをやってるんだろう。あとで再検討。
		this.sevenSegment =  (this.$refs.sevenSegment as SevenSegment);

		this.gmc4 = new GMC4();
	}

	public mounted() {

		// 遅延初期化
		if (!this.sevenSegment) {
			// undone: もっといい書き方ないのかな。いちいちダウンキャストしたくない
			this.sevenSegment =  (this.$refs.sevenSegment as SevenSegment);
		}

		// 7セグ表示を初期化
		this.sevenSegment.set(0x0);

		// コールバック定義
		this.gmc4.SetCallback((arg1, arg2?) => {

			// console.log(`gmc4.callback called: ${arg1} ${arg2}`);

			switch (arg1) {
				case Calls.SetSevenSegment:
					if (!arg2) {
						throw new Error(`[Opcode 0x1: AO] missing argument error: Calls.SetSevenSegmentには第二引数が必要です`);
					}
					this.sevenSegment.set(arg2);
					return 0;

				// TODO: 他のサービスはまだ。
			}
			return 0;
		});

		// dumpコールバック設定
		this.gmc4.SetDebugCallback((dumps) => {
			(this.$refs.dumpView as any).Set(dumps);
		});

	}

	public onClickButton(num: number) {
		// console.log('App.vue: onClickButton() num:', num);
		this.sevenSegment.set(num);
	}

	// テスト実行ボタン評価
	public testRunButtonClick(): void {
		// 実行
		const code: string = (this.$refs.testCode as HTMLInputElement).value;
		this.gmc4.SetCode(code);
		this.gmc4.Reset();
		this.gmc4.Run();
	}
}
</script>

<style lang="scss">

*, *:before, *:after {
	box-sizing: border-box;
	margin : 0 ;
	padding: 0 ;
}

#app {
	font-family: 'Avenir', Helvetica, Arial, sans-serif;
	-webkit-font-smoothing: antialiased;
	-moz-osx-font-smoothing: grayscale;
	text-align: center;
	color: #2c3e50;
	margin-top: 60px;
}

.sampleCodes{
	font-size : 12px ;
	text-align : left;
	padding : 5px ; 
	border : 1px solid gray;
	border-radius : 5px ;
	background : #eee;
	h2{
		font-size : 14px;
		border-bottom : 1px solid gray ;
	}
	dl{
		margin-top : 5px ;
	}
	dt{
		border-left : 5px solid gray;
		padding-left : 5px ;
		font-weight : bold;
	}
	dd{
		border : none ;
		margin-left : 10px;
		font-weight : normal;
	}
}

.board{
	display: flex;
	width : 100%;

	background : rgb(53, 122, 32);
	padding : 1em ;
}

.container-item{
	flex-basis: 100%;
}



.leds{
	display: flex;

	width : 100%;
	margin-left : 0 ; margin-right : 0 ;
}
.leds p{
	text-align : left;
	font-weight : bold;
	color : white;
}

.led{
	margin-left : 0.5em ;
}

.Buttons{
	border :2px solid rgb(34, 58, 27);
	width : 100%;
}

.sevenSegAndDumpView{
	display: flex;


}

.sevenSegmentWrapper{
	padding : 5px;
	height : 80px;
	width : 50px;
	background : #333;
	border-radius : 5px;
}

.SevenSegment{
	transform : skewX(-5deg);
}



@media screen and ( max-width: 480px ) {
	.board{
		flex-direction : column;
		// .container-item{
		// }
	}
	.sevenSegmentWrapper{
		margin-top : 15px ;
		height : 50px;
		width : 50px;
	}
	.sevenSegAndDumpView{
		flex-direction: row;
	}

	#app {
		margin-top: 3px;
	}
	h1, p{
		font-size : 12px ;
	}
}

</style>