<template>
  <div id="appointment" class="box_flex column">
    <v-nav-bar
      class="flex_shrink"
      :title="title"
      rightIcon="explain"
      @clickRight="explain"
      :border="true"
    ></v-nav-bar>
    <van-dropdown-menu class="flex_shrink">
      <van-dropdown-item
        :title="searchParams.building?'':'楼栋'"
        @change="getFloorList()"
        v-model="searchParams.building"
        :options="menuOption.building"
      />
      <van-dropdown-item
        :title="searchParams.floor?'':'楼层'"
        v-model="searchParams.floor"
        :options="menuOption.floor"
      />
      <van-dropdown-item
        :title="searchParams.duration?'':'可预约时长'"
        v-model="searchParams.duration"
        :options="menuOption.duration"
      />

      <!-- 双行时间选择器,感觉以后会用上,先不删 -->
      <!-- <div @click="selectTimePopup=true" role="button" class="van-dropdown-menu__item flex_shrink">
        <span class="van-dropdown-menu__title">
          <div class="van-ellipsis">{{searchParams.beginTime+'时-' + searchParams.endTime+'时'}}</div>
        </span>
      </div>-->
    </van-dropdown-menu>
    <div class="flex_shrink">
      <VDatepicker v-model="searchParams.classroomAppointmentDate"></VDatepicker>
    </div>
    <div class="list_wrap grow_1">
      <van-pull-refresh v-model="isRefresh" @refresh="onRefresh">
        <van-list
          :immediate-check="false"
          :finished="finished"
          finished-text="已加载全部"
          v-model="loading"
          @load="onLoad"
        >
          <slot name="content">
            <div class="child" v-for="(room,index) in roomList" :key="index">
              <div class="top box_flex">
                <div class="img_wrap">
                  <img :src="`/downloads/storage/images/${room.classroomPhoto}`" alt />
                </div>
                <div class="info_wrap">
                  <div
                    class="room_name"
                  >{{room.buildingName}} {{room.classroomName}}-{{room.floor}}F {{room.campus}}</div>
                  <div class="room_count box_flex">
                    <img src="../assets/images/home/icon_pnumber@2x.png" />
                    可容纳{{room.maxUserNum}}人
                  </div>
                  <div v-if="room.equipment" class="room_util box_flex">
                    <div
                      v-if="room.equipment.indexOf('电脑')!==-1"
                      class="util_wrap box_flex column flex_center"
                    >
                      <img src="../assets/images/home/icon_computer@2x.png" />
                      <div>电脑</div>
                    </div>
                    <div
                      v-if="room.equipment.indexOf('白板')!==-1"
                      class="util_wrap box_flex column flex_center"
                    >
                      <img src="../assets/images/home/icon_whiteboard@2x.png" />
                      <div>白板</div>
                    </div>
                    <div
                      v-if="room.equipment.indexOf('投影仪')!==-1"
                      class="util_wrap box_flex column flex_center"
                    >
                      <img src="../assets/images/home/icon_projector@2x.png" />
                      <div>投影仪</div>
                    </div>
                  </div>
                </div>
              </div>
              <div class="separator">
                <div class="gray_ball left"></div>
                <div class="gray_ball right"></div>
              </div>
              <div class="bottom box_flex flex_between align_center">
                <timeBar :room="room" bar_width="5.87"></timeBar>
                <button class="btn submit_btn" @click="goBooking(index)">预约</button>
              </div>
            </div>
          </slot>
        </van-list>
      </van-pull-refresh>
    </div>

    <van-popup v-model="selectTimePopup" position="bottom">
      <van-picker
        show-toolbar
        :columns="timeAreaColumns"
        @cancel="selectTimePopup = false"
        @confirm="onTimeAreaConfirm"
        @change="onChangeTime"
      />
    </van-popup>
    <van-popup class="explain" v-model="showExplain">
      <div class="explain_title">预约说明</div>
      <div
        class="explain_detail"
        v-if="$attrs.appointmentOption.appointmentInstruction"
        v-html="$attrs.appointmentOption.appointmentInstruction"
      ></div>
      <div class="empty_explain" v-else>
        <img src="../assets/images/empty_nonescore@2x.png" alt />
        <p>老师暂未发布说明</p>
      </div>
    </van-popup>
  </div>
</template>

<script lang="ts">
import api from "../api/index";
import { Component, Watch, Prop, Vue } from "vue-property-decorator";

