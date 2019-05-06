/*tslint:disable:no-bitwise member-ordering max-classes-per-file*/

/*

# yet another 4bit microcomputer in typescript

## 概要

- GMC-4の挙動を模したシミュレータの実装を目標としています。

*/

import { States, Ops, Calls } from './Enums';
import Utils from './Utils';

export default class GMC4 {

	// プログラム配列
	private program: Uint8Array = new Uint8Array(80);

	// メモリ
	private memory: Uint8Array = new Uint8Array(16);

	// コールバック
	private callback?: (num: number, arg?: number) => Promise<number>;

	// ステートセット: 実行カウンタとフラグ
	private stateSet: StateSet = new StateSet(0, false);

	// レジスタ
	private registers = new RegisterSet(0, 0, 0, 0); // a,b,y,z. 順に6F,6C,6E,6D
	private registers2 = new RegisterSet(0, 0, 0, 0); // a2,b2,y2,z2. 69,67,68,66


	// デバッグコールバック
	private debugCallback?: (dumps: DumpFormat) => void;

	public SetDebugCallback(callback: (dumps: DumpFormat) => void): void {
		this.debugCallback = callback;
	}

	// 実行停止要求フラグ
	// - Reset時に停止する用途
	private stopRequired = false;


	constructor(program?: Uint8Array | string, callback?: (num: number, arg?: number) => Promise<number>) {

		// ショートカット: new時に渡されてたらそのまま初期化する（実行はメソッド分ける）
		if (program) {
			this.SetCode(program);
		}
		if (callback) {
			this.SetCallback(callback);
		}

		this.HardReset();
	}

	// コード列実行
	// - 音再生、LED変更などアウトプットに当たる要素はコールバックでシステムコールをそのまま渡す想定
	public async Run() {

		// ループ実行

		// DEBUG: 無限ループ停止用設定
		const TEST_DEBUG_STEP_MAX = 1000;
		let TEST_DEBUG_STEP_COUNT = 0;

		this.stopRequired = false;

		while (true) {

			// DEBUG: 各シーケンスで0.1秒待つ
			await Utils.Sleep(100);

			if (this.stopRequired) {
				console.log(`終了要求を検知しました。実行を終了します。`);
				return;
			}

			TEST_DEBUG_STEP_COUNT++;
			if (TEST_DEBUG_STEP_MAX < TEST_DEBUG_STEP_COUNT) {
				throw new Error(`DEBUG: MAX Step reached.`);
			}

			this.DoDumpCallback();
			const currentState: States = await this.RunStep();

			switch (currentState) {

				case States.preWorking:
					// console.log(`state: preWorking`, this.Dump());
					break;

				case States.programFinished:
					// console.log(`state: programFinished`, this.Dump());
					return;

				case States.programUndone:
					// console.log(`state: programUndone`, this.Dump());
					break;

				case States.operandNotEnough:
					throw new Error(`OperandNotEnough`);

				case States.InfinityLoopFound:
					console.log(`無限ループを検知しました。実行を終了します。`);
					return;

				default:
					this.DoDumpCallback();
					throw new Error(`undefined state found: ${currentState}`);
			}
		}
	}


	// デバッグダンプ
	// - 検討中。とりあえずテストできるようにフルセットjsonで返してみる
	// - TODO: vue側ビルドに含めたくない。C#のpartial的な方法ないかな。あとで調査
	public Dump(): DumpFormat {
		return new DumpFormat(
			this.registers,
			this.registers2,
			this.stateSet,
			this.program,
			this.memory,
		);
	}

	public DoDumpCallback(): void {
		if (this.debugCallback) {
			this.debugCallback(this.Dump());
		}
	}


	public SetCode(program: Uint8Array | string) {

		if ('string' === typeof program) {
			// 文字列から読み込み

			// 書き込み先index
			let index = -1;

			for (let i = 0; i < program.length; i++) {
				// 読みやすく書けるよう、半角スペースは無視する
				if (program[i] === ' ') {
					continue;
				}
				const nible: number = parseInt(program[i], 16);
				if (isNaN(nible)) {
					throw Error(`parse error: invalid symbol at index ${i}. ${program[i]}`);
				}
				index++;
				this.program[index] = nible;
			}

		} else {

			// Uint8Arrayをそのまま読み込み(wasm化を検討してた際の名残。現在未使用)
			this.program = program;
		}
	}

