<template>
  <div
    class="time_bar"
    ref="time_bar"
    :style="{width:bar_width+'rem','margin-top':isEdit?'1rem':''}"
  >
    <div
      v-for="item in emptyTime"
      :key="item.beginTime"
      class="empty_bar"
      @click="selectEmptyBar(item)"
      :style="getEmptyBarStyle(item)"
    ></div>
    <div v-for="scale in getScaleList()" :key="scale" class="scale" :style="getScalStyle(scale)">
      <div class="even" v-if="!(scale%2)">{{('00'+scale).substr(scale.toString().length)}}</div>
    </div>
    <div class="slider_wrap" :style="getEmptyBarStyle(sliderOption)" v-if="isEdit">
      <slider v-if="upDataSlider" :option="sliderOption" v-model="editParams"></slider>
    </div>
    <div class="begin_time">{{getHourMinute(timeBarOption.beginTime)}}</div>
    <div class="end_time">{{getHourMinute(timeBarOption.endTime)}}</div>
  </div>
</template>

<script lang="ts">
import { Component, Watch, Prop, Vue } from "vue-property-decorator";
import slider from "./silder.vue";
@Component({
  components: {
    slider
  }
})
export default class timeBar extends Vue {
  @Prop() private bar_width!: number;
  @Prop() private isEdit?: boolean;
  @Prop() private value!: any;
  @Prop() private room!: any; //教室信息
  // @Watch("timeParams")
  // onChangeTimeArea(newVal:any){
  //   this.upDataSlider = false
  //   this.$nextTick(()=>{
  //     this.sliderOption = newVal;
  //     this.upDataSlider = true
  //   })
  // }
  @Watch("value", { deep: true })
  onChangeTime(newVal: any) {
    if (this.emiting) {
      this.emiting = false;
      return;
    }
    this.isChangeValue = true
    if (newVal&&newVal.beginTime && newVal.endTime) {
      this.upDataSlider = false;
      this.emptyTime.forEach(o => {
        if (newVal.beginTime >= o.beginTime && newVal.endTime <= o.endTime) {
          this.$nextTick(() => {
            this.sliderOption = o;
            this.editParams = JSON.parse(JSON.stringify(newVal));
            this.upDataSlider = true;
          });
        }
      });
    }
  }
  @Watch("editParams")
  onEdit(newVal: any) {
    if(this.isChangeValue){
      this.isChangeValue = false
      return
    }
    this.emiting = true;//子节点传给父节点,父节点会返回来,防死循环标识
    this.$emit("input", newVal);
  }
  emiting: boolean = false; //防死循环
  isChangeValue:Boolean = false;
  sliderOption: any = {
    // 正在编辑的时间条范围
    beginTime: 0,
    endTime: 0 //单位分钟
  };
  editParams: any = {
    //编辑中的时间
    beginTime: 0,
    endTime: 0 //单位分钟
  };
  timeBarOption: any = {
    //时间条总范围
    beginTime: 0,
    endTime: 0 //单位分钟
  };
  upDataSlider: boolean = false;
  selectEmptyBar(item: any): void {
    this.upDataSlider = false;
    this.$nextTick(() => {
      this.sliderOption = item;
      this.editParams = JSON.parse(JSON.stringify(item));
      this.upDataSlider = true;
    });
  }
  getEmptyBarStyle(item: any): string {
    let totalLength: number = this.bar_width; //条的总长度 单位rem
    let left: string =
      (
        ((item.beginTime - this.timeBarOption.beginTime) /
          (this.timeBarOption.endTime - this.timeBarOption.beginTime)) *
        totalLength
      )
        .toString()
        .substr(0, 5) + "rem";
    let width: string =
      (
        ((item.endTime - item.beginTime) /
          (this.timeBarOption.endTime - this.timeBarOption.beginTime)) *
        totalLength
      )
        .toString()
        .substr(0, 5) + "rem";
    return `width:${width};left:${left}`;
  }
  getScalStyle(scale: number): string {
    let totalLength: number = this.bar_width; //条的总长度 单位rem
    let left: string =
      (
        ((scale * 60 - this.timeBarOption.beginTime) /
          (this.timeBarOption.endTime - this.timeBarOption.beginTime)) *
        totalLength
      )
        .toString()
        .substr(0, 5) + "rem";
    let height: string = scale % 2 ? "0.1rem" : "0.21rem"; //单数短 偶数长 刻度了解一下
    return `height:${height};left:${left}`;
  }
  getScaleList(): Array<number> {
    let start: number = Math.ceil(this.timeBarOption.beginTime / 60);
    let endTime: number = Math.ceil(this.timeBarOption.endTime / 60);
    let arr: Array<number> = [];
    for (let i = start; i <= endTime; i++) {
      arr.push(i);
    }
    return arr;
  }
  emptyTime: Array<any> = [];
  getEmptyTime(): Array<object> {
    //返回可预约的时间段
    this.timeBarOption.beginTime = this.getMinute(
      this.room.schedulingTimeVOList[0].beginTime
    );
    this.timeBarOption.endTime = this.getMinute(
      this.room.schedulingTimeVOList[this.room.schedulingTimeVOList.length - 1]
        .endTime
    );
    let list: Array<any> = this.room.timeVOList.map((o: any) => {
      //已经被预约的时间段
      return {
        beginTime: this.getMinute(o.beginTime),
        endTime: this.getMinute(o.endTime)
      };
    });
    let middleList: Array<any> = []; //不可预约的中间时间段
    this.room.schedulingTimeVOList.forEach((o: any, index: number) => {
      if (this.room.schedulingTimeVOList[index + 1]) {
        middleList.push({
          beginTime: this.getMinute(o.endTime),
          endTime: this.getMinute(
            this.room.schedulingTimeVOList[index + 1].beginTime
          )
        });
      }
    });
    list = [...list, ...middleList]
      .filter((o: any) => {
        return o.beginTime != o.endTime;
      })
      .sort((a, b) => {
        //合并不可预约时间段和已被预约时间段,然后排序
        return a.beginTime - b.beginTime;
      });
    let emptyTime: Array<any> = [];
    list.forEach((o, index) => {
      emptyTime.push({
        beginTime:
          index === 0 ? this.timeBarOption.beginTime : list[index - 1].endTime,
        endTime: o.beginTime
      });
    });
    if (list.length) {
      emptyTime.push({
        beginTime: list[list.length - 1].endTime,
        endTime: this.timeBarOption.endTime
      });
    } else {
      emptyTime.push({
        beginTime: this.timeBarOption.beginTime,
        endTime: this.timeBarOption.endTime
      });
    }

    return emptyTime.filter(o => {
      return o.beginTime != o.endTime;
    });
  }
  getMinute(time: string): number {
    let hour: number = parseInt(time.split(":")[0]);
    return hour * 60 + parseInt(time.split(":")[1]);
  }
  getHourMinute(minute: number): string {
    let hour: string = parseInt((minute / 60).toString()) + "";
    hour = ("00" + hour).substr(hour.length);
    let m: string = (minute % 60) + "";
    m = ("00" + m).substr(m.length);
    return hour + ":" + m;
  }
  mounted() {
    this.emptyTime = this.getEmptyTime();
    this.onChangeTime(this.value)
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="less">
.time_bar {
  height: 0.54rem;
  // margin-top: 0.44rem;
  background-image: url("../../src/assets/images/home/pic_cannotselect_b@2x.png");
  background-size: auto 100%;
  position: relative;
  z-index: 1;
  .slider_wrap {
    position: absolute;
    height: 100%;
    left: 1rem;
    z-index: 4;
    width: 3rem;
  }
  .empty_bar {
    position: absolute;
    top: 0;
    height: 100%;
    background: #f7faff;
    z-index: 2;
  }
  .scale {
    position: absolute;
    z-index: 4;
    top: 0;
    width: 0.01rem;
    border-left: 0.0267rem solid #cad2e8;
    .even {
      position: absolute;
      top: -0.55rem;
      width: 0.33rem;
      height: 0.44rem;
      font-size: 0.32rem;
      color: #c8ccd3;
      left: -0.16rem;
    }
  }
  .begin_time {
    position: absolute;
    left: 0;
    bottom: -0.55rem;
    color: #c8ccd3;
  }
  .end_time {
    position: absolute;
    right: 0;
    bottom: -0.55rem;
    color: #c8ccd3;
  }
}
</style>
