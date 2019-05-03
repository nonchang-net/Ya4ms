/*

# WIP: GMC-4 in typescript

## 概要

- GMC-4の挙動を模したシミュレータの実装を目標としています。

*/

import { States } from './Enums';
import State, { DumpFormat } from './State';

export default class GMC4 {

	private readonly state: State;

	// デバッグコールバック
	private debugCallback?: (dumps: DumpFormat) => void;

	constructor(code?: Uint8Array | string, callback?: (num: number) => number) {
		// state初期化
		this.state = new State(code, callback);
	}

	public SetCode(code: Uint8Array | string): void {
		this.state.SetCode(code);
	}

	public SetCallback(callback: (num: number, arg?: number) => number): void {
		this.state.SetCallback(callback);
	}

	public SetDebugCallback(callback: (dumps: DumpFormat) => void): void {
		this.debugCallback = callback;
	}

	// UNDONE: コード列実行
	// - 音再生、LED変更などアウトプットに当たる要素はコールバックでシステムコールをそのまま渡す想定
	public async Run() {

		// ループ実行
		while (true) {
			this.DoDumpCallback();
			const currentState: States = await this.state.Step();

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
