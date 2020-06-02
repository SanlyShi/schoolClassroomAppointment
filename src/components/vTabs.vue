<template>
  <div id="tabs">
    <van-tabs 
      v-model="curIndex" 
      @click="switchTab"
      sticky 
      :offset-top="44"
      :line-width="22"
      :line-height="4"
      color="#E32415"
      title-active-color="#303030"
      title-inactive-color="#909090"
      :border="false"
      :ellipsis="false"
      class="st-tab"
    >
      <van-tab 
        v-for="(item, index) in tabList" 
        :key="index" 
        :title="item.name"
      >
      </van-tab>
    </van-tabs>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";

@Component
export default class tabBar extends Vue {

  @Prop({default: 0}) private active!: any;
  @Prop() private tabList!: any;

  private curIndex: any = 0;
  mounted() {
    this.curIndex = this.active
  }
  switchTab() {
    this.$emit('switchTab', this.curIndex)
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="less">

// 修改van-tab组件样式
#tabs {
  position: sticky;
  top: 44px;
  z-index: 2;
  padding: 0 10px;
  .st-tab {
    .van-tab {
      font-size: 18px;
      font-weight: 400;
    }
    .van-tab--active {
      font-size: 19px;
      font-weight: 500;
    }
    .van-tabs__line {
      box-shadow:0px 1px 2px 0px rgba(227,36,21,0.2);
    }
  }
}
</style>
