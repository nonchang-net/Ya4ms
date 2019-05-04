import Utils from '../gmc4/Utils';

/*

# WebAudio APIによるサウンド再生

- GMC4の4種の組み込みサウンドと音階再生機能を実装するにあたり、メディアファイルに依存したくなかったのでWebAudio APIを検討

- 音は適当です。正確な再現には興味がなかったので雰囲気だけ。すみません。

- 参考にしたサイトのメモ
	- [Qiita: はじめてWeb Audio APIに触ってみる](https://qiita.com/Hibikine_Kage/items/8f55bf409883301a7a32)

	- [iOSでのオーディオ再生制限の解除方法いろいろ](https://qiita.com/pentamania/items/2c568a9ec52148bbfd08)
		- safariではユーザ操作を経由しないとダメらしい。ふむ。

*/

export default class Beep {

	private audioContext: AudioContext;
	private osc: OscillatorNode;
	private gainNode: GainNode;

	private isPlaying: boolean = false;

	constructor() {
		this.audioContext = new AudioContext();
		this.gainNode = this.audioContext.createGain();
		this.gainNode.connect(this.audioContext.destination);

		// TODO: 2回鳴らせないっぽいんだけど、コンストラクタで何か入れないとコンパイルエラーになるのでとりあえず入れておく。直し方あとで調査
		// Property 'osc' has no initializer and is not definitely assigned in the constructor.
		this.osc = this.audioContext.createOscillator();

		this.gainNode.gain.value = 0.5;
	}

	public async PlayShort() {
		if (this.isPlaying) {
			this.Stop();
		}
		this.isPlaying = true;

		this.osc = this.audioContext.createOscillator();
		this.osc.connect(this.gainNode);
		this.osc.frequency.value = 440;
		this.osc.type = 'sine';
		this.osc.start();
		await Utils.Sleep(100);
		this.Stop();
	}

	public Stop(): void {
		this.osc.stop();
		this.isPlaying = false;
	}
}
