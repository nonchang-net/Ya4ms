import { default as GMC4, Utils } from './gmc4';

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

	test('chars to program test', () => {
		var codestr = '8A91';
		// var codestr = '8A91G';
		for (var i = 0; i < codestr.length; i++){
			var nible: number = parseInt(codestr[i], 16);
			if (isNaN(nible)) {
				// TODO: NaNが見つかったら実際はパースエラーを返す
			}
			console.log(`code: ${codestr[i]} nible:0x${nible.toString(16)}`);
		}
	});

	test(`run code for string`, () => {
		var gmc4 = new GMC4();
		gmc4.Run('8A91');
	});

	test(`run code for string with invalid code`, () => {
		var gmc4 = new GMC4();
		gmc4.Run('8A91G');
	});


})