import VDatepicker from "../components/VDatePicker.vue";
import timeBar from "../components/timeBar.vue";
@Component({
  components: {
    VDatepicker,
    timeBar
  }
})
export default class home extends Vue {
  selectTimePopup: Boolean = false;
  timeBarOption: any = {
    // 时间条总范围
    beginTime: 480,
    endTime: 1440 //单位分钟
  };
  showExplain: Boolean = false;
  isRefresh: Boolean = false;
  loading: Boolean = false;
  onRefresh() {
    this.page = 0;
    this.roomList = []; //目的是销毁timebar,不然它不触发mounted
    this.getRoomList();
  }
  onLoad() {
    if (this.isActivated) {
      this.isActivated = false;
      this.loading = false;
      return;
    }
    this.page++;
    this.getRoomList();
  }
  page: number = 0;
  finished: Boolean = false;
  searchParams: any = {
    building: "",
    floor: "",
    duration: "",
    beginTime: 0,
    endTime: 24,
    classroomAppointmentDate: new Date().format("yyyy-MM-dd"),
    size: 10
  };
  timeAreaColumns: Array<any> = [
    {
      values: [
        "0时",
        "1时",
        "2时",
        "3时",
        "4时",
        "5时",
        "6时",
        "7时",
        "8时",
        "9时",
        "10时",
        "11时",
        "12时",
        "13时",
        "14时",
        "15时",
        "16时",
        "17时",
        "18时",
        "19时",
        "20时",
        "21时",
        "22时",
        "23时",
        "24时"
      ],
      className: "column1"
    },
    {
      values: [
        "0时",
        "1时",
        "2时",
        "3时",
        "4时",
        "5时",
        "6时",
        "7时",
        "8时",
        "9时",
        "10时",
        "11时",
        "12时",
        "13时",
        "14时",
        "15时",
        "16时",
        "17时",
        "18时",
        "19时",
        "20时",
        "21时",
        "22时",
        "23时",
        "24时"
      ],
      className: "column2",
      defaultIndex: 2
    }
  ];
  menuOption: any = {
    building: [],
    floor: [],
    duration: [
      { text: "全部", value: "" },
      { text: "30分钟", value: "30" },
      { text: "1小时", value: "60" },
      { text: "2小时", value: "120" },
      { text: "3小时", value: "180" },
      { text: "4小时", value: "240" }
    ]
  };
  temporary: any = {
    beginTime: 0,
    endTime: 0
  };
  currentDate: string = "";
  roomList: Array<any> = []; //可预约房间
  title: string = "教室预约";
  timeOutNum: number = 0;
  getFloorList(newVal: any) {
    api.getFloorList({ buildingName: newVal }).then(o => {
      this.menuOption.floor = o.map((a: any) => {
        return { text: `第${a}层`, value: a + "" };
      });
      this.menuOption.floor.unshift({
        text: "全部",
        value: ""
      });
    });
  }
  @Watch("searchParams", {
    deep: true
  })
  toSearch() {
    let today = new Date().format("yyyy/MM/dd") + " 00:00:00";
    let todayTime = new Date(today).getTime();
    let appointmentOption: any = this.$attrs.appointmentOption;
    let canAppointmentDay =
      todayTime + 24 * 60 * 60 * 1000 * appointmentOption.appointmentDays;
    this.roomList = []; //目的是销毁timebar,不然它不触发mounted keepalive还是挺难受的
    this.page = 0;
    let appointmentTime = new Date(
      this.searchParams.classroomAppointmentDate
    ).getTime();
    if (appointmentTime > canAppointmentDay) {
      this.$toast(`只可预约${appointmentOption.appointmentDays}天内`);
      return;
    }
    if (todayTime > appointmentTime) {
      this.$toast(`只可预约当天以及当天之后`);
      return;
    }
    this.loading = true;
    this.finished = false;
    this.getRoomList();
  }

