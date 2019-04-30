// import 'jest-extended';
// import { shallowMount } from '@vue/test-utils';


// import HelloWorld from '../HelloWorld.vue'
// describe('HelloWorld.vue', () => {
//   test('renders props.msg when passed', () => {
//     const msg = 'new message'
//     const wrapper = shallowMount(HelloWorld, {
//       propsData: { msg }
//     })
//     expect(wrapper.text()).toMatch(msg)
//   })
// })

describe('MyTest.ts', () => {
  test('toEqualのテスト', () => {
    expect(123).toEqual(123);
  })
})