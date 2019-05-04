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

	private CompatAudioContext = (window as any).AudioContext || (window as any).webkitAudioContext;
	private audioContext?: AudioContext;

	public async PlayShort() {

		// console.log(`Beep: PlayShort(): `, this.CompatAudioContext);

		// const audioContext = new this.CompatAudioContext();

		if (this.audioContext == null) {
			this.audioContext = new this.CompatAudioContext();
			if (this.audioContext == null) {
				console.log(`error: AudioContextがnullでした。。`);
				return;
			}
		}

		const gainNode = this.audioContext.createGain();
		gainNode.connect(this.audioContext.destination);
		gainNode.gain.value = 0.5;

		const osc = this.audioContext.createOscillator();
		osc.connect(gainNode);
		osc.frequency.value = 440;
		osc.type = 'sine';
		osc.start();
		await Utils.Sleep(100);
		osc.stop();
	}
}
