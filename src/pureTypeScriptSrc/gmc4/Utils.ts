/*tslint:disable:no-bitwise*/

// ユーティリティ
// - 恥ずかしながらビット演算に不慣れなので、自分でわかりにくい演算コードはユーティリティメソッドとユニットテストにくくり出していく。
export default class Utils {

	public static RoundTo4Bit(num: number): number {
		return num &= ~0xfff0;
	}

	public static async Sleep(msec: number) : Promise<any> {
		return new Promise(resolve => setTimeout(resolve, msec));
	}
}
