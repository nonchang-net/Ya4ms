import { default as GMC4 } from './gmc4';
import Utils from './Utils';

describe('GMC4.ts', () => {

	// test('Uint8Arrayをログ出ししてみる', () => {
		
	// 	// 実行コード
	// 	const codes: number[] = [0xA,0xB,0xC];

	// 	var gmc4 = new GMC4();
	// 	const buf = new ArrayBuffer(codes.length);
	// 	const view = new Uint8Array(buf);

	// 	for (var i = 0; i < codes.length; i++){
	// 		view[i] = codes[i];
	// 	}

	// 	// サービスコールのコールバック付きで呼び出し
	// 	// gmc4.Run(view, call => { console.log(`service called. ${call}`); });

	// 	// viewをログ出ししてみる
	// 	console.log(`code length : ${view.length}`);
	// 	for (var i = 0; i < view.length; i++){
	// 		console.log(`code ${i}: ${view[i].toString(16)}`);
	// 	}

	// 	// TODO: 仮置き: どうテスト評価すれば良いか検討中
  //   expect(123).toEqual(123);
	// })
	
	test('RoundTo4Bit', () => {
		// 下位4bitだけを残してクリアするテスト
		var num: number = 0xffff;
		// console.log('32bit 0xffff', num.toString(16));
    expect(num).toEqual(0xffff);
		// console.log('4bit cleared', Utils.RoundTo4Bit(num).toString(16));
    expect(Utils.RoundTo4Bit(num)).toEqual(0xf);
	});

	test('test minus carry', () => {
		// jsのnumberのマイナス値をビットクリアできるか確認 → ダメっぽいので0x10足して4bitにRoundする方向に。
		var num: number = 0x1;
		var minused: number = num - 3;
		// console.log(`test minus carry: ${num}, ${minused.toString(16)}, ${Utils.RoundTo4Bit(minused + 0x10).toString(16)}`);
    expect(Utils.RoundTo4Bit(minused + 0x10)).toEqual(0xe);
	});


	test('test calc address', () => {
		// アドレス計算テスト
		var highAddress: number = 0x2;
		var lowAddress: number = 0x3;
		var address: number = highAddress * 0x10 + lowAddress;
		// console.log(`test calcAddress: ${highAddress.toString(16)} ${lowAddress.toString(16)} ${address.toString(16)}`);
    expect(address).toEqual(0x23);
	});

	// Aレジスタに0xAを代入し、1を加算するコードをテスト
	test(`run code for string`, async () => {
		var gmc4 = new GMC4('8A91');
		await gmc4.Run();
		var dumped = gmc4.Dump();

		// Aレジスタは0xBになっているはず
		expect(dumped.registers.a).toEqual(0xB);
		// flagはAIAの結果、falseになっているはず
    expect(dumped.states.flag).toEqual(false);
	});

		// `G`はパースできないので、newしたら例外が投げられる
	test(`run code for string with invalid code`, () => {
		expect(() => {
			new GMC4('8A91G');
		}).toThrowError('parse error: invalid symbol at index 4. G')
	});

	// メモリ0x52に0x3を代入し、1を加算するコードをテスト
	test(`run code for string`, async () => {
		var gmc4 = new GMC4(
			'83' + // Aレジスタに3を代入
			'A2' + // Yレジスタに2を代入。0x52番地を指定
			'4' + // Aレジスタの内容を、Yレジスタが示すメモリにセット
			'81' + // Aレジスタに1を代入
			'6' // Aレジスタの内容を、Yレジスタが示すメモリに加算してAレジスタに戻す
		);
		await gmc4.Run();
		var dumped = gmc4.Dump();

		// Aレジスタは0x4になっている
		expect(dumped.registers.a).toEqual(0x4);
		// Yレジスタは0x2になっている
		expect(dumped.registers.y).toEqual(0x2);
		// メモリの2番目は0x3になっている（加算されてない）
		expect(dumped.memory[2]).toEqual(0x3);
		// flagはM+(6)の実行の結果、桁上がりしていないのでfalseになっているはず
    expect(dumped.states.flag).toEqual(false);
	});

	// Timerのブラウザテスト
	// - 以下のコードで、Yレジスタが1,2,3と上がる
	// '85A1ECA2ECA3EC'

	// AO: LEDセットのブラウザテスト
	// - 以下のコードで、7セグ表示が1,2,3と上がる
	// 811 85EC 821 85EC 831


})