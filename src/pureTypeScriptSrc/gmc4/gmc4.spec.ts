import GMC4 from './gmc4';

describe('GMC4.ts', () => {
	test('Uint8Arrayをログ出ししてみる', () => {
		
		// 実行コード
		const codes: number[] = [0xA,0xB,0xC];

		var gmc4 = new GMC4();
		const buf = new ArrayBuffer(codes.length);
		const view = new Uint8Array(buf);

		for (var i = 0; i < codes.length; i++){
			view[i] = codes[i];
		}

		// サービスコールのコールバック付きで呼び出し
		gmc4.Run(view, call => { console.log(`service called. ${call}`); });

    expect(123).toEqual(123);
  })
})