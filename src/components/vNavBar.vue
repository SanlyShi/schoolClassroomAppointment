<template>
  <div id="navBar">
    <van-nav-bar
      :title="title"
      fixed
      :border="border"
      @click-left="onClickLeft"
      @click-right="onClickRight"
    >
      <van-icon slot="left" name="arrow-left" size="22" color="black"></van-icon>
      <div slot="right">
        <slot name="right" v-if="rightIcon">
          <img class="navIcon" v-if="rightIcon === 'explain'" src='../assets/images/btn_shuoming@2x.png' />
          <img class="navIcon" v-if="rightIcon === 'saoyisao'" src='../assets/images/btn_saoyisao@2x.png' />
          </slot>
        <slot name="right" v-else>{{rightText}}</slot>
      </div>
    </van-nav-bar>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";

@Component
export default class navBar extends Vue {
  @Prop() private title!: string;
  @Prop({ default: false }) private border?: boolean
  @Prop({default:''}) private rightText?: string
  @Prop({ default: false }) private rightIcon?: boolean
  
  onClickLeft() {
    this.$router.go(-1);
    this.$emit("clickLeft", "");
  }

  onClickRight() {
    this.$emit("clickRight", "");
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="less">
#navBar {
  height: 1.1733rem;
  .van-nav-bar {
    height: 1.1733rem !important;
    line-height: 1.1733rem !important;
    .van-nav-bar__title {
      font-size: 0.48rem !important;
      color: #303030 !important;
    }
  }
  .navIcon{
    width: 0.5333rem;
    height: 0.5333rem;
    position: relative;
    top:.1rem;
  }

}
</style>
