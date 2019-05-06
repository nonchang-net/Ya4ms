<!--

# SVGで7セグを表示するvueコンポーネント

- set(0x0 - 0xF)を呼び出せます。
- 0-9,a-fを表示可能です。
- a-fは表現の限界上、大文字小文字が混在します。(AbcdEF)


## CC0 - このファイルのライセンスについて

- この「SevenSegment.vue」ファイルは「CC0」です。ご自由にお使いください。

- CC0ライセンスの詳細が必要な際は、以下のURLをご確認ください。
	- https://creativecommons.org/publicdomain/zero/1.0/
	- https://creativecommons.jp/sciencecommons/aboutcc0/

- 尚、蛇足ながら本コンポーネント中のsvg表現もまた、以下URLのCC0のwikipedia添付ファイルを借用したものです。
	- https://ja.wikipedia.org/wiki/%E3%83%95%E3%82%A1%E3%82%A4%E3%83%AB:7-segment_abcdef.svg

-->

<template>
	<div class="SevenSegment">
		<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 10 20">
		<g id="abcdef" style="">
			<polygon id="a" class="seg" points=" 1, 1  2, 0  8, 0  9, 1  8, 2  2, 2" v-show="A" />
			<polygon id="b" class="seg" points=" 9, 1 10, 2 10, 8  9, 9  8, 8  8, 2" v-show="B" />
			<polygon id="c" class="seg" points=" 9, 9 10,10 10,16  9,17  8,16  8,10" v-show="C" />
			<polygon id="d" class="seg" points=" 9,17  8,18  2,18  1,17  2,16  8,16" v-show="D" />
			<polygon id="e" class="seg" points=" 1,17  0,16  0,10  1, 9  2,10  2,16" v-show="E" />
			<polygon id="f" class="seg" points=" 1, 9  0, 8  0, 2  1, 1  2, 2  2, 8" v-show="F" />
			<polygon id="g" class="seg" points=" 1, 9  2, 8  8, 8  9, 9  8,10  2,10" v-show="G" />
		</g>
		</svg>
	</div>
</template>

<script lang="ts">

import { Component, Vue } from 'vue-property-decorator';

@Component
export default class SevenSegment extends Vue {

	public num: number = 0;

	// 一つ前の値
	// - GMC4実装ではASETで直前2キー入力が必要なため定義
	public buffer: number = 0;

	private A: boolean = false;
	private B: boolean = false;
	private C: boolean = false;
	private D: boolean = false;
	private E: boolean = false;
	private F: boolean = false;
	private G: boolean = false;

	private readonly segs: {[index: number]: boolean[]} = {
		0x0: [true , true , true , true , true , true , false],
		0x1: [false, true , true , false, false, false, false],
		0x2: [true , true , false, true , true , false, true ],
		0x3: [true , true , true , true , false, false, true ],
		0x4: [false, true , true , false, false, true , true ],
		0x5: [true , false, true , true , false, true , true ],
		0x6: [true , false, true , true , true , true , true ],
		0x7: [true , true , true , false, false, false, false],
		0x8: [true , true , true , true , true , true , true ],
		0x9: [true , true , true , true , false, true , true ],
		0xA: [true , true , true , false, true , true , true ],
		0xB: [false, false, true , true , true , true , true ],
		0xC: [false, false, false, true , true , false, true ],
		0xD: [false, true , true , true , true , false, true ],
		0xE: [true , false, false, true , true , true , true ],
		0xF: [true , false, false, false, true , true , true ],
		998: [false, false, false, false, false, false, false], // 消灯
		999: [false, false, true , true , true , false, true ], // test: 小文字のoを表示
	};

	public Set(num: number): void {
		this.buffer = this.num;
		this.num = num;
		const seg = this.segs[num];
		this.A = seg[0]; this.B = seg[1]; this.C = seg[2];
		this.D = seg[3]; this.E = seg[4]; this.F = seg[5]; this.G = seg[6];
	}
}

</script>

<style lang="scss">

// note: svgではscoped cssは反映されないので注意

.SevenSegment #abcdef{
	fill-rule:evenodd;
	stroke: black;
	stroke-width:0.25;
	stroke-opacity:1;
	stroke-linecap:butt;
	stroke-linejoin:miter;
}

.SevenSegment .seg{
	fill: #ff0000;
}

</style>