	public SetCallback(callback: (num: number, arg?: number) => Promise<number>) {
		this.callback = callback;
	}

	// Resetボタン相当
	// - 実行ステップをゼロクリアし、終了要求フラグを立てる
	public Reset(): void {
		this.stateSet.Reset();
		this.stopRequired = true;
	}

	// INCRボタン相当
	// - 現在表示中の7セグ内容を現在番地に書き込み、実行ステップを1追加する
	public IncrementAddress(num: number): void {
		this.program[this.stateSet.step] = num;
		this.stateSet.step++;

		// 末尾到達時は0に戻す
		// UNDONE: 実機と違う動きです。
		// - 実機やFXマイコンシミュレータでは、メモリマップに対して4F以上のデータアドレスやレジスタにもアクセスできる仕様
		// - 説明のない空白アドレスもあり、調査不足もありそうなので一旦仮実装で保留しています。
		// - 実行時しかデータメモリやレジスタにアクセスできないのはシミュレータとして不十分
		// - ちゃんとメモリマップを実装して処理方法を検討したいところ
		// - 実機で4F以上にASETしてからRUNした時の挙動がよくわかってません。。
		if (this.stateSet.step >= this.program.length) {
			this.stateSet.step = 0;
		}
	}

	// ASET用 アドレスセット
	// UNDONE: 同上、4F以上はアクセスできない仮実装です。
	public SetAddress(num: number): void {
		this.stateSet.step = num;
		if (this.stateSet.step >= this.program.length) {
			this.stateSet.step = 0;
		}
	}

	// 現在アドレスの内容を取得
	public GetCurrentAddressValue(): number {
		// console.log(`GetCurrentAddressValue()`, this.program, this.stateSet.step);
		return this.program[this.stateSet.step];
	}

	// 現在のステップ数を取得
	public GetCurrentStep(): number {
		return this.stateSet.step;
	}

	// 全ての状態をクリアする
	public HardReset(): void {

		// プログラムメモリ初期化
		this.program = new Uint8Array(80);

		// メモリ初期化
		// - gmc4は4bitx16の8バイトのメモリを持つ
		// - UNDONE: Uint8Arrayを4bitくぎりでpackするのは面倒になりそうなので、ここではまず8bitx16の16バイトを確保して、各バイトの下位4bitのみ使う実装を検討してみる。
		const memoryBuffer = new ArrayBuffer(16);
		this.memory = new Uint8Array(memoryBuffer);

		// その他の状態をクリア
		this.stateSet.HardReset();
		this.registers.Reset();
		this.registers2.Reset();
	}

