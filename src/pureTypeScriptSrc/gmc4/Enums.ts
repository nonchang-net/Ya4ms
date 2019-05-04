

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
	SetSevenSegment = 0x1, // 0x1: AO: マニュアル23ページによると、Arの内容を数字LEDに表示する命令
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
	RestoreSevenSegmentToZero = 0x0, // 0x0: RSTO: 表示初期化: 0→数字LED
	SetBinaryLeds, // 0x1: SETR: 表示: 1→2進LED[Y]
	ResetBinaryLeds, // 0x2: RSTR: 表示: 0→2進LED[Y]
	// 0x3は欠番。FXマイコンでは外部入力ポートK1,K2の読み取り
	ReverseAllBitForARegister, // 0x4: CMPL: NOT(Ar)→Ar
	SwapRegisterSet, // 0x5: CHNG: 入れ替え: A,B,Y,Z⇔A',B',Y',Z'
	RightShiftForARegister, // 0x6: SIFT: Ar%2→Flag,Ar/2→Ar : フラグにはAr[0]が入る
	BeepEnd, // 0x7: ENDS: サウンド: エンド音
	BeepError, // 0x8: ERRS: サウンド: エラー音
	BeepShort, // 0x9: SHTS: サウンド: ショート音
	BeepLong, // 0xA: LONS: サウンド: ロング音
	PlaySound, // 0xB: SUNS: サウンド: Arの音階の音
	Timer = 0xC, // 0xC: TIMR: タイマー: (Ar+1)x0.1sec待つ
	DSPR, // 0xD: DSPR: 表示: (E)→2進LED[0:3],(F)→2進LED[4:6]
	DEMminus, // 0xE: DEM-: DEC((Y)-Ar)→(Y),Y-- : これなんだろ？
	DEMplus,  // 0xF: DEM+: DEC((Y)+Ar)→(Y),Y-- : これなんだろ？

	KeyToARegister, // Opcode 0x0: KA: キーの内容をAレジスタに格納。キー入力があればflagオン
	SetSevenSegment, // Opcode 0x1: AO: Arの内容を7セグに表示する
}
