/*tslint:disable:no-bitwise*/

// ユーティリティ
// - 恥ずかしながらビット演算に不慣れなので、自分でわかりにくい演算コードはユーティリティメソッドとユニットテストにくくり出していく
// - あと置き場所に困る便利メソッドの一時置き場

export default class Utils {

	// 4bitに丸める
	// UNDONE: 16bit分のマスクでは半端だと思う。このアプリで4bit+オーバーフロー以上の値を扱うことはないので、テスト通ってるうちは良しとする。なんか微妙に感じる
	public static RoundTo4Bit(num: number): number {
		return num &= ~0xfff0;
	}

	// awaitでmsec待つ（timr用）
	public static async Sleep(msec: number): Promise<any> {
		return new Promise((resolve) => setTimeout(resolve, msec));
	}
}
