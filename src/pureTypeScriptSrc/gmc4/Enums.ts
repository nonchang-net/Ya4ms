

// GMC4 stateの実行状態定数
export const enum States {
	preWorking,
	programUndone,
	programFinished,
	operandNotEnough, // オペランドが足りない
}

// オペコード
export const enum Ops {
	KeyToARegister = 0x0, // 0x0: KA: キーの内容をAレジスタに格納。キー入力があればflagオン
	SetSevenSegment = 0x1, // 0x1: AO: マニュアルによると、数字LEDの操作らしい
	ChangeABYZ = 0x2, // 0x2: CH:
	ChangeAY = 0x3, // 0x3: CY:
	ARegisterToYReferenceMemory = 0x4, // 0x4: AM
	YReferenceMemoryToARegister, // 0x5: MA
	MemoryPlus, // 0x6: M+
	MemoryMinus, // 0x7: M-
	StoreDirectNumberToARegister, // 0x8: TIA x
	AddARegisterToDirectNumber, // 0x9: AIA
	StoreDirectNumberToYRegister, // 0xA: TIY
	AddYRegisterToDirectNumber, // 0xB: AIY
	CompareDirectNumberToARegister, // 0xC: CIA
	CompareDirectNumberToYRegister, // 0xD: CIY
	CallService, // 0xE: CAL: 1引数、Calls相当のニーモニック
	Jump, // 0xF: JUMP: 2引数。4bitx2で8bitアドレスを取る(0x0-0x4F)
}

// サービスコール(E0-Ef → CAL XXXX)ニーモニック
// - ここではコールバックにまとめるため、OpcodeのKeyToARegisterも追加定義。
export const enum Calls {
	RestoreSevenSegmentToZero = 0x0, // RSTO: 表示初期化: 0→数字LED
	SetBinaryLeds, // SETR: 表示: 1→2進LED[Y]
	ResetBinaryLeds, // RSTR: 表示: 0→2進LED[Y]
	ReverseAllBitForARegister, // CMPL: NOT(Ar)→Ar
	SwapRegisterSet, // CHNG: 入れ替え: A,B,Y,Z⇔A',B',Y',Z'
	RightShiftForARegister, // SIFT: Ar%2→Flag,Ar/2→Ar : フラグにはAr[0]が入る
	BeepEnd, // ENDS: サウンド: エンド音
	BeepError, // サウンド: エラー音
	BeepShort, // サウンド: ショート音
	BeepLong, // サウンド: ロング音
	PlaySound, // サウンド: Arの音階の音
	TIMR, // タイマー: (Ar+1)x0.1sec待つ
	DSPR, // 表示: (E)→2進LED[0:3],(F)→2進LED[4:6]
	DEMminus, // DEC((Y)-Ar)→(Y),Y--
	DEMplus,  // DEC((Y)+Ar)→(Y),Y--

	KeyToARegister, // Opcode 0x0: KA: キーの内容をAレジスタに格納。キー入力があればflagオン
	SetSevenSegment, // Opcode 0x1: AO: 7セグ表示
}