	// ワンステップ実行
	public async RunStep(): Promise<number> {

		switch (this.GetNextCode()) {

			case Ops.KeyToARegister: // 0x0: KA
				// キーコード入力
				// - TODO: どうやって入力を仮想マシン側で受け取るか検討中
				this.Call(Calls.KeyToARegister);
				this.stateSet.flag = true; // TODO:
				break;

			case Ops.SetSevenSegment: // 0x1: AO
				this.Call(Calls.SetSevenSegment);
				this.stateSet.flag = true;
				break;

			case Ops.ChangeABYZ: // 0x2: CH
				this.Swap(this.registers.a, this.registers.b);
				this.Swap(this.registers.y, this.registers.z);
				this.stateSet.flag = true;
				break;

			case Ops.ChangeAY: // 0x3: CY:
				this.Swap(this.registers.a, this.registers.y);
				this.stateSet.flag = true;
				break;

			case Ops.ARegisterToYReferenceMemory: // 0x4: AM:
				// UNDONE: 4bit丸めなくて大丈夫？ 検討中
				this.memory[this.registers.y] = this.registers.a;
				this.stateSet.flag = true;
				break;

			case Ops.YReferenceMemoryToARegister: // 0x5: MA:
				this.registers.a = this.memory[this.registers.y];
				this.stateSet.flag = true;
				break;

			case Ops.MemoryPlus: // 0x6: M+
				this.registers.a += this.memory[this.registers.y];
				this.stateSet.flag = this.registers.a > 0xf;
				this.registers.a = Utils.RoundTo4Bit(this.registers.a);
				break;

			case Ops.MemoryMinus: // 0x7: M-
				this.registers.a -= this.memory[this.registers.y];
				this.stateSet.flag = this.registers.a < 0;
				// 負のビットクリアはエラーになったので（知識不足、調査保留中）、取り急ぎ0x10足して4bitにroundする
				this.registers.a = Utils.RoundTo4Bit(this.registers.a + 0x10);
				break;

			case Ops.StoreDirectNumberToARegister: // 0x8: TIA x
				// programのオペランドが足りなければ失敗ステートを返す
				if (this.program.length < this.stateSet.step + 1 ) {
					return States.operandNotEnough;
				}
				this.registers.a = this.GetNextCode();
				this.stateSet.flag = true;
				break;

			case Ops.AddARegisterToDirectNumber: // 0x9: AIA
				// programのオペランドが足りなければ失敗ステートを返す
				if (this.program.length < this.stateSet.step + 1 ) {
					return States.operandNotEnough;
				}
				this.registers.a += this.GetNextCode();
				this.stateSet.flag = this.registers.a > 0xf;
				this.registers.a = Utils.RoundTo4Bit(this.registers.a);
				break;

			case Ops.StoreDirectNumberToYRegister:
				// programのオペランドが足りなければ失敗ステートを返す
				if (this.program.length < this.stateSet.step + 1 ) {
					return States.operandNotEnough;
				}
				this.registers.y = this.GetNextCode();
				this.stateSet.flag = true;
				break;

			case Ops.AddYRegisterToDirectNumber:
				// programのオペランドが足りなければ失敗ステートを返す
				if (this.program.length < this.stateSet.step + 1 ) {
					return States.operandNotEnough;
				}
				this.registers.y += this.GetNextCode();
				this.stateSet.flag = this.registers.y > 0xf;
				this.registers.y = Utils.RoundTo4Bit(this.registers.y);
				break;

			case Ops.CompareDirectNumberToARegister: // 0xC: CIA
				// programのオペランドが足りなければ失敗ステートを返す
				if (this.program.length < this.stateSet.step + 1 ) {
					return States.operandNotEnough;
				}
				this.stateSet.flag = this.registers.a !== this.GetNextCode();
				break;

			case Ops.CompareDirectNumberToYRegister: // 0xD: CIY
				// programのオペランドが足りなければ失敗ステートを返す
				if (this.program.length < this.stateSet.step + 1 ) {
					return States.operandNotEnough;
				}
				this.stateSet.flag = this.registers.y !== this.GetNextCode();
				break;

			case Ops.CallService: // 0xE: CAL
				// programのオペランドが足りなければ失敗ステートを返す
				if (this.program.length < this.stateSet.step + 1 ) {
					return States.operandNotEnough;
				}
				await this.Call(this.GetNextCode());
				break;

			case Ops.Jump: // 0xF: JUMP

			// programのオペランドが足りなければ失敗ステートを返す
				if (this.program.length < this.stateSet.step + 2 ) {
					return States.operandNotEnough;
				}

				// Jump元アドレス
				const preJumpAddress = this.stateSet.step - 1;

				const highAddress: number = this.GetNextCode();
				const lowAddress: number = this.GetNextCode();

				console.log(
					`Ops.Jump評価 flag=${this.stateSet.flag} preJumpAddress=${preJumpAddress} `
					+ `address=${highAddress * 0x10 + lowAddress}`,
				);

				if (this.stateSet.flag) {
					const address: number = highAddress * 0x10 + lowAddress;

					// Jump先がJump元の場合は無限ループなので、実行停止を意図したものと判定し終了する
					if (preJumpAddress === address) {
						return States.InfinityLoopFound;
					}

					// UNDONE: プログラムメモリを超えていたらとりあえず0番地に戻す？終了する？(仕様未確認、とりあえず終了させる)
					if (address > 0x4F) {
						// address = 0; // ループ
						return States.programFinished;
					}

					this.stateSet.step = address;
				}
				break;
		}

		// UNDONE: 末尾到達したらとりあえず0番地に戻す？終了する？(仕様未確認、とりあえず終了させる)
		if (this.program.length === this.stateSet.step) {
			// this.stateSet.step = 0;
			return States.programFinished;
		}
		return States.programUndone;
	}

	private GetNextCode(): number {
		if (this.program.length === this.stateSet.step) {
			// UNDONE: 正常なコードなら来ないはず？ オペランド数チェックは仮で入れたので、ここでは一応例外を出しておく
			throw new Error('GetNextCode(): program was finished!');
		}
		const code: number = this.program[this.stateSet.step];
		this.stateSet.step++;
		return code;
	}

