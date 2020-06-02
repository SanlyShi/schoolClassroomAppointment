<template>
  <div id="bookingRoom" class="bookingRoom">
    <v-nav-bar title="预约申请" :border="true"></v-nav-bar>
    <div class="child" v-if="room">
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
      <div class="middle box_flex">
        <img src="../assets/images/home/icon_comments@2x.png" alt />
        <div class="comment">{{room.remark}}</div>
      </div>
      <div class="bar"></div>
      <div class="bottom box_flex flex_between align_center">
        <timeBar
          v-if="showTimeBar"
          v-model="editParams"
          :room="room"
          ref="timeBar"
          bar_width="8"
          isEdit="true"
        ></timeBar>
      </div>
    </div>
    <div class="form_wrap">
      <van-cell
        :required="true"
        :border="false"
        title="开始时间"
        is-link
        :value-class="editParams.beginTime?'black':''"
        @click="selectTime('beginTime')"
        :value="editParams.beginTime?appointmentDate+' '+timeFilter(editParams.beginTime):'请选择'"
      />
      <van-cell
        :required="true"
        :border="false"
        title="结束时间"
        is-link
        :value-class="editParams.endTime?'black':''"
        @click="selectTime('endTime')"
        :value="editParams.endTime?appointmentDate+' '+timeFilter(editParams.endTime):'请选择'"
      />
    </div>
    <div class="form_wrap">
      <van-cell :required="true" :border="false" title="预约原因" :value="reason.length+'/200'" />
      <textarea v-model="reason" maxlength="200" class="reason" placeholder="请输入原因"></textarea>
    </div>
    <div class="form_wrap">
      <van-cell :border="false" title="参与成员">
        <img
          slot="right-icon"
          class="add_person"
          @click="show=true"
          src="../assets/images/home/btn_addhuman@2x.png"
        />
      </van-cell>
      <div class="person_wrap box_flex flex_wrap">
        <div v-for="(person,index) in personList" :key="index" class="person">
          <!-- 编辑的时候第一个人是预约人,不允许删 -->
          <img
            v-if="!($route.params.detail&&index===0)"
            @click="deletePerson(index)"
            src="../assets/images/home/icon_grayclose@2x.png"
          />
          {{person.name}}
        </div>
      </div>
    </div>
    <div class="form_wrap button_wrap">
      <button
        class="btn big submit_btn"
        v-if="$route.params.room"
        :class="{disabled:!canSubmit}"
        @click="submit()"
      >确认预约</button>
      <button
        class="btn big submit_btn"
        v-else
        :class="{disabled:!canSubmit}"
        @click="submit()"
      >确认修改</button>
    </div>
    <van-dialog
      class="detect_dialog"
      @confirm="confirmPerson"
      v-model="show"
      title="请输入姓名或学工号"
      show-cancel-button
    >
      <detect ref="detectRef" @afterSelected="onSelectPerson"></detect>
    </van-dialog>
    <van-popup v-model="selectTimePopup" position="bottom">
      <van-datetime-picker
        type="time"
        :min-hour="parseInt(timeBarOption.beginTime/60)"
        :max-hour="parseInt(timeBarOption.endTime/60)"
        @cancel="selectTimePopup=false"
        @confirm="confirmSelect()"
        v-model="temporary"
      />
    </van-popup>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from "vue-property-decorator";
import api from "../api/index";
import timeBar from "../components/timeBar.vue";
@Component({
  filters: {
    timeFilter(date: number): string {
      //拿到的是分钟数,转化为时分
      if (!date) {
        return "请选择";
      }
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
  },
  components: {
    timeBar
  }
})
export default class bookingRoom extends Vue {
  selectTimePopup: boolean = false;
  temporary: string = ""; //暂存时间
  editType = "beginTime";
  room: any = {};
  show: any = false;
  showTimeBar: boolean = false;
  timeBarOption: any = {
    // 时间条总范围
    beginTime: 480,
    endTime: 1440 //单位分钟
  };
  timeParams: any = {
    //滚动条可编辑的时间范围
    beginTime: 0,
    endTime: 0 //单位分钟
  };
  editParams: any = {
    //滚动条编辑的时间
    beginTime: 0,
    endTime: 0 //单位分钟
  };
  @Watch("editParams")
  onEditBeginTime(newVal: any, oldVal: any) {
    if (this.appointmentDate === new Date().format("yyyy-MM-dd")) {
      //如果是今天 就需要判断有没有提前两个小时预约
      let appointmentOption: any = this.$attrs.appointmentOption;
      let canAppointmentTime =
        this.getMinute(new Date().format("hh:mm")) +
        60 * appointmentOption.advanceAppointmentHours;
      if (newVal.beginTime && newVal.beginTime < canAppointmentTime) {
        if (appointmentOption.advanceAppointmentHours) {
          this.$toast(
            `需要提前${appointmentOption.advanceAppointmentHours}个小时预约`
          );
        } else {
          this.$toast(`不在可预约时间内,无法预约!`);
        }

        this.canSubmit = false;
      } else {
        this.canSubmit = true;
      }
    }
  }
  canSubmit: Boolean = true;

  person: any = {}; //暂存选中的人,
  personList: Array<any> = []; //参加人员列表
  appointmentDate: string = ""; //预约日期,由上一个页面传过来
  reason: string = ""; //理由
  submit() {
    if (!this.canSubmit) {
      let appointmentOption: any = this.$attrs.appointmentOption;
      if (appointmentOption.advanceAppointmentHours) {
        this.$toast(
          `需要提前${appointmentOption.advanceAppointmentHours}个小时预约`
        );
      } else {
        this.$toast(`不在可预约时间内,无法预约!`);
      }
      return;
    }
    if (this.editParams.beginTime === 0 || this.editParams.endTime === 0) {
      this.$toast("请选择时间范围!");
      return;
    }
    if (!this.reason) {
      this.$toast("预约原因不能为空!");
      return;
    }
    let params: any = {
      appointmentDate: this.appointmentDate,
      classroomId: this.room.id,
      endTime: this.timeFilter(this.editParams.endTime),
      reason: this.reason,
      startTime: this.timeFilter(this.editParams.beginTime),
      userIdList: this.personList.map(o => {
        return o.userId;
      })
    };
    if (this.$route.params.room) {
      //新增
      api.submitBooking(params).then(o => {
        this.$router.push({
          name: "appointmentDetail",
          params: {
            appointmentId: o + ""
          }
        });
      });
      return;
    }
    params.id = this.room.appointmentId;
    params.classroomId = this.room.classroomId;
    api.updateBooking(params).then(o => {
      this.$router.push({
        name: "appointmentDetail",
        params: {
          appointmentId: this.room.appointmentId + ""
        }
      });
    });
  }
  deletePerson(index: number) {
    this.personList.splice(index, 1);
  }
  onSelectPerson(person: any) {
    this.person = person;
  }
  confirmPerson() {
    let detectRef: any = this.$refs.detectRef;
    detectRef._reset();
    if (this.person.name) {
      if (
        this.personList.findIndex(o => o.userNo === this.person.userNo) === -1
      ) {
        this.personList.push(this.person);
      }
    }
  }
  successArr: Array<string> = [];
  getComputed(
    number: number,
    arr: Array<number>,
    target: number,
    numberChild: Array<number>
  ) {
    for (var i in arr) {
      //感觉可以通过传下标 然后从下标开始遍历,可以提高性能,后期就不用去重排序了
      let o = arr[i];
      if (number + o < target) {
        let child: any = JSON.parse(JSON.stringify(numberChild));
        child.push(o);
        this.getComputed(number + o, arr, target, child);
      } else if (number + o == target) {
        numberChild.push(o);
        this.successArr.push(JSON.stringify(numberChild));
      } else {
        break;
      }
    }
  }
  confirmSelect() {
    // 这里可能要做判断,时间不合适就确定不了
    let timeBar: any = this.$refs.timeBar;
    let emptyTime: Array<any> = timeBar.getEmptyTime();
    let rightTime: Boolean = false;
    let selectTime = {
      beginTime: 0,
      endTime: 0
    };
    if (this.editType === "beginTime") {
      selectTime.beginTime = this.getMinute(this.temporary);
      if (!this.editParams.endTime) {
        //还没选结束时间
        emptyTime.forEach(o => {
          if (
            selectTime.beginTime >= o.beginTime &&
            selectTime.beginTime <= o.endTime
          ) {
            rightTime = true;
          }
        });
      }
      selectTime.endTime = this.editParams.endTime;
    } else {
      selectTime.endTime = this.getMinute(this.temporary);
      if (!this.editParams.beginTime) {
        //还没选开始时间时间
        emptyTime.forEach(o => {
          if (
            selectTime.endTime >= o.beginTime &&
            selectTime.endTime <= o.endTime
          ) {
            rightTime = true;
          }
        });
      }
      selectTime.beginTime = this.editParams.beginTime;
    }

    //三种情况,第一种,其中一个为0,只选了开始或者结束时间,第二种 两个都在可编辑时间内,但是不在同一个范围,第三种,不在可编辑时间范围内
    if (selectTime.beginTime && selectTime.endTime) {
      if (selectTime.endTime < selectTime.beginTime) {
        this.$toast("结束时间不能小于开始时间!");
        return;
      }
      emptyTime.forEach(o => {
        if (
          selectTime.beginTime >= o.beginTime &&
          selectTime.beginTime <= o.endTime &&
          selectTime.endTime >= o.beginTime &&
          selectTime.endTime <= o.endTime
        ) {
          rightTime = true;
        }
      });
    }
    if (rightTime) {
      this.editParams[this.editType] = this.getMinute(this.temporary);
      this.selectTimePopup = false;
    } else {
      this.$toast("不在可预约时间内,无法预约");
    }
  }
  getMinute(time: string): number {
    let hour: number = parseInt(time.split(":")[0]);
    return hour * 60 + parseInt(time.split(":")[1]);
  }
  selectTime(type: string) {
    this.editType = type;
    if (this.editParams[this.editType]) {
      this.temporary = this.timeFilter(this.editParams[this.editType]);
    }
    this.selectTimePopup = true;
  }
  timeFilter(date: number): string {
    //拿到的是分钟数,转化为时分
    if (!date) {
      return "请选择";
    }
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
  activated() {
    this.canSubmit = true;
    if (this.$route.params.room) {
      this.showTimeBar = false; //先销毁时间选择器 因为用了keep-alive只能这么干
      this.$nextTick(() => {
        //新增预约
        this.editParams = {
          //滚动条编辑的时间
          beginTime: 0,
          endTime: 0 //单位分钟
        };
        this.person = {}; //暂存选中的人,
        this.personList = []; //参加人员列表
        this.reason = ""; //理由
        this.$set(this, "room", this.$route.params.room);
        this.$set(this, "appointmentDate", this.$route.params.appointmentDate);
        this.showTimeBar = true;
      });

      // let arr = [2, 3, 6, 7];
      // let target = 7;
      // arr.forEach(o => {
      //   if (o === target) {
      //     this.successArr.push(JSON.stringify([o]));
      //     return;
      //   }
      //   this.getComputed(o, arr, target, [o]);
      // });
    } else if (this.$route.params.detail) {
      //编辑
      this.showTimeBar = false; //先销毁时间选择器 因为用了keep-alive只能这么干
      this.$nextTick(() => {
        let detail: any = this.$route.params.detail;
        let timeFrame = detail.timeFrame;
        let appointmentDate = timeFrame.split(" ")[0];
        let timeArea = timeFrame.split(" ")[1];
        this.editParams = {
          //滚动条编辑的时间
          beginTime: this.getMinute(timeArea.split("-")[0]),
          endTime: this.getMinute(timeArea.split("-")[1]) //单位分钟
        };
        this.person = {}; //暂存选中的人,
        this.personList = detail.memberList; //参加人员列表
        this.reason = detail.reason; //理由
        this.$set(this, "room", detail);
        this.$set(this, "appointmentDate", appointmentDate);
        this.showTimeBar = true;
      });
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="less">
.bookingRoom {
  width: 100%;
  height: 100%;
  padding-bottom: 0.6rem;
  overflow: auto;
  background: #f4f5f7;
  box-shadow: 0rem 0.0533rem 0.08rem 0rem rgba(236, 236, 238, 0.3);
  border-radius: 0.1333rem;
  .detect_dialog{
    text-align: center;
  }
  .child {
    padding: 0.4rem;
    padding-bottom: 0.6rem;
    background: white;
    overflow: hidden;
    .bar {
      width: 100%;
      height: 0.0267rem;
      margin-top: 0.2667rem;
      border-top: 0.0267rem dashed #c0c4cc;
    }
    &:hover {
      background: #fcfdff;
    }
  }
  .submit_btn {
    font-size: 0.48rem;
    &.disabled {
      opacity: 0.6;
    }
  }
  .form_wrap {
    margin-top: 0.333rem;
    background: white;
    .reason {
      width: 100%;
      height: 1.4rem;
      padding: 0 0.4rem;
      color: #303133;
      border: none;
      outline: none;
      box-shadow: none;
    }
    .add_person {
      width: 0.6rem;
      height: 0.6rem;
    }
  }
  .button_wrap {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    z-index: 2;
    padding: 0.32rem 0.4rem;
  }
  .person_wrap {
    padding: 0 0 0 0.3rem;
    .person {
      background: rgba(241, 246, 255, 1);
      border-radius: 0.05rem;
      margin: 0 0.25rem 0.3rem 0.25rem;
      padding: 0.11rem 0.27rem;
      font-size: 0.43rem;
      font-family: PingFangSC-Regular, PingFang SC;
      font-weight: 400;
      color: rgba(96, 98, 102, 1);
      position: relative;
      img {
        position: absolute;
        width: 0.32rem;
        height: 0.32rem;
        top: -0.16rem;
        right: -0.16rem;
      }
    }
  }
  .top {
    .img_wrap {
      width: 3.2rem;
      height: 2.4rem;
      border-radius: 0.1067rem;
      background: #96b5f0;
      img {
        border-radius: 0.1067rem;
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
  .middle {
    margin-top: 0.2rem;
    img {
      width: 0.34rem;
      height: 0.34rem;
      position: relative;
      top: 0.1rem;
      margin-right: 0.13rem;
    }
    .comment {
      width: 8.61rem;
      font-size: 0.32rem;
      font-family: PingFangSC-Regular, PingFang SC;
      font-weight: 400;
      color: rgba(144, 147, 153, 1);
      line-height: 0.59rem;
    }
  }
  .bottom {
    padding: 0.27rem;
    height: 2rem;
  }
}
</style>
