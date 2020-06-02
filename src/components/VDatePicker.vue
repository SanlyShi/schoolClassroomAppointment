<template>
  <div class="myDatePicker">
    <div class="main box_flex align_center">
      <div @click="show=true" role="button" class="van-dropdown-menu__item flex_shrink">
        <span class="van-dropdown-menu__title">
          <div class="van-ellipsis">{{currentDate|showMonth}}</div>
        </span>
      </div>
      <div
        class="weekDate grow_1"
        @touchstart="touchstart"
        @touchmove="touchmove"
        @touchend="touchend"
      >
        <table class="em-calendar__table">
          <tr class="em-calendar__tr">
            <th class="em-calendar__th">日</th>
            <th class="em-calendar__th">一</th>
            <th class="em-calendar__th">二</th>
            <th class="em-calendar__th">三</th>
            <th class="em-calendar__th">四</th>
            <th class="em-calendar__th">五</th>
            <th class="em-calendar__th">六</th>
          </tr>
          <tr class="em-calendar__tr">
            <td
              class="em-calendar__td"
              @click="selectThisDay(currentMonth.dayList[(curWeek)*7+col-1])"
              v-for="col in 7"
              v-bind:key="col"
            >
              <div
                class="day"
                :class="{isCurMonth:currentMonth.dayList[(curWeek)*7+col-1].isCurrMonth === 0,active:currentMonth.dayList[(curWeek)*7+col-1].isSelect}"
                v-if="currentMonth.dayList.length"
              >
                {{ currentMonth.dayList[(curWeek)*7+col-1].value>9?currentMonth.dayList[(curWeek)*7+col-1].value:'0'+currentMonth.dayList[(curWeek)*7+col-1].value}}
                <span
                  class="ball"
                ></span>
              </div>
            </td>
          </tr>
        </table>
      </div>
    </div>
    <van-popup v-model="show" position="bottom">
      <van-datetime-picker
        type="date"
        :min-date="nowDate"
        @cancel="show=false"
        @confirm="currentDate = selectDate.format('yyyy/MM/dd');show=false"
        v-model="selectDate"
      />
    </van-popup>
  </div>
</template>

<script lang="ts">
import { Component, Watch, Prop, Vue } from "vue-property-decorator";

