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

// GMC4 stateの実行状態定数
const enum StateEnum{
	preWorking,
	programUndone,
	programFinished,
}


// GMC4の内部状態を示すクラス
class State{

	readonly PRE_WORKING: number = -1;
	readonly PROGRAM_UNDONE = 98;
	readonly PROGRAM_FINISHED = 99;

	// プログラム配列
	private program: Uint8Array;

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

	constructor(program: Uint8Array) {
		this.program = program;
		this.Reset();
	}

	// 全ての状態をクリアする
	public Reset(): void {
		this.step = this.PRE_WORKING;
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
			return this.PROGRAM_FINISHED;
		}
		switch (this.GetNextCode()) {
			case 0x0:
				break;
			case 0x1:
				break;
			case 0x2:
				break;
			case 0x3:
				break;
			case 0x4:
				break;
			case 0x5:
				break;
			case 0x6:
				break;
			case 0x7:
				break;
			case 0x8:
				break;
			case 0x9:
				break;
			case 0xA:
				break;
			case 0xB:
				break;
			case 0xC:
				break;
			case 0xD:
				break;
			case 0xE:
				this.step++;
				this.Call(this.GetNextCode())
				break;
			case 0xF:
				break;
		}
		return 0;
	}

	private GetNextCode(): number {
		this.step++;
		if (this.program.length == this.step) {
			throw new Error('GetNextCode(): program was finished!');
		}
		return this.program[this.step];
	}

	private Call(code: number): void{
		switch (code) {
			case Calls.CHNG:
				break;
			case 0x1:
				break;
			case 0x2:
				break;
			case 0x3:
				break;
			case 0x4:
				break;
			case 0x5:
				break;
			case 0x6:
				break;
			case 0x7:
				break;
			case 0x8:
				break;
			case 0x9:
				break;
			case 0xA:
				break;
			case 0xB:
				break;
			case 0xC:
				break;
			case 0xD:
				break;
			case 0xE:
				break;
			case 0xF:
				break;
		}
	}

	// デバッグダンプ
	// - 検討中
	// public Dump(): void {
		
	// }
}

export default class GMC4{

	// UNDONE: コード列実行
	// - 音再生、LED変更などアウトプットに当たる要素はコールバックでシステムコールをそのまま渡す想定
	public Run(code: Uint8Array, callback?: (num: number) => void): void{
		console.log(`code length : ${code.length}`);
		for (var i = 0; i < code.length; i++){
			console.log(`code ${i}: ${code[i].toString(16)}`);
		}

		// UNDONE: サービスコールを出力してみるサンプル
		if (callback) {
			callback(0x3);
		}

	}

}

// オペコード
const enum Opecodes{
	KA = 0x0,
	AO = 0x1,
	CH = 0x2,
	CY = 0x3,
	AM = 0x4,
	MA, // 5
	Mplus, // 6
	Mminus, // 7
	TIA, // 8
	AIA, // 9
	TIY, // A
	AIY, // B
	CIA, // C
	CIY, // D
	CAL, // E 1引数、Calls相当のニーモニック
	JUMP, // F 2引数、8bitアドレスを取る
}

// サービスコール(E0-Ef → CAL XXXX)ニーモニック
const enum Calls { 
	RSTO = 0x0, // 表示初期化: 0→数字LED
	SETR, // 表示: 1→2進LED[Y]
	RSTR, // 表示: 0→2進LED[Y]
	CMPL, // NOT(Ar)→Ar
	CHNG, // 入れ替え: A,B,Y,Z⇔A',B',Y',Z'
	SIFT, // シフト: Ar%2→Flag,Ar/2→Ar : フラグにはAr[0]が入る
	ENDS, // サウンド: エンド音
	ERRS, // サウンド: エラー音
	SHTS, // サウンド: ショート音
	LONS, // サウンド: ロング音
	SUND, // サウンド: Arの音階の音
	TIMR, // タイマー: (Ar+1)x0.1sec待つ
	DSPR, // 表示: (E)→2進LED[0:3],(F)→2進LED[4:6]
	DEMminus, // DEC((Y)-Ar)→(Y),Y--
	DEMplus,  // DEC((Y)+Ar)→(Y),Y--
}
