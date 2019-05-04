import Utils from '../gmc4/Utils';

/*

# WebAudio APIによるサウンド再生

- GMC4の4種の組み込みサウンドと音階再生機能を実装するにあたり、メディアファイルに依存したくなかったのでWebAudio APIを検討

- 音は適当です。正確な再現には興味がなかったので雰囲気だけ。すみません。

- 参考にしたサイトのメモ
	- [Qiita: はじめてWeb Audio APIに触ってみる](https://qiita.com/Hibikine_Kage/items/8f55bf409883301a7a32)

	- [iOSでのオーディオ再生制限の解除方法いろいろ](https://qiita.com/pentamania/items/2c568a9ec52148bbfd08)
		- safariではユーザ操作を経由しないとダメ。Run時にアンロックされたContextでプレイを維持できるかどうか、注意が必要そう。

*/

// 音程enum
// enumに#が使えないのでsで代替し、C#=Csと表記
export enum Tone { C , Cs, D, Ds, E, F, Fs, G, Gs, A, As, B}

export default class Beep {

	private CompatAudioContext = (window as any).AudioContext || (window as any).webkitAudioContext;
	private audioContext?: AudioContext;

	public async PlayTEST() {
		await this.PlayTone(Tone.A, 4, 0.3, 0.2, 150, 'sawtooth');
	}

	// 0x7: BeepEnd: 終了音……あまり模倣できてない
	public async PlayEnd() {
		const oct = 3;
		const vol = 0.3;
		const atk = 0.2;
		const len = 60;
		const type: OscillatorType = 'sawtooth';
		await this.PlayTone(Tone.A, oct * 1, vol, atk, len, type);
		await this.PlayTone(Tone.B, oct * 1, vol, atk, len, type);
		await this.PlayTone(Tone.C, oct * 2, vol, atk, len, type);
		await this.PlayTone(Tone.D, oct * 2, vol, atk, len, type);
		await this.PlayTone(Tone.E, oct * 2, vol, atk, len, type);
		await this.PlayTone(Tone.F, oct * 2, vol, atk, len, type);
		await this.PlayTone(Tone.G, oct * 2, vol, atk, len, type);
	}


	// 0x8: BeepError: 適当
	public async PlayError() {
		const oct = 3;
		const vol = 0.2;
		const atk = 0.1;
		const len = 60;
		const type: OscillatorType = 'sine';
		for (let i = 0; i < 6; i++) {
			await this.PlayTone(Tone.B, oct * 0.5  , vol, atk, len, type);
			await this.PlayTone(Tone.B, oct * 0.25 , vol, atk, len / 2, type);
			await Utils.Sleep(len / 2);
		}
	}

	// 0x9: BeepShort: ショート音 「ピッ」
	public async PlayShort() {
		await this.PlayTone(Tone.A, 4, 0.3, 0.2, 20, 'sawtooth');
	}

	// 0xA: BeepLong: ロング音 「ピー」
	public async PlayLong() {
		await this.PlayTone(Tone.A, 4, 0.3, 0.2, 20, 'sawtooth');
	}

	// 0xB: PlaySound: 任意の音程
	public async PlaySound(tone: Tone) {
		await this.PlayTone(tone, 4, 0.3, 0.2, 20, 'sawtooth');
	}

	// サブルーチン
	private async PlayTone(
		tone: Tone,
		octave: number,
		volume: number,
		attack: number,
		length: number, // msec
		type: OscillatorType, // 'sine' | 'triangle' | 'square' | 'sawtooth'
	) {

		if (this.audioContext == null) {
			this.audioContext = new this.CompatAudioContext();
			if (this.audioContext == null) {
				console.log(`error: AudioContextがnullでした。。`);
				return;
			}
		}

		const gainNode = this.audioContext.createGain();
		gainNode.connect(this.audioContext.destination);
		gainNode.gain.value = volume;
		gainNode.gain.linearRampToValueAtTime(volume, this.audioContext.currentTime + attack);

		const osc = this.audioContext.createOscillator();
		osc.connect(gainNode);
		osc.frequency.value = this.GetHz(tone, octave);
		osc.type = type;
		osc.start();
		await Utils.Sleep(length);
		osc.stop();
	}

	// 基準音階周波数を算出
	// index 0がド、半音単位で上がる。
	// C=0, C#=1, D=2, D#=3, E=4, F=5, F#=6, G=7, G#=8, A=9, A#=10, B=11
	// octaveは1基準。2で上のオクターブ(倍周波数)、octave=0.5で1オクターブ下がる
	private GetHz(index: number, octave: number, base: number = 442): number {
		return base * octave * Math.pow(2, (1 / 12) * (index - 9));
	}
}
