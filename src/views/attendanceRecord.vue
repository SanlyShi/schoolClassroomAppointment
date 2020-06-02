<template>
  <div id="attendanceRecord" class="box_flex column">
    <v-nav-bar
      class="flex_shrink"
      :title="$attrs.title"
      rightIcon="saoyisao"
      @clickRight="scan"
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
        :title="searchParams.auditStatus?'':'状态'"
        v-model="searchParams.auditStatus"
        :options="menuOption.auditStatus"
      />
    </van-dropdown-menu>
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
            <div
              v-for="(record,index) in appointmentRecord"
              @click="showDetail(record.id)"
              :key="index"
              class="child"
            >
              <div class="form_title">
                <div class="title_bar"></div>
                {{record.buildingName}} {{record.classroomName}}-{{record.floor}}F {{record.campus}}
              </div>
              <div
                class="appointment_status"
                :class="record.status==='WAIT_START'?record.auditStatus:record.status"
              >{{getStatusText(record.status==='WAIT_START'?record.auditStatus:record.status)}}</div>
              <div class="top box_flex">
                <div class="img_wrap">
                  <img :src="`/downloads/storage/images/${record.classroomPhoto}`" alt />
                </div>
                <div class="info_wrap">
                  <div class="room_count">
                    <img src="../assets/images/home/icon_pnumber@2x.png" />
                    可容纳{{record.maxUserNum}}人
                  </div>
                  <div class="room_count">
                    <img src="../assets/images/home/icon_comments@2x.png" />
                    {{record.remark}}
                  </div>
                  <div v-if="record.equipment" class="room_util box_flex">
                    <div
                      v-if="record.equipment.indexOf('电脑')!==-1"
                      class="util_wrap box_flex column flex_center"
                    >
                      <img src="../assets/images/home/icon_computer@2x.png" />
                      <div>电脑</div>
                    </div>
                    <div
                      v-if="record.equipment.indexOf('白板')!==-1"
                      class="util_wrap box_flex column flex_center"
                    >
                      <img src="../assets/images/home/icon_whiteboard@2x.png" />
                      <div>白板</div>
                    </div>
                    <div
                      v-if="record.equipment.indexOf('投影仪')!==-1"
                      class="util_wrap box_flex column flex_center"
                    >
                      <img src="../assets/images/home/icon_projector@2x.png" />
                      <div>投影仪</div>
                    </div>
                  </div>
                </div>
              </div>
              <div class="middle box_flex">
                <div class="left">预约时段</div>
                <div
                  class="right"
                >{{record.appointmentDate.replace(/-/g,'.')}} {{record.startTime}}-{{record.endTime}}</div>
              </div>
            </div>
          </slot>
        </van-list>
      </van-pull-refresh>
    </div>
    <van-popup class="scan" v-model="showScan">
      <div class="scan_title">提示</div>
      <div class="scan_detail">请打开浏览器-扫一扫或是微信扫一扫进行扫码签到</div>
    </van-popup>
  </div>
</template>

