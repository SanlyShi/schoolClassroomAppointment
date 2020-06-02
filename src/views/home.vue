<template>
  <div id="home">
    <keep-alive>
      <router-view ref="routerView" :title="menuList[activeTab].name" :appointmentOption="appointmentOption" />
    </keep-alive>
    <van-tabbar v-model="activeTab">
      <van-tabbar-item v-for="(menu,index) in menuList" :key="index" :to="menu.path">
        <span>{{menu.name}}</span>
        <img slot="icon" slot-scope="props" :src="props.active ? menu.active : menu.inactive" />
      </van-tabbar-item>
    </van-tabbar>
  </div>
</template>

<script>
import api from "../api/index";
export default {
  data() {
    return {
      oldRouterPath: [],
      menuList: [
        {
          name: "教室预约",
          path: "/appointment",
          active: require("../assets/images/tab_home_selected@2x.png"),
          inactive: require("../assets/images/tab_home@2x.png")
        },
        {
          name: "我的预约",
          path: "/attendanceRecord",
          active: require("../assets/images/tab_my_selected@2x.png"),
          inactive: require("../assets/images/tab_my@2x.png")
        },
        {
          name: "参与记录",
          path: "/joinRecord",
          active: require("../assets/images/tab_history_selected@2x.png"),
          inactive: require("../assets/images/tab_history@2x.png")
        }
      ],
      icon: {
        active: require("../assets/images/home/icon_pnumber@2x.png"),
        inactive: require("../assets/images/home/icon_computer@2x.png")
      },
      activeTab: 0,
      appointmentOption:{}
    };
  },
   mounted(){
      api.getAppointmentRule().then(o=>{
        console.log(JSON.parse(JSON.stringify(o)))
        this.appointmentOption = o
      })
    },
  watch: {
    $route(newVal, oldVal) {
      if (
        this.oldRouterPath.length > 0 &&
        newVal.path == this.oldRouterPath[this.oldRouterPath.length - 1]
      ) {
        this.oldRouterPath.pop();
      } else {
        this.oldRouterPath.push(oldVal.path);
        this.$nextTick(() => {
          this.$refs.routerView.onLoad && this.$refs.routerView.onLoad();
        });
      }

      this.$refs.routerView &&
        this.$refs.routerView.onHide &&
        this.$refs.routerView.onHide();
      this.$nextTick(() => {
        this.$refs.routerView.onShow && this.$refs.routerView.onShow();
      });
    }
  }
};
</script>
<style lang="less" scoped>
#home {
  padding-bottom: 1.6rem;
  height: 100%;
}
</style>