	private async Call(code: number) {
		switch (code) {

			// 表示・サウンド関係はそのままフラグ立ててコールバックを呼ぶ
			case Calls.SevenSegmentToOff: // RSTO
			case Calls.SetBinaryLeds: // SETR
			case Calls.ResetBinaryLeds: // RSTR
			case Calls.BeepEnd: // ENDS
			case Calls.BeepError: // ERRS
			case Calls.BeepShort: // SHTS
			case Calls.BeepLong: // LONS
				if (this.callback) {
					this.stateSet.flag = true;
					await this.callback(code);
				}
				break;

			case Calls.PlaySound: // SUND
				if (this.callback) {
					this.stateSet.flag = true;
					await this.callback(code, this.registers.a);
				}
				break;

			case Calls.SetSevenSegment: // Ops 0x1: AO: 7セグ表示
				// console.log(`Calls.SetSevenSegment entered.`);
				if (this.callback) {
					this.stateSet.flag = true;
					await this.callback(code, this.registers.a);
				}
				break;

			case Calls.ReverseAllBitForARegister: // CMPL
				this.registers.a = ~this.registers.a;
				this.stateSet.flag = true;
				break;

			case Calls.SwapRegisterSet: // CHNG
				this.Swap(this.registers.a, this.registers2.a);
				this.Swap(this.registers.b, this.registers2.b);
				this.Swap(this.registers.y, this.registers2.y);
				this.Swap(this.registers.z, this.registers2.z);
				this.stateSet.flag = true;
				break;

			case Calls.RightShiftForARegister: // SIFT
				this.stateSet.flag = Math.floor(this.registers.a % 2) === 1;
				this.registers.a = Math.floor(this.registers.a / 2);
				break;

			case Calls.Timer: // 0xC: Timer
				await Utils.Sleep((this.registers.a + 1) * 100);
				break;

			case Calls.DisplayBinaryLed: // 0xD: DSPR: メモリ5F、5Eの内容を2進数LEDに表示
				if (this.callback) {
					this.stateSet.flag = true;
					const mem: number = this.memory[0xF] * 0x10 + this.memory[0xE];
					await this.callback(code, mem);
				}
				break;

			case 0xE: // 0xE: DEMminus - UNDONE: BCD? 利用例を調査中
				console.log(`TODO: DEM-: 未実装です`);
				break;

			case 0xF: // 0xF: DEMplus - UNDONE: BCD? 利用例を調査中
				console.log(`TODO: DEM+: 未実装です`);
				break;
		}
	}

	private Swap(a: number, b: number) {
		const s: number = a;
		a = b;
		b = s;
	}

}


// デバッグ表示用のDumpフォーマット
// - TODO: この先はクラス分けたい感じ
// - UNDONE: ロジック部分もこのクラスに統一していったほうがいいかも。検討中

export class DumpFormat {
	public registers: RegisterSet;
	public registers2: RegisterSet;
	public states: StateSet;
	public program: Uint8Array;
	public memory: Uint8Array;
	constructor(
		registerSet1: RegisterSet,
		registerSet2: RegisterSet,
		stateSet: StateSet,
		program: Uint8Array,
		memory: Uint8Array,
	) {
		this.registers = registerSet1;
		this.registers2 = registerSet2;
		this.states = stateSet;
		this.program = program;
		this.memory = memory;
	}
}

export class RegisterSet {
	public a: number;
	public b: number;
	public y: number;
	public z: number;

	constructor(a: number, b: number, y: number, z: number) {
		this.a = a;
		this.b = b;
		this.y = y;
		this.z = z;
	}

	public Reset(): void {
		this.a = 0;
		this.b = 0;
		this.y = 0;
		this.z = 0;
	}
}

export class StateSet {
	public step: number; // 実行ステップ
	public flag: boolean;
	public stepMode: boolean; // RUN時フラグ: ステップ実行モードかどうか
	public silentMode: boolean; // RUN時フラグ: サイレント実行モードかどうか

	constructor(
		step: number,
		flag: boolean,
		stepMode: boolean = false,
		silentMode: boolean = false,
	) {
		this.step = step;
		this.flag = flag;
		this.stepMode = stepMode;
		this.silentMode = silentMode;
	}

	public Reset(): void {
		this.step = 0;
	}

	public HardReset(): void {
		this.step = 0;
		this.flag = false;
		this.stepMode = false;
		this.silentMode = false;
	}
}
