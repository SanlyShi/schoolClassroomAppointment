<template>
  <div id="list">
    <van-pull-refresh v-model="refresh" @refresh="onRefresh">
      <van-list
        :immediate-check="false"
        v-model="loading"
        :finished="finished"
        :finished-text="'—— '+finishedText+' ——'"
        @load="onLoad"
      >
        <slot name="content"></slot>
      </van-list>
    </van-pull-refresh>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from "vue-property-decorator";

@Component
export default class list extends Vue {
  @Prop({default: '没有更多数据了'}) private finishedText?: string;
  @Prop() private pages!: any;
  @Prop({default: false}) private isRefresh?: boolean;
  @Prop({default: false}) private isFinish?: boolean;

  private loading: boolean = false; // 是否上拉加载
  private finished: boolean = false; // 是否加载完成
  private refresh: any = false;
  public $parent: any;

  @Watch("isRefresh")
  getIsRefresh(newVal: any) {
    this.refresh = newVal
  }

  @Watch("isFinish")
  getIsFinish(newVal: any) {
    this.finished = newVal
  }
  // 下拉刷新
  onRefresh() {
    this.$parent.isRefresh = true
    this.$emit('onRefresh')
  }

  // 上拉加载
  onLoad() {
    setTimeout(() => {
      this.loading = false
      if(this.pages.totalPages > this.pages.page) {
        this.$emit('onReachBottom') 
      } else {
        this.finished = true
        // this.finishedText = '全部加载完啦'
      }

    }, 500);
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="less">
#list {
  .van-list__finished-text {
    color: #909090;
    font-size: 12px;
    font-weight:400;
  }
}
</style>
