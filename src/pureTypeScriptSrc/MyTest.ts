/*

vueからpure typescriptコードを呼ぶテスト

TODO:
- ユニットテスト書く
- 導入方法がわからない。vueのテンプレートで設定しなかったかも。

*/
export default class MyTest {

  private teststr: string;

  constructor(teststr: string) {
    this.teststr = teststr;
  }

  public GetTest(): string {
    return this.teststr;
  }

}
