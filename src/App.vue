<template>
  <div id="app">
    <HelloWorld msg="Ya4ms: Yet Another 4bit Micon Simulator"/>
    <hr />

    <div class="board">

      <div class="container-item">
        <div class="leds">
          <p>LEDS</p>
          <Led class="led" state="true" />
          <Led class="led"  state="true" />
          <Led class="led"  state="false" />
          <Led class="led"  state="true" />
          <Led class="led"  state="true" />
          <Led class="led"  state="true" />
          <Led class="led"  state="true" />
        </div>
        <div class="sevenSegmentWrapper">
          <SevenSegment ref="sevenSegment" class="SevenSegment"/>
        </div>
      </div>

      <div class="container-item">
        <Buttons class="Buttons"/>
      </div>

    </div>
    <hr />
    <p>test 20190421 1931</p>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import HelloWorld from './components/HelloWorld.vue';
import Buttons from './components/Buttons.vue';
import SevenSegment from './components/SevenSegment.vue';
import Led from './components/Led.vue';

import MyTest from './pureTypeScriptSrc/MyTest';


@Component({
  components: {
    HelloWorld,
    Buttons,
    SevenSegment,
    Led,
  },
})

export default class App extends Vue {
  constructor() {
    super();
    // const myTest: MyTest = new MyTest('test string here!');
    // console.log('mytest.GetTest(): ' + myTest.GetTest());
  }

  public mounted() {
    (this.$refs.sevenSegment as SevenSegment).set(0x0); // undone: もっといい書き方ないのかな？
    (this.$refs.sevenSegment as SevenSegment).set(0xe);
  }
}
</script>

<style lang="scss">

*, *:before, *:after {
  box-sizing: border-box;
  margin : 0 ;
  padding: 0 ;
}

#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}

.board{
  display: flex;
  width : 100%;

  background : rgb(53, 122, 32);
  padding : 1em ;
}

.container-item{
	flex-basis: 100%;
}



.leds{
  display: flex;

  width : 100%;
  margin-left : 0 ; margin-right : 0 ;
}
.leds p{
  text-align : left;
  font-weight : bold;
  color : white;
}

.led{
  margin-left : 0.5em ;
}

.Buttons{
  border :2px solid rgb(34, 58, 27);
  width : 100%;
}

.sevenSegmentWrapper{
  padding : 10px;
  height : 140px;
  width : 85px;
  background : #333;
  border-radius : 10px;
}

.SevenSegment{
  transform : skewX(-5deg);
}

</style>