@Component({
  filters: {
    showMonth(date: Date | string): string {
      if (typeof date === "string") {
        if (date) {
          return new Date(date).format("yyyy-MM");
        } else {
          return "";
        }
      }
      return date.format("yyyy-MM");
    }
  }
})
export default class VDatePicker extends Vue {
  @Prop({ default: "" }) private value!: string;
  show: Boolean = false;
  currentDate: string = "";
  selectDate: string = "";
  @Watch("value")
  setOption(newVal: string) {
    this.currentDate = newVal.replace(/-/g, "/"); //IOS兼容性处理;
  }
  @Watch("currentDate")
  initCalendar(newVal: any) {
    let year = new Date(newVal).getFullYear();
    let month = new Date(newVal).getMonth();
    let day = new Date(newVal).getDate();
    this.getCurrentMonth(year, month, day);
    this.$emit("input", this.currentDate.replace(/\//g, "-")); //
  }
  // 基本日期
  baseDayList: Array<number> = [
    1,
    2,
    3,
    4,
    5,
    6,
    7,
    8,
    9,
    10,
    11,
    12,
    13,
    14,
    15,
    16,
    17,
    18,
    19,
    20,
    21,
    22,
    23,
    24,
    25,
    26,
    27,
    28,
    29,
    30,
    31
  ];
  // 非闰年月份对应的天数
  monthDayCount: Array<number> = [
    31,
    28,
    31,
    30,
    31,
    30,
    31,
    31,
    30,
    31,
    30,
    31
  ];

  nowDate: Date = new Date();
  initDone: boolean = false;
  curWeek: number = 0; //当前显示周,最多六周,最少4周 0-5
  // 当前显示月份
  currentMonth: any = {
    year: 2019,
    month: 4,
    dayList: []
  };
  dateEventListMonthInit: any = {};
  dateEventList: any = {};
  selectDay: string = "";
  loadingRecruitment: boolean = true;
  touchX: number = 0;
  getNotes(year: number, month: number) {
    let beginMonth: string | number = month;
    let endMonth: string | number = month + 2;
    let beginYear = year,
      endYear = year;
    if (!beginMonth) {
      //因为可能现在是一月 上一月就变成12月了
      beginMonth = 12;
      beginYear = beginYear - 1;
    }
    if (endMonth == 13) {
      endMonth = 1;
      endYear += 1;
    }
    if (beginMonth < 10) {
      beginMonth = "0" + beginMonth;
    }
    if (endMonth < 10) {
      endMonth = "0" + endMonth;
    }
    let beginDay =
      this.currentMonth.dayList[0].value > 9
        ? this.currentMonth.dayList[0].value
        : "0" + this.currentMonth.dayList[0].value;
    let endDay =
      this.currentMonth.dayList[this.currentMonth.dayList.length - 1].value > 9
        ? this.currentMonth.dayList[this.currentMonth.dayList.length - 1].value
        : "0" +
          this.currentMonth.dayList[this.currentMonth.dayList.length - 1].value;
    let beginDate = beginYear + "-" + beginMonth + "-" + beginDay;
    let dateEnd = endYear + "-" + endMonth + "-" + endDay;
  }

  selectThisDay(date: any) {
    let year: number = new Date(this.currentDate).getFullYear();
    let month: number =
      new Date(this.currentDate).getMonth() + date.isCurrMonth + 1; //
    if (month === 13) {
      month = 1;
      year++;
    } else if (month === 0) {
      month = 12;
      year--;
    }
    this.currentDate =
      year +
      "/" +
      ("00" + month).substr(month.toString().length) +
      "/" +
      ("00" + date.value).substr(date.value.toString().length);
  }
  /**
   * 获取当前日历显示月份
   */
  getCurrentMonth(year: number, month: number, day: number) {
    let tmpList: Array<number> = [],
      resList: Array<any> = [];
    this.currentMonth.year = year;
    this.currentMonth.month = month;
    let dayIndex = 0;
    let currDayCount = this.monthDayCount[month];
    if (this.isLeapYear(year) && month === 1) {
      currDayCount += 1;
    }
    tmpList = this.baseDayList.slice(0, currDayCount);
    tmpList.forEach((item, index) => {
      if (item === day) {
        dayIndex = index;
        resList.push({
          value: item,
          isSelect: true,
          isCurrMonth: 0
        });
      } else {
        resList.push({
          value: item,
          isSelect: false,
          isCurrMonth: 0
        });
      }
    });

    let firstWeekDay = new Date(year, month, 1).getDay(); // 下个月1号对应时间
    if (!firstWeekDay) {
      firstWeekDay = 7;
    }
    let prevDayCount = this.monthDayCount[month ? month - 1 : 11];
    if (this.isLeapYear(year) && month === 2) {
      prevDayCount += 1;
    }
    tmpList = this.baseDayList.slice(prevDayCount - firstWeekDay, prevDayCount);
    tmpList = tmpList.reverse();
    dayIndex += tmpList.length;
    this.curWeek = parseInt(dayIndex / 7 + "");
    tmpList.forEach(item => {
      resList.unshift({
        value: item,
        isSelect: false,
        isCurrMonth: -1
      });
    });
    tmpList = this.baseDayList.slice(0, 42 - resList.length);
    tmpList.forEach(item => {
      resList.push({
        value: item,
        isSelect: false,
        isCurrMonth: 1
      });
    });
    this.currentMonth.dayList = resList;
    this.getNotes(year, month);
  }

  getDateString(dayInfo: any) {
    const normalizedMonth = this.currentMonth.month + 1 + dayInfo.isCurrMonth;
    const dateString = `${this.currentMonth.year}-${
      normalizedMonth > 9 ? normalizedMonth : "0" + normalizedMonth
    }-${dayInfo.value > 9 ? dayInfo.value : "0" + dayInfo.value}`;
    return dateString;
  }

  /**
   * 判断是否为闰年
   */
  isLeapYear(year: number) {
    return year % 4 === 0 && year % 400 !== 0 ? true : false;
  }
  mounted() {
    this.currentDate = this.value;
  }
  touchstart(e: TouchEvent) {
    this.touchX = e.touches[0].pageX;
  }
  touchmove(e: TouchEvent) {
    if (!this.touchX || this.currentMonth.dayList.length === 0) {
      return;
    }
    if (e.touches[0].pageX - this.touchX < -40) {
      this.touchX = e.touches[0].pageX;
      if (
        this.curWeek < 5 &&
        this.currentMonth.dayList[(this.curWeek + 1) * 7].isCurrMonth === 0
      ) {
        //如果下一周还有属于本月的日期,那么可以右滑
        this.curWeek++;
      }
    } else if (e.touches[0].pageX - this.touchX > 40) {
      this.touchX = e.touches[0].pageX;
      if (this.curWeek > 0) {
        if (
          this.curWeek === 1 &&
          this.currentMonth.dayList[6].isCurrMonth === 0
        ) {
          this.curWeek--;
        } else if (this.curWeek > 1) {
          this.curWeek--;
        }
      }
    }
  }
  touchend(e: TouchEvent) {}
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="less">
.myDatePicker {
  .main {
    height: 1.44rem;
    .van-dropdown-menu__item {
      flex: 0 0 2.48rem;
    }
    .weekDate {
      height: 100%;
      .em-calendar__th {
        color: #909399;
      }
      .day {
        color: #909399;
        height: 0.7467rem;
        width: 0.7467rem;
        margin: 0 auto;
        line-height: 0.7467rem;
        text-align: center;
        font-weight: bold;
        &.isCurMonth {
          color: #606266;
        }
        &.active {
          border-radius: 50%;
          background: #4c76f7;
          font-weight: normal;
          color: white;
          z-index: 2;
          position: relative;
          box-shadow: 0rem 0.0533rem 0.1867rem 0rem rgba(76, 118, 247, 0.6);
        }
      }
      .em-calendar__table {
        width: 100%;
      }
    }
  }
}
</style>
