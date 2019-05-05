/*tslint:disable:no-bitwise member-ordering max-classes-per-file*/

/*

GMC4内部状態表現クラス

- だいたい本体。名前間違ったか、責務持たせすぎかも。

*/

import { States, Ops, Calls } from './Enums';
import Utils from './Utils';

// GMC4の内部状態を示すクラス
export default class State {

	// プログラム配列
	private program: Uint8Array = new Uint8Array();

	// メモリ
	private memory: Uint8Array = new Uint8Array();

	// コールバック
	private callback?: (num: number, arg?: number) => Promise<number>;

	// ステートセット: 実行カウンタとフラグ
	private stateSet: StateSet = new StateSet(0, false);

	// レジスタ
	private registers = new RegisterSet(0, 0, 0, 0); // a,b,y,z. 順に6F,6C,6E,6D
	private registers2 = new RegisterSet(0, 0, 0, 0); // a2,b2,y2,z2. 69,67,68,66


	constructor(program?: Uint8Array | string, callback?: (num: number, arg?: number) => Promise<number>) {

		// ショートカット: new時に渡されてたらそのまま初期化する（実行はメソッド分ける）
		if (program) {
			this.SetCode(program);
		}
		if (callback) {
			this.SetCallback(callback);
		}

		this.Reset();
	}

	public SetCode(program: Uint8Array | string) {
		if ('string' === typeof program) {
			// 文字列から読み込み
			const buf = new ArrayBuffer(program.length);
			const view = new Uint8Array(buf);
			for (let i = 0; i < program.length; i++) {
				// 読みやすく書けるよう、半角スペースは無視する
				if (program[i] === ' ') {
					continue;
				}
				const nible: number = parseInt(program[i], 16);
				if (isNaN(nible)) {
					throw Error(`parse error: invalid symbol at index ${i}. ${program[i]}`);
				}
				view[i] = nible;
			}
			this.program = view;
		} else {
			this.program = program;
		}
	}

	public SetCallback(callback: (num: number, arg?: number) => Promise<number>) {
		this.callback = callback;
	}

	// 全ての状態をクリアする
	public Reset(): void {

		// メモリ初期化
		// - gmc4は4bitx16の8バイトのメモリを持つ
		// - UNDONE: Uint8Arrayを4bitくぎりでpackするのは面倒になりそうなので、ここではまず8bitx16の16バイトを確保して、各バイトの下位4bitのみ使う実装を検討してみる。
		const memoryBuffer = new ArrayBuffer(16);
		this.memory = new Uint8Array(memoryBuffer);

		// その他の状態をクリア
		this.stateSet.Reset();
		this.registers.Reset();
		this.registers2.Reset();
	}

	// ワンステップ実行
	public async Step(): Promise<number> {

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

				const highAddress: number = this.GetNextCode();
				const lowAddress: number = this.GetNextCode();
				if (this.stateSet.flag) {
					const address: number = highAddress * 0x10 + lowAddress;
					this.stateSet.step = address;
				}
				break;
		}

		// 終了判定
		if (this.program.length === this.stateSet.step) {
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
			case Calls.RestoreSevenSegmentToZero: // RSTO
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
				// undone: 4bit考慮は不要？ ここで下位4bit分残して他をクリアしておくべきかも。
				this.registers.a = Math.floor(this.registers.a / 2);
				break;

			case Calls.Timer: // 0xC: Timer
				await Utils.Sleep((this.registers.a + 1) * 100);
				break;

			case 0xD: // 0xD: DSPR TODO:
				break;

			case 0xE: // 0xE: DEMminus - UNDONE: 用途がよくわからない
				break;

			case 0xF: // 0xF: DEMplus - UNDONE: 用途がよくわからない
				break;
		}
	}

	private Swap(a: number, b: number) {
		const s: number = a;
		a = b;
		b = s;
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
