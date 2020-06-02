<template>
  <div class="appointment_detail">
    <v-nav-bar title="预约详情" :border="true"></v-nav-bar>
    <div class="detail_wrap" v-if="detail.userNo">
      <img
        class="status_icon"
        :src="getStatusIcon(detail.status==='WAIT_START'?detail.auditStatus:detail.status)"
      />
      <div class="form_title">
        <div class="title_bar"></div>预约地点
      </div>
      <div class="top box_flex">
        <div class="img_wrap">
          <img :src="`/downloads/storage/images/${detail.classroomPhoto}`" alt />
        </div>
        <div class="info_wrap">
          <div
            class="room_name"
          >{{detail.buildingName}} {{detail.classroomName}}-{{detail.floor}}F {{detail.campus}}</div>
          <div class="room_count box_flex">
            <img src="../assets/images/home/icon_pnumber@2x.png" />
            可容纳{{detail.maxUserNum}}人
          </div>
          <div v-if="detail.equipment" class="room_util box_flex">
            <div
              v-if="detail.equipment.indexOf('电脑')!==-1"
              class="util_wrap box_flex column flex_center"
            >
              <img src="../assets/images/home/icon_computer@2x.png" />
              <div>电脑</div>
            </div>
            <div
              v-if="detail.equipment.indexOf('白板')!==-1"
              class="util_wrap box_flex column flex_center"
            >
              <img src="../assets/images/home/icon_whiteboard@2x.png" />
              <div>白板</div>
            </div>
            <div
              v-if="detail.equipment.indexOf('投影仪')!==-1"
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
        <div class="comment">{{detail.remark?detail.remark:'无其他备注内容'}}</div>
      </div>
      <div class="form_title">
        <div class="title_bar"></div>预约人信息
      </div>
      <div class="form_row">
        <div class="title">姓名</div>
        <div class="text">{{detail.name}}</div>
      </div>
      <div class="form_row">
        <div class="title">学工号</div>
        <div class="text">{{detail.userNo}}</div>
      </div>
      <div class="form_row">
        <div class="title">联系电话</div>
        <div class="text">{{detail.phone}}</div>
      </div>
      <div class="form_row">
        <div class="title">预约原因</div>
        <div class="text">{{detail.reason}}</div>
      </div>
      <div class="form_row">
        <div class="title">参与成员</div>
        <div class="person_wrap">
          <div class="box_flex person" v-for="person in detail.memberList" :key="person.userNo">
            <div class="text">{{person.userNo}}</div>
            <div class="text">{{person.name}}</div>
          </div>
        </div>
      </div>
      <div class="form_row">
        <div class="title">预约时段</div>
        <div class="text">{{detail.timeFrame}}</div>
      </div>
      <div
        @click="editAppoint"
        v-if="canEdit&&(detail.status==='WAIT'||detail.auditStatus==='WAIT')"
        class="edit_mark box_flex flex_center"
      >
        <img src="../assets/images/btn_edit@2x.png" alt />
      </div>
      <div
        @click="cancelAppoint"
        v-if="canEdit&&(detail.status==='WAIT'||detail.status==='PASS')"
        class="edit_mark cancel_mark box_flex flex_center"
      >
        <img src="../assets/images/btn_delete@2x.png" alt />
      </div>
      <div
        @click="cancelAppoint"
        v-if="canEdit&&detail.status==='WAIT_START'&&(detail.auditStatus==='WAIT'||detail.auditStatus==='PASS')"
        class="edit_mark cancel_mark box_flex flex_center"
      >
        <img src="../assets/images/btn_delete@2x.png" alt />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";
import api from "../api/index";
@Component
export default class appointmentDetail extends Vue {
  editAppoint() {
    if (
      this.detail.status === "PASS" ||
      this.detail.status === "NOT_SIGN_IN" ||
      this.detail.status === "SIGN_IN"
    ) {
      this.$toast("已审核不能修改！");
      return;
    }
    let params: any = this.$route.params;
    this.detail.appointmentId = params.appointmentId;
    this.$router.push({
      name: "bookingRoom",
      params: {
        detail: this.detail
      }
    });
  }
  getStatusIcon(status: string) {
    //1成功 2审核中 3不通过 4已失效
    let num = 1; //还有其他两种状态 当成功处理 已签到和未签到
    if (status === "WAIT") {
      num = 2;
    } else if (status === "PASS") {
      num = 1;
    } else if (status === "NOT_PASS") {
      num = 3;
    } else if (status === "CANCEL") {
      num = 4;
    }
    return require(`../assets/images/status_${num}@2x.png`);
  }
  cancelAppoint() {
    this.$dialog
      .confirm({
        message: "确定取消当前预约"
      })
      .then(() => {
        let param = {
          appointmentId: this.detail.appointmentId
        };
        api.cancelAppointment(param).then(o => {
          this.$toast("取消预约成功!");
          this.$router.push({
            name: "attendanceRecord"
          });
        });
        // on confirm
      })
      .catch(() => {
        // on cancel
      });
  }
  detail: any = {};
  canEdit: Boolean = true;
  activated() {
    if (this.$route.params.appointmentId) {
      let params = { appointmentId: this.$route.params.appointmentId };
      api.getAppointmentDetail(params).then(o => {
        o.appointmentId = this.$route.params.appointmentId;
        this.$set(this, "detail", o);
      });
    }
    if (this.$route.params.noEdit) {
      this.canEdit = false;
    } else {
      this.canEdit = true;
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="less">
.appointment_detail {
  background: #f4f5f7;
  padding: 0.33rem 0.4rem;
  height: 100%;
  overflow: auto;
  .top {
    margin-top: 0.2667rem;
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
          top: 0.06rem;
          position: relative;
          width: 0.34rem;
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
    margin-top: 0.2rem;
    margin-bottom: 0.1333rem;
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
  .detail_wrap {
    width: 100%;
    background-color: white;
    padding: 0 0.27rem;
    position: relative;
    padding-bottom: 0.2667rem;
    box-shadow: 0rem 0.05rem 0.08rem 0rem rgba(236, 236, 238, 0.3);
    border-radius: 0.1333rem;
    .status_icon {
      position: absolute;
      top: 0;
      right: 0;
      width: 2.13rem;
      height: 1.65rem;
    }
  }
  .person_wrap {
    .person {
      margin-bottom: 0.48rem;
      line-height: 0.5333rem;
      &:last-child {
        margin-bottom: 0;
      }
    }
  }
  .edit_mark {
    width: 1.3067rem;
    height: 1.3067rem;
    background: #658eff;
    border-radius: 50%;
    position: absolute;
    right: 0;
    bottom: 1.7867rem;
    &.cancel_mark {
      background: white;
      bottom: 0;
    }
    img {
      width: 0.5867rem;
      height: 0.5867rem;
    }
    box-shadow: 0rem 0.0533rem 0.08rem 0rem rgba(76, 118, 247, 0.16);
  }
}
</style>
