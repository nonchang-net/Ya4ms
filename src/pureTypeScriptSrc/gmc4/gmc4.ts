/*

# WIP: GMC-4 in typescript


## 概要

- GMC-4の挙動を模したシミュレータを実装することを目標としています。

## やらないこと

- Uint4Arrayの検討はしない
	- ググってみるとラッパー的な実装はありそう？ (深追いはしてない)
	- 自前で作るとしてもint8なarrayにパックできなくはなさそう？
	- Uint8Arrayはブラウザネイティブ実装だから早いというもののようだし、パックしたところで速度を稼げるかどうか疑問。
	- そもそも読みやすいシミュレータを練習で書く方に意識が向いているので、効率は優先順位高くない気分。
	- どうせ4bitマイコンだし、コードブロックの格納にUint8Arrayを使う以外では、TypeScriptのnumber型をそのまま使う方向で。


*/

import { States } from './Enums';
import State, { DumpFormat } from './State';

export default class GMC4 {

	private readonly state: State;

	// デバッグコールバック
	private debugCallback?: (dumps: DumpFormat) => void;

	constructor(code?: Uint8Array | string, callback?: (num: number) => void) {
		// state初期化
		this.state = new State(code, callback);
	}

	public SetCode(code: Uint8Array | string): void {
		this.state.SetCode(code);
	}

	public SetCallback(callback: (num: number) => void): void {
		this.state.SetCallback(callback);
	}

	public SetDebugCallback(callback: (dumps: DumpFormat) => void): void {
		this.debugCallback = callback;
	}

	// UNDONE: コード列実行
	// - 音再生、LED変更などアウトプットに当たる要素はコールバックでシステムコールをそのまま渡す想定
	public Run(): void {

		// ループ実行
		while (true) {
			this.DoDumpCallback();
			const currentState: States = this.state.Step();

			switch (currentState) {

				case States.preWorking:
					// console.log(`state: preWorking`, this.state.Dump());
					break;

				case States.programFinished:
					// console.log(`state: programFinished`, this.state.Dump());
					return;

				case States.programUndone:
					// console.log(`state: programUndone`, this.state.Dump());
					break;

				case States.operandNotEnough:
					throw new Error(`OperandNotEnough`);

				default:
					this.DoDumpCallback();
					throw new Error(`undefined state found: ${currentState}`);
			}
		}
	}

	public Reset(): void {
		this.state.Reset();
	}

	public Dump(): any {
		return this.state.Dump();
	}

	public DoDumpCallback(): void {
		if (this.debugCallback) {
			this.debugCallback(this.state.Dump());
		}
	}

}
