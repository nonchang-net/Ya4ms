<!--

# レジスタ・メモリ状況の表示UI

- 絶対もっといい書き方があるはずw
- まあ、動いてるので改修保留中。
	- 多分配列定義からview組み立てるようなコードかけばスッキリするんですかね。。ちょっと値の埋め込み周りでつまづいたので、後回し中です。

-->
<template>
	<div class="dump">
		<div class="column">
			<div class="row">
				<div class="header">
					Ar
				</div>
				<div class="value">
					{{ a }}
				</div>
			</div>
			<div class="row">
				<div class="header">
					Br
				</div>
				<div class="value">
					{{ b }}
				</div>
			</div>
			<div class="row">
				<div class="header">
					Yr
				</div>
				<div class="value">
					{{ y }}
				</div>
			</div>
			<div class="row">
				<div class="header">
					Zr
				</div>
				<div class="value">
					{{ z }}
				</div>
			</div>
			<div class="row">
				<div class="header">
					A'
				</div>
				<div class="value">
					{{ a2 }}
				</div>
			</div>
			<div class="row">
				<div class="header">
					B'
				</div>
				<div class="value">
					{{ b2 }}
				</div>
			</div>
			<div class="row">
				<div class="header">
					Y'
				</div>
				<div class="value">
					{{ y2 }}
				</div>
			</div>
			<div class="row">
				<div class="header">
					Z'
				</div>
				<div class="value">
					{{ z2 }}
				</div>
			</div>

			<div style="width : 30px ;"/>

			<div class="row">
				<div class="header">
					step
				</div>
				<div class="value">
					{{ step }}
				</div>
			</div>
			<div class="row">
				<div class="header">
					flag
				</div>
				<div class="value">
					{{ flag }}
				</div>
			</div>
		</div>

		<div class="column">
			<div class="row">
				<div class="header">
					50
				</div>
				<div class="value">
					{{ memory[0] }}
				</div>
			</div>
			<div class="row">
				<div class="header">
					51
				</div>
				<div class="value">
					{{ memory[1] }}
				</div>
			</div>
			<div class="row">
				<div class="header">
					52
				</div>
				<div class="value">
					{{ memory[2] }}
				</div>
			</div>
			<div class="row">
				<div class="header">
					53
				</div>
				<div class="value">
					{{ memory[3] }}
				</div>
			</div>
			<div class="row">
				<div class="header">
					54
				</div>
				<div class="value">
					{{ memory[4] }}
				</div>
			</div>
			<div class="row">
				<div class="header">
					55
				</div>
				<div class="value">
					{{ memory[5] }}
				</div>
			</div>
			<div class="row">
				<div class="header">
					56
				</div>
				<div class="value">
					{{ memory[6] }}
				</div>
			</div>
			<div class="row">
				<div class="header">
					57
				</div>
				<div class="value">
					{{ memory[7] }}
				</div>
			</div>
			<div class="row">
				<div class="header">
					58
				</div>
				<div class="value">
					{{ memory[8] }}
				</div>
			</div>
			<div class="row">
				<div class="header">
					59
				</div>
				<div class="value">
					{{ memory[9] }}
				</div>
			</div>
			<div class="row">
				<div class="header">
					5A
				</div>
				<div class="value">
					{{ memory[0xA] }}
				</div>
			</div>
			<div class="row">
				<div class="header">
					5B
				</div>
				<div class="value">
					{{ memory[0xB] }}
				</div>
			</div>
			<div class="row">
				<div class="header">
					5C
				</div>
				<div class="value">
					{{ memory[0xC] }}
				</div>
			</div>
			<div class="row">
				<div class="header">
					5D
				</div>
				<div class="value">
					{{ memory[0xD] }}
				</div>
			</div>
			<div class="row">
				<div class="header">
					5E
				</div>
				<div class="value">
					{{ memory[0xE] }}
				</div>
			</div>
			<div class="row">
				<div class="header">
					5F
				</div>
				<div class="value">
					{{ memory[0xF] }}
				</div>
			</div>
		</div>
	</div>
</template>


<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { DumpFormat, RegisterSet } from '../../pureTypeScriptSrc/gmc4/State';

@Component
export default class DumpView extends Vue {

	private dumps?: DumpFormat | null = null;
	private memoryArray: Uint8Array = new Uint8Array(16);

	// こうかけたらいいのかな……でも未初期化時の表示方法に悩む。。
	// public get register(): RegisterSet {
	// 	return this.dumps == null ? '-' : this.dumps.registers.a.toString(16);
	// }

	public get a(): string {
		return this.dumps == null ? '-' : this.dumps.registers.a.toString(16);
	}

	public get b(): string {
		return this.dumps == null ? '-' : this.dumps.registers.b.toString(16);
	}

	public get y(): string {
		return this.dumps == null ? '-' : this.dumps.registers.y.toString(16);
	}

	public get z(): string {
		return this.dumps == null ? '-' : this.dumps.registers.z.toString(16);
	}

	public get a2(): string {
		return this.dumps == null ? '-' : this.dumps.registers2.a.toString(16);
	}

	public get b2(): string {
		return this.dumps == null ? '-' : this.dumps.registers2.b.toString(16);
	}

	public get y2(): string {
		return this.dumps == null ? '-' : this.dumps.registers2.y.toString(16);
	}

	public get z2(): string {
		return this.dumps == null ? '-' : this.dumps.registers2.z.toString(16);
	}

	public get step(): string {
		return this.dumps == null ? '-' : this.dumps.states.step.toString(16);
	}

	public get flag(): string {
		return this.dumps == null ? '-' : this.dumps.states.flag.toString();
	}

	public get memory(): Uint8Array {
		return this.memoryArray;
	}

	public Set(dumps: DumpFormat): void {
		this.dumps = dumps;
		this.memoryArray = dumps.memory;
	}
}

</script>

<style lang="scss" scoped>

.dump{

	.column{
		display : flex;
		flex-direction : row;
		margin : 5px;
	}

	.row{
		display : flex;
		flex-direction : column;
		margin : 2px ;
		border-radius : 10px ;

		font-size : 12px ;
		font-weight : bold ;

		.header{
			background : rgb(15, 94, 41);
			color : white;
		}
		.value{
			background : rgb(198, 255, 217);
		}
	}
}


@media screen and ( max-width: 480px ) {
	.dump{
		.row{
			font-size : 10px;
			font-weight : normal ;
		}
	}
}


</style>