<script lang="ts">
import api from "../api/index";
import { Component, Watch, Prop, Vue } from "vue-property-decorator";
@Component({
  components: {}
})
export default class home extends Vue {
  searchParams: any = {
    building: "",
    floor: "",
    beginTime: 0,
    endTime: 24,
    auditStatus: "",
    size: 10
  };
  page: number = 0;
  finished: Boolean = false;
  menuOption: any = {
    building: [],
    floor: [],
    auditStatus: [
      {
        text: "正在审核",
        value: "WAIT"
      },
      {
        text: "审核成功",
        value: "PASS"
      },
      {
        text: "审核不通过",
        value: "NOT_PASS"
      },
      {
        text: "未签到",
        value: "NOT_SIGN_IN"
      },
      {
        text: "已签到",
        value: "SIGN_IN"
      },
      {
        text: "取消预约",
        value: "CANCEL"
      }
    ]
  };
  temporary: any = {
    beginTime: 0,
    endTime: 0
  };
  currentDate: string = "";
  appointmentRecord: Array<any> = []; //预约记录
  timeOutNum: number = 0;
  isRefresh: Boolean = false;
  loading: Boolean = false;
  showScan: Boolean = false;
  onRefresh() {
    this.page = 0;
    this.getRecord();
  }
  scan() {
    this.showScan = true;
  }
  onLoad() {
    if (this.isActivated) {
      this.isActivated = false;
      this.loading = false;
      return;
    }
    this.page++;
    this.getRecord();
  }
  getFloorList(newVal: any) {
    api.getFloorList({ buildingName: newVal }).then(o => {
      this.menuOption.floor = o.map((a: any) => {
        return { text: `第${a}层`, value: a };
      });
    });
  }
  @Watch("searchParams", {
    deep: true
  })
  toSearch() {
    this.page = 0;
    this.getRecord();
  }
  getRecord() {
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
        auditStatus: this.searchParams.auditStatus
          ? this.searchParams.auditStatus
          : [],
        buildingList: buildingList,
        floorList: floorList
      };
      let type = "";
      if (this.$attrs.title === "参与记录") {
        type = "join";
      }
      api.getAppointmentRecord(params, type).then(o => {
        console.log("o", o);
        if (o.totalPages - 1 === this.page) {
          //最后一页了,
          this.finished = true;
        } else {
          this.finished = false;
        }
        if (this.page) {
          //第一页为0,如果不是第一页就不能覆盖
          this.appointmentRecord = [...this.appointmentRecord, ...o.content];
        } else {
          this.appointmentRecord = o.content;
          this.isRefresh = false;
        }
        this.loading = false;
      });
    }, 100);
  }
  showDetail(id: number) {
    //'31'有数据
    this.$router.push({
      name: "appointmentDetail",
      params: {
        appointmentId: id + ""
      }
    });
  }
  getStatusText(status: string) {
    switch (status) {
      case "WAIT":
        return "正在审核";
      case "PASS":
        return "审核成功";
      case "NOT_PASS":
        return "审核不通过";
      case "NOT_SIGN_IN":
        return "未签到";
      case "SIGN_IN":
        return "已签到";
      case "CANCEL":
        return "取消预约";
      default:
        return status;
    }
  }
  goBooking() {
    this.$router.push({
      name: "bookingRoom",
      params: {
        a: "1"
      }
    });
  }
  isActivated: boolean = false;
  activated() {
    this.isActivated = true;
    this.page = 0;
    this.getRecord();
    api.getBuildingList().then(o => {
      this.menuOption.building = o.map((a: any) => {
        return { text: a, value: a };
      });
    });
  }
}
</script>
<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="less">
#attendanceRecord {
  height: 100%;
}
.scan {
  width: 6.6667rem;
  height: 8rem;
  border-radius: 0.08rem;
  padding: 0.2667rem;
  .scan_title {
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
  .scan_detail {
    width: 100%;
    padding: 0.2667rem;
  }
}
.list_wrap {
  background: #f4f5f7;
  padding: 0.4rem;
  min-height: 10.6667rem;
  overflow: auto;
  .child {
    width: 100%;
    background: white;
    padding: 0 0.2667rem;
    position: relative;
    margin-bottom: 0.32rem;
    &:hover {
      background: #fcfdff;
    }
    box-shadow: 0rem 0.0533rem 0.08rem 0rem rgba(236, 236, 238, 0.3);
    border-radius: 0.1333rem;
    .top {
      height: 2.9rem;
      padding: 0.2667rem 0;
      .img_wrap {
        width: 3.2rem;
        height: 2.4rem;
        border-radius: 0.1067rem;
        background: #96b5f0;
        img {
          width: 100%;
          border-radius: 0.1067rem;
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
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          img {
            width: 0.34rem;
            top: 0.06rem;
            position: relative;
            height: 0.34rem;
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
    .middle {
      font-size: 0.32rem;
      font-family: PingFangSC-Regular, PingFang SC;
      font-weight: 400;
      color: rgba(144, 147, 153, 1);
      padding-bottom: 0.24rem;
      .left {
        width: 3.2rem;
      }
      .right {
        padding-left: 0.32rem;
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
.appointment_status {
  position: absolute;
  top: 0.24rem;
  right: 0;
  line-height: 0.3733rem;
  font-size: 0.32rem;
  font-family: PingFangSC-Regular, PingFang SC;
  color: rgba(255, 255, 255, 1);
  padding: 0.1rem 0.24rem;
  font-weight: 400;
  border-radius: 1.3333rem 0rem 0rem 1.3333rem;
  &.PASS {
    background: #41d6b4;
  }
  &.WAIT {
    background: #f5c74e;
  }
  &.NOT_PASS {
    background: #f1656e;
  }
  &.CANCEL,
  &.NOT_SIGN_IN {
    background: #c0c4cc;
  }
  &.SIGN_IN {
    background: #49c7ee;
  }
}
</style>
