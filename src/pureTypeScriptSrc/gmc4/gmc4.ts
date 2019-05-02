/*

# WIP: GMC-4 in typescript


## 概要

- GMC-4の挙動を模したシミュレータを実装することを目標としています。

## やらないこと

- Uint4Arrayの検討
	- int8arrayにパックできなくはなさそう？
	- int8Arrayはブラウザネイティブ実装のようだし、パックしたところで速度を稼げるかどうか疑問。
	- そもそも読みやすいシミュレータを練習で書く方に意識が向いているので、効率は優先順位高くない気分。どうせ4bitマイコンだし。


*/

import { States } from './Enums'
import State from './State'

export default class GMC4{

	// UNDONE: コード列実行
	// - 音再生、LED変更などアウトプットに当たる要素はコールバックでシステムコールをそのまま渡す想定
	public Run(code: Uint8Array | string, callback?: (num: number) => void): void{

		// UNDONE: サービスコールを出力してみるサンプル
		// if (callback) {
		// 	callback(0x3);
		// }

		// state初期化
		const state = new State(code, callback);

		// ループ実行
		while (true) {
			var currentState: States = state.Step();

			switch (currentState) {

				case States.preWorking:
					console.log(`state: preWorking`, state.Dump());
					break;

				case States.programFinished:
					console.log(`state: programFinished`, state.Dump());
					return;
					break;

				case States.programUndone:
					console.log(`state: programUndone`, state.Dump());
					break;

				default:
					throw new Error(`undefined state found: ${currentState}`);
			}
		}
	}
}


