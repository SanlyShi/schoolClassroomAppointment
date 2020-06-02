<template>
  <div class="slider">
    <div class="ruler" id="ruler" ref="ruler">
      <div
        ref="bar"
        class="bar startbar"
        @touchstart.stop="startTouchstart"
        @touchmove.stop="startTouchmove"
      >
        <div class="fl" v-if="endStep-startStep>=75">{{startStep | timeFilter}}</div>
      </div>
      <div
        ref="endbar"
        class="bar endbar"
        @touchstart.stop="endTouchstart"
        @touchmove.stop="endTouchmove"
      >
        <div class="fl" v-if="endStep-startStep>=75">{{endStep | timeFilter}}</div>
      </div>
      <div class="selectBar" ref="selectBar"></div>
      <div
        class="f2"
        ref="tip"
        v-if="endStep-startStep<75"
      >{{startStep*perStep | timeFilter}}-{{endStep*perStep | timeFilter}}</div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Watch, Prop, Vue } from "vue-property-decorator";

@Component({
  filters: {
    timeFilter(date: number): string {
      //拿到的是分钟数,转化为时分
      date = date;
      let hours = Math.floor(date / 60);
      let minutes = date % 60;
      let str = "";
      if (hours < 10) {
        str += "0";
      }
      str += hours + ":";
      if (minutes < 10) {
        str += "0";
      }
      str += minutes;
      return str;
    }
  }
})
export default class slider extends Vue {
  @Prop() private option!: any;
  @Prop() private value!:any;
  @Watch('value',{deep:true})
  onChangeValue(newVal:any){
    if(this.emiting){
      this.emiting = false
      return
    }
    this.startStep = newVal.beginTime / this.perStep;
    this.endStep = newVal.endTime / this.perStep;
    let leftMove = this.step*(this.startStep-this.intervalStart)+'px'
    let rightMove = this.step*(this.endStep-this.intervalStart)+this.$endbar.clientWidth/2+'px'
    this.$bar.style.left = leftMove
    this.$endbar.style.left = rightMove
    this.setTipLeft();
    this.setSelectBarStyle();
  }
  emiting:boolean = false //防死循环
  $ruler: any = ""; // 滑竿
  $bar: any = ""; // 左侧滑块
  $endbar: any = ""; // 右侧滑块
  startX: number = 0; // 左侧滑块位置
  endX: number = 0; // 右侧滑块位置
  step: number = 0; // 滑竿在限定范围内可以分多少步
  perStep: number = 10; //一步多少分钟
  intervalStart: number = 120;
  intervalEnd: number = 240;
  startStep: number = 120;
  endStep: number = 240;
  amountW: number = 240; //  滑竿多长距离
  firstTouchStart: number = 0;
  firstTouchEnd: number = 0;
  mounted() {
    this.intervalStart = this.option.beginTime / this.perStep;
    this.startStep = this.value.beginTime / this.perStep;
    this.endStep = this.value.endTime / this.perStep;
    this.intervalEnd = this.option.endTime / this.perStep;
    this.initSlider();
    this.$bar.style.left = (this.startStep-this.intervalStart) * this.step-this.$bar.clientWidth/3+ "px";
    this.$endbar.style.left = (this.endStep-this.intervalStart) * this.step+this.$endbar.clientWidth/2 + "px";
    this.setSelectBarStyle();
  }
  initSlider() {
    this.$ruler = this.$refs.ruler;
    this.$bar = this.$refs.bar;
    this.$endbar = this.$refs.endbar;
    // 滑竿多长距离单位px
    this.amountW = this.$ruler.clientWidth - this.$bar.clientWidth;
    // 每一步多少px
    this.step = this.amountW / (this.intervalEnd - this.intervalStart);
    this.setTipLeft();
  }
  startTouchstart(e: TouchEvent) {
    // 开始滑动时滑块的位置
    this.startX = e.touches[0].pageX;
    if (!this.firstTouchStart) {
      this.firstTouchStart = e.touches[0].pageX-(this.startStep-this.intervalStart)*this.step;
    }
  }
  startTouchmove(e: TouchEvent) {
    // 滑动距离=当前滑块x距离-最开始滑块距离
    let slidedis = e.touches[0].pageX - this.firstTouchStart;

    if (slidedis < 0) {
      //不允许滑块超过起点
      slidedis = 0;
    }
    if (slidedis > this.amountW) {
      slidedis = this.amountW;
    }
    let ste = Math.round(slidedis / this.step);
    if (ste + this.intervalStart >= this.endStep) {
      return;
    }
    this.startStep = ste + this.intervalStart;
    this.$bar.style.left = (this.startStep-this.intervalStart) * this.step-this.$bar.clientWidth/3+ "px";
    this.setTipLeft();
    this.setSelectBarStyle();
  }
  endTouchstart(e: TouchEvent) {
    // 开始滑动时滑块的位置
    this.endX = e.touches[0].pageX;
    if (!this.firstTouchStart) {
      this.firstTouchStart = e.touches[0].pageX +(this.intervalEnd-this.endStep)*this.step- this.amountW;
    }
  }
  endTouchmove(e: TouchEvent) {
    // 滑动距离=当前滑块x距离-最开始滑块距离
    let slidedis = e.touches[0].pageX - this.firstTouchStart;
    if (slidedis > this.amountW) {
      //不允许滑块超过终点
      slidedis = this.amountW;
    }
    let ste = Math.round(slidedis / this.step);

    if (this.startStep >= ste + this.intervalStart) {
      return;
    }
    this.endStep = ste + this.intervalStart;
    this.$endbar.style.left = (this.endStep-this.intervalStart) * this.step+this.$endbar.clientWidth/2 + "px";
    this.setTipLeft();
    this.setSelectBarStyle();
  }
  setTipLeft() {
    this.$nextTick(() => {
      let end = this.$endbar.offsetLeft;
      let begin = this.$bar.offsetLeft;
      let tip: any = this.$refs.tip;
      if (tip) {
        tip.style.left =
          (end + begin) / 2 -
          tip.clientWidth / 2 +
          this.$endbar.clientWidth / 2 +
          "px";
      }
    });
  }
  setSelectBarStyle() {
    this.$nextTick(() => {
      let right =
        this.$ruler.clientWidth -
        this.$endbar.offsetLeft -
        this.$endbar.clientWidth;
      let left = this.$bar.offsetLeft;
      let selectBar: any = this.$refs.selectBar;
      if (selectBar) {
        selectBar.style.left = left + "px";
        selectBar.style.right = right + "px";
      }
    });
    this.emiting = true
    this.$emit('input',{
      beginTime:this.startStep*this.perStep,
      endTime:this.endStep*this.perStep
    })
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="less">
.clearfix {
  &:after {
    content: "";
    display: block;
    clear: both;
  }
}
.slider {
  margin: auto;
  width: 100%;
  .ruler {
    height: 0.53rem;
    position: relative;
    .selectBar {
      background: #bde2f5;
      height: 100%;
      position: absolute;
      left: 0;
      right: 0;
      z-index: 4;
    }
    .bar {
      position: absolute;
      top: -0.08rem;
      width: 0.23rem;
      height: 0.69rem;
      z-index: 6;
      background: rgba(73, 199, 238, 1);
      border-radius: 0.04rem;
      .fl {
        position: absolute;
        top: -1.1rem;
        padding: 0.07rem;
        left: -0.43rem;
        border-radius: 0.05rem;
        font-size: 0.32rem;
        font-family: PingFangSC-Regular, PingFang SC;
        font-weight: 400;
        background: #49c7ee;
        color: rgba(255, 255, 255, 1);
        line-height: 0.45rem;
      }
    }
    .f2 {
      position: absolute;
      top: -1.18rem;
      padding: 0.07rem;
      border-radius: 0.05rem;
      white-space: nowrap;
      font-size: 0.32rem;
      font-family: PingFangSC-Regular, PingFang SC;
      font-weight: 400;
      background: #49c7ee;
      color: rgba(255, 255, 255, 1);
      line-height: 0.45rem;
    }
    .startbar {
      left: -.078rem;
    }
    .endbar {
      right: -.115rem;
      background: rgba(73, 199, 238, 1);
    }
  }
}
</style>
