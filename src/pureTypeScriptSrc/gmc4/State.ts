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
	private callback?: (num: number) => void;

	// 実行カウンタ
	private step: number = 0;

	// フラグ JUMPや桁上がりなどでセットされ、JUMP命令が判断に利用する
	private flag: boolean = false;

	// レジスタ
	private registers = new RegisterSet(0,0,0,0); // a,b,y,z. 順に6F,6C,6E,6D
	private registers2 = new RegisterSet(0,0,0,0); // a2,b2,y2,z2. 69,67,68,66


	constructor(program?: Uint8Array | string, callback?: (num: number) => void) {

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

	public SetCallback(callback: (num: number) => void) {
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
		this.step = States.preWorking;
		this.flag = false;
		this.registers.a = 0;
		this.registers.b = 0;
		this.registers.y = 0;
		this.registers.z = 0;
		this.registers2.a = 0;
		this.registers2.b = 0;
		this.registers2.y = 0;
		this.registers2.z = 0;
	}

	// ワンステップ実行
	public Step(): number {

		switch (this.GetNextCode()) {

			case Ops.KeyToARegister: // 0x0: KA
				// キーコード入力
				// - TODO: どうやって入力を仮想マシン側で受け取るか検討中
				this.Call(Calls.KeyToARegister);
				this.flag = true; // TODO:
				break;

			case Ops.SetSevenSegment: // 0x1: AO
				// - TODO: どうやってjavascript側にAレジスタの内容を渡すか検討中
				this.Call(Calls.KeyToARegister);
				this.flag = true;
				break;

			case Ops.ChangeABYZ: // 0x2: CH
				this.Swap(this.registers.a, this.registers.b);
				this.Swap(this.registers.y, this.registers.z);
				this.flag = true;
				break;

			case Ops.ChangeAY: // 0x3: CY:
				this.Swap(this.registers.a, this.registers.y);
				this.flag = true;
				break;

			case Ops.ARegisterToYReferenceMemory: // 0x4: AM:
				// UNDONE: 4bit丸めなくて大丈夫？ 検討中
				this.memory[this.registers.y] = this.registers.a;
				this.flag = true;
				break;

			case Ops.YReferenceMemoryToARegister: // 0x5: MA:
				this.registers.a = this.memory[this.registers.y];
				this.flag = true;
				break;

			case Ops.MemoryPlus: // 0x6: M+
				this.registers.a += this.memory[this.registers.y];
				this.flag = this.registers.a > 0xf;
				this.registers.a = Utils.RoundTo4Bit(this.registers.a);
				break;

			case Ops.MemoryMinus: // 0x7: M-
				this.registers.a -= this.memory[this.registers.y];
				this.flag = this.registers.a < 0;
				// 負のビットクリアはエラーになったので（知識不足、調査保留中）、取り急ぎ0x10足して4bitにroundする
				this.registers.a = Utils.RoundTo4Bit(this.registers.a + 0x10);
				break;

			case Ops.StoreDirectNumberToARegister: // 0x8: TIA x
				// programのオペランドが足りなければ失敗ステートを返す
				if (this.program.length < this.step + 1 ) {
					return States.operandNotEnough;
				}
				this.registers.a = this.GetNextCode();
				this.flag = true;
				break;

			case Ops.AddARegisterToDirectNumber: // 0x9: AIA
				// programのオペランドが足りなければ失敗ステートを返す
				if (this.program.length < this.step + 1 ) {
					return States.operandNotEnough;
				}
				this.registers.a += this.GetNextCode();
				this.flag = this.registers.a > 0xf;
				this.registers.a = Utils.RoundTo4Bit(this.registers.a);
				break;

			case Ops.StoreDirectNumberToYRegister:
				// programのオペランドが足りなければ失敗ステートを返す
				if (this.program.length < this.step + 1 ) {
					return States.operandNotEnough;
				}
				this.registers.y = this.GetNextCode();
				this.flag = true;
				break;

			case Ops.AddYRegisterToDirectNumber:
				// programのオペランドが足りなければ失敗ステートを返す
				if (this.program.length < this.step + 1 ) {
					return States.operandNotEnough;
				}
				this.registers.y += this.GetNextCode();
				this.flag = this.registers.y > 0xf;
				this.registers.y = Utils.RoundTo4Bit(this.registers.y);
				break;

			case Ops.CompareDirectNumberToARegister: // 0xC: CIA
				// programのオペランドが足りなければ失敗ステートを返す
				if (this.program.length < this.step + 1 ) {
					return States.operandNotEnough;
				}
				this.flag = this.registers.a !== this.GetNextCode();
				break;

			case Ops.CompareDirectNumberToYRegister: // 0xD: CIY
				// programのオペランドが足りなければ失敗ステートを返す
				if (this.program.length < this.step + 1 ) {
					return States.operandNotEnough;
				}
				this.flag = this.registers.y !== this.GetNextCode();
				break;

			case Ops.CallService: // 0xE: CAL
				// programのオペランドが足りなければ失敗ステートを返す
				if (this.program.length < this.step + 1 ) {
					return States.operandNotEnough;
				}
				this.Call(this.GetNextCode());
				break;

			case Ops.Jump: // 0xF: JUMP

			// programのオペランドが足りなければ失敗ステートを返す
				if (this.program.length < this.step + 2 ) {
					return States.operandNotEnough;
				}

				const highAddress: number = this.GetNextCode();
				const lowAddress: number = this.GetNextCode();
				if (this.flag) {
					const address: number = highAddress * 0x10 + lowAddress;
					this.step = address;
				}
				break;
		}

		// 終了判定
		if (this.program.length === this.step) {
			return States.programFinished;
		}
		return States.programUndone;
	}

	private GetNextCode(): number {
		if (this.program.length === this.step) {
			// UNDONE: 正常なコードなら来ないはず？ オペランド数チェックは仮で入れたので、ここでは一応例外を出しておく
			throw new Error('GetNextCode(): program was finished!');
		}
		const code: number = this.program[this.step];
		this.step++;
		return code;
	}

	private Call(code: number): void {
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
					this.flag = true;
					this.callback(code);
				}
				break;

				// UNDONE: SUNDニーモニックはAレジスタの値をコールバック側に渡す必要がある。検討中……コールバック分けるか、default nullの引数渡しで済ませるか？
			case Calls.PlaySound: // SUND
				if (this.callback) {
					this.flag = true;
					this.callback(code);
				}
				break;

			case Calls.ReverseAllBitForARegister: // CMPL
				this.registers.a = ~this.registers.a;
				this.flag = true;
				break;

			case Calls.SwapRegisterSet: // CHNG
				this.Swap(this.registers.a, this.registers2.a);
				this.Swap(this.registers.b, this.registers2.b);
				this.Swap(this.registers.y, this.registers2.y);
				this.Swap(this.registers.z, this.registers2.z);
				this.flag = true;
				break;

			case Calls.RightShiftForARegister: // SIFT
				this.flag = Math.floor(this.registers.a % 2) === 1;
				// undone: 4bit考慮は不要？ ここで下位4bit分残して他をクリアしておくべきかも。
				this.registers.a = Math.floor(this.registers.a / 2);
				break;

			case 0xC: // 0xC: Timer TODO: - これどうしよう？ async/await案件か、それとも？
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
			new StateSet(
				this.step,
				this.flag,
			),
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
}

export class StateSet {
	public step: number;
	public flag: boolean;
	constructor(step: number, flag: boolean) {
		this.step = step;
		this.flag = flag;
	}
}
