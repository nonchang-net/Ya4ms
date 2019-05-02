import { States, Ops, Calls } from './Enums'
import Utils from './Utils'

// GMC4の内部状態を示すクラス
export default class State{
	// プログラム配列
	private program: Uint8Array;

	// メモリ
	private memory: Uint8Array;

	// コールバック
	private callback?: (num: number) => void;

	// 実行カウンタ
	private step: number = 0;

	// フラグ JUMPや桁上がりなどでセットされ、JUMP命令が判断に利用する
	private flag: boolean = false;

	// レジスタ
	private a: number = 0; // 6F
	private b: number = 0; // 6C
	private y: number = 0; // 6E
	private z: number = 0; // 6D
	private a2: number = 0; // 69
	private b2: number = 0; // 67
	private y2: number = 0; // 68
	private z2: number = 0; // 66

	constructor(program: Uint8Array | string, callback?: (num: number) => void) {

		if ('string' == typeof program) {
			// 文字列から読み込み
			const buf = new ArrayBuffer(program.length);
			const view = new Uint8Array(buf);
			for (var i = 0; i < program.length; i++){
				var nible: number = parseInt(program[i], 16);
				if (isNaN(nible)) {
					throw Error(`parse error: invalid symbol at index ${i}. ${program[i]}`);
				}
				view[i] = nible;
			}
			this.program = view;
		} else {
			this.program = program;
		}

		this.callback = callback;

		// メモリ初期化
		// - gmc4は4bitx16の8バイトのメモリを持つ
		// - UNDONE: Uint8Arrayを4bitくぎりでpackするのは面倒になりそうなので、ここではまず8bitx16の16バイトを確保して、各バイトの下位4bitのみ使う実装を検討してみる。
		var memoryBuffer = new ArrayBuffer(16);
		this.memory = new Uint8Array(memoryBuffer);

		this.Reset();
	}

	// 全ての状態をクリアする
	public Reset(): void {
		this.step = States.preWorking;
		this.flag = false;
		this.a = 0;
		this.b = 0;
		this.y = 0;
		this.z = 0;
		this.a2 = 0;
		this.b2 = 0;
		this.y2 = 0;
		this.z2 = 0;
	}

	// ワンステップ実行
	public Step(): number {

		if (this.program.length == this.step - 1) {
			return States.programFinished;
		}

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
				this.Swap(this.a, this.b);
				this.Swap(this.y, this.z);
				this.flag = true;
				break;

			case Ops.ChangeAY: // 0x3: CY:
				this.Swap(this.a, this.y);
				this.flag = true;
				break;

			case Ops.ARegisterToYReferenceMemory: // 0x4: AM:
				// UNDONE: 4bit丸めなくて大丈夫？ 検討中
				this.memory[this.y] = this.a;
				this.flag = true;
				break;

			case Ops.YReferenceMemoryToARegister: // 0x5: MA:
				this.a = this.memory[this.y];
				this.flag = true;
				break;

			case Ops.MemoryPlus: // 0x6: M+
				this.a += this.memory[this.y];
				this.flag = this.a > 0xf;
				this.a = Utils.RoundTo4Bit(this.a);
				break;

			case Ops.MemoryMinus: // 0x7: M-
				this.a -= this.memory[this.y];
				this.flag = this.a < 0;
				// 負のビットクリアはエラーになったので（知識不足、調査保留中）、取り急ぎ0x10足して4bitにroundする
				this.a = Utils.RoundTo4Bit(this.a + 0x10);
				break;

			case Ops.StoreDirectNumberToARegister: // 0x8: TIA x
				this.a = this.GetNextCode();
				this.flag = true;
				break;

			case Ops.AddARegisterToDirectNumber: // 0x9: AIA
				this.a += this.GetNextCode();
				this.flag = this.a > 0xf;
				this.a = Utils.RoundTo4Bit(this.a);
				break;

			case Ops.StoreDirectNumberToYRegister:
				this.y = this.GetNextCode();
				this.flag = true;
				break;

			case Ops.AddYRegisterToDirectNumber:
				this.y += this.GetNextCode();
				this.flag = this.y > 0xf;
				this.y = Utils.RoundTo4Bit(this.y);
				break;

			case Ops.CompareDirectNumberToARegister: // 0xC: CIA
				this.flag = this.a != this.GetNextCode();
				break;

			case Ops.CompareDirectNumberToYRegister: //0xD: CIY
			this.flag = this.y != this.GetNextCode();
				break;

			case Ops.CallService: // 0xE: CAL
				this.Call(this.GetNextCode());
				break;

			case Ops.Jump: // 0xF: JUMP
			var highAddress: number = this.GetNextCode();
			var lowAddress: number = this.GetNextCode();
				if (this.flag) {
					var address: number = highAddress * 0x10 + lowAddress;
					this.step = address;
				}
				break;
		}
		return States.programUndone;
	}

	private GetNextCode(): number {
		this.step++;
		if (this.program.length == this.step) {
			// UNDONE: 正常なコードなら来ないはず。jump命令の引数事前評価ができてないので仮置き。一応例外出しておく
			throw new Error('GetNextCode(): program was finished!');
		}
		return this.program[this.step];
	}

	private Call(code: number): void{
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
				this.a = ~this.a;
				this.flag = true;
				break;

			case Calls.SwapRegisterSet: // CHNG
				this.Swap(this.a, this.a2);
				this.Swap(this.b, this.b2);
				this.Swap(this.y, this.y2);
				this.Swap(this.z, this.z2);
				this.flag = true;
				break;

			case Calls.RightShiftForARegister: // SIFT
				this.flag = Math.floor(this.a % 2) == 1;
				// undone: 4bit考慮は不要？ ここで下位4bit分残して他をクリアしておくべきかも。
				this.a = Math.floor(this.a / 2);
				break;

			case 0xC: // 0xC: Timer TODO:
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
		var s: number = a;
		a = b;
		b = s;
	}

	// デバッグダンプ
	// - 検討中。テストできるようにフルセットjsonで返す？
	public Dump(): any {
		return {
			'registers': {
				'a': this.a,
				'b': this.b,
				'y': this.y,
				'z': this.z,
				'a2': this.a2,
				'b2': this.b2,
				'y2': this.y2,
				'z2': this.z2,
			},
			'states': {
				'step': this.step,
				'flag': this.flag,
			},
			'program': this.program,
			'memory': this.memory
		}
	}
}