  getRoomList() {
    if (this.timeOutNum) {
      //避免短时间内多次调用
      clearTimeout(this.timeOutNum);
    }
    this.timeOutNum = setTimeout(() => {
      let buildingList = [];
      if (this.searchParams.building) {
        buildingList.push(this.searchParams.building);
      }
      let floorList = [];
      if (this.searchParams.floor) {
        floorList.push(this.searchParams.floor);
      }
      let params = {
        page: this.page,
        size: this.searchParams.size,
        duration: this.searchParams.duration,
        classroomAppointmentDate: this.searchParams.classroomAppointmentDate,
        buildingList: buildingList,
        floorList: floorList
      };
      api.getRoomList(params).then(o => {
        if (o.totalPages - 1 <= this.page) {
          //最后一页了,
          this.finished = true;
        }
        if (this.page) {
          //第一页为0,如果不是第一页就不能覆盖
          this.roomList = [...this.roomList, ...o.content];
        } else {
          this.roomList = o.content;
          this.isRefresh = false;
        }
        this.loading = false;
      });
    }, 100);
  }
  explain() {
    this.showExplain = true;
  }
  onChangeTime(picker: any, values: Array<string>) {
    let a: number = parseInt(values[0].replace("时", ""));
    let b: number = parseInt(values[1].replace("时", ""));
    if (a > b) {
      this.temporary = {
        beginTime: b,
        endTime: a
      };
    } else {
      this.temporary = {
        beginTime: a,
        endTime: b
      };
    }
  }
  onTimeAreaConfirm() {
    this.searchParams.beginTime = this.temporary.beginTime;
    this.searchParams.endTime = this.temporary.endTime;
    this.selectTimePopup = false;
  }
  goBooking(index: number) {
    this.$router.push({
      name: "bookingRoom",
      params: {
        room: this.roomList[index],
        appointmentDate: this.searchParams.classroomAppointmentDate
      }
    });
  }
  isActivated: Boolean = false;
  activated() {
    this.isActivated = true;
    this.page = 0;
    this.getRoomList();
  }
  // 然后就是vue的生命周期
  mounted() {
    api.getBuildingList().then(o => {
      this.menuOption.building = o.map((a: any) => {
        return { text: a, value: a };
      });
      this.menuOption.building.unshift({
        text: "全部",
        value: ""
      });
    });
  }
}
</script>
<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="less">
#appointment {
  height: 100%;
}
.explain {
  width: 6.6667rem;
  max-height: 8rem;
  min-height: 5rem;
  border-radius: 0.08rem;
  padding: 0.2667rem;
  .explain_title {
    width: 100%;
    line-height: 0.44rem;
    text-align: center;
    height: 0.44rem;
    font-size: 0.32rem;
    font-family: PingFangSC-Regular, PingFang SC;
    font-weight: 400;
    color: rgba(48, 49, 51, 1);
    line-height: 0.44rem;
  }
  .explain_detail {
    width: 100%;
    padding: 0.2667rem;
  }
  .empty_explain {
    img {
      width: 100%;
    }
    p {
      text-align: center;
      font-size: 0.4rem;
      color: #909399;
    }
  }
}
.list_wrap {
  background: #f4f5f7;
  padding: 0.4rem;
  padding-bottom: 0;
  overflow: auto;
  min-height: 10.6667rem;
  .child {
    width: 100%;
    background: white;
    margin-bottom: 0.32rem;
    &:hover {
      background: #fcfdff;
    }
    box-shadow: 0rem 0.0533rem 0.08rem 0rem rgba(236, 236, 238, 0.3);
    border-radius: 0.1333rem;
    .top {
      height: 3.0667rem;
      padding: 0.2667rem;
      .img_wrap {
        width: 3.2rem;
        height: 2.4rem;
        border-radius: 0.1067rem;
        background: #96b5f0;
        img {
          width: 100%;
          height: 100%;
        }
      }
      .info_wrap {
        width: 5.4667rem;
        height: 2.4rem;
        padding-left: 0.32rem;
        color: #909399;
        .room_name {
          height: 0.6133rem;
          font-size: 0.4267rem;
          font-family: PingFangSC-Regular, PingFang SC;
          font-weight: 400;
          color: rgba(48, 49, 51, 1);
          line-height: 0.6133rem;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .room_count {
          height: 0.4533rem;
          margin-top: 0.1333rem;
          img {
            width: 0.34rem;
            height: 0.34rem;
            top: 0.06rem;
            position: relative;
            margin-right: 0.1333rem;
          }
        }
        .room_util {
          margin-top: 0.1333rem;
          .util_wrap {
            margin-right: 0.4rem;
            img {
              width: 0.64rem;
              height: 0.64rem;
            }
          }
        }
      }
    }
    .separator {
      width: 8.2533rem;
      height: 0.0267rem;
      border-top: 0.0267rem dashed #c0c4cc;
      margin-left: 0.48rem;
      position: relative;
      .gray_ball {
        width: 0.32rem;
        height: 0.32rem;
        border-radius: 50%;
        background: #f4f5f7;
        position: absolute;
        top: -0.17rem;
        &.left {
          left: -0.6133rem;
        }
        &.right {
          right: -0.6133rem;
        }
      }
    }
    .bottom {
      padding: 0.27rem;
      height: 2rem;
    }
  }
}
h3 {
  margin: 1.0667rem 0 0;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 0.2667rem;
}
a {
  color: #42b983;
}
</style>
