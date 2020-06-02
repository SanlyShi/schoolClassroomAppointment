<template>
  <div class="hello">
    哈哈哈哈哈,试试vant的组件
    <van-cell-group>
      <van-switch-cell v-model="checked" title="标题" />
    </van-cell-group>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";

@Component
export default class HelloWorld extends Vue {

  @Prop() private msg!: string;
  // 原来的data中的数据
  checked: Boolean = true
  msg1: number = 123

  // 使用 props 中的数据
  helloMsg = 'Hello, ' + this.msg

  // 然后就是vue的生命周期
  mounted () {
    console.log(this.msg)
    console.log(this.helloMsg)
    this.greet()
  }

  // 计算属性computed
  get computedMsg () {
    return 'computed ' + this.msg1
  }

  // 方法 method
  greet () {
    alert('greeting: ' + this.msg1)
  }

}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="less">
h3 {
  margin: 40px 0 0;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
}
</style>
