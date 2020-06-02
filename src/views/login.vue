<template>
  <div class="container login">
    <div class="name">
      <div class="word">请登录</div>
      <div class="line"></div>
      先用i学习的登录页,这里的剧本应该是去学工的登录页,所以预约系统是不需要登录页的
      <div class="logo"><img :src="require('../assets/images/logo@2x.png')" alt=""></div>
    </div>
    <div class="login-container">
      <div class="login-ipt">
        <input type="text" v-model="user.userNo" placeholder="请输入学号">
        <img @click="user.userNo = ''" v-if="user.userNo" src="../assets/images/btn_deletepic.png" alt="">
      </div>
      <div class="login-ipt">
        <input :type="!showPwd?'password':'text'" v-model="user.password" placeholder="请输入密码">
        <div @click="showPwd = !showPwd">
          <img v-if="user.password&&!showPwd" src="../assets/images/btn_hide.png" alt="">
          <img v-if="user.password&&showPwd" src="../assets/images/btn_show.png" alt="">
        </div>
      </div>
      <van-button class="login-btn" :disabled="!(user.userNo||user.password)" type="primary" size="large" @click="login">登录</van-button>
    </div>
  </div>
</template>

<script lang="ts">
  import api from '../api/index';
  import {
    Component,
    Vue
  } from 'vue-property-decorator';
  
  @Component
  export default class Login extends Vue {
    private user: any = {
      // userNo: "30920122202446",
      // password: "ixy666",
      userNo: "",
      password: "",
    }
    public $md5: any;
    public $utils: any;
    private showPwd: boolean = false;
    private redirect: any = '';
    private schoolId: any = '';
    private timeout: any;
    created() {
      this.redirect = this.$route.query.redirect
      this.schoolId = this.$route.query.schoolId || this.$route.params.schoolId || null
      this.schoolId&&this.$cookies.set("SAAS_S_ID", this.schoolId)
    }
  
    login() {
      if (!this.user.userNo) {
        this.$toast('请输入学号')
        return;
      }
      if (!this.user.password) {
        this.$toast('请输入密码')
        return;
      }
     
      if (!this.timeout) {
        this.timeout = setTimeout(() => {
          this.$utils.showLoading(800, '登录中...')
          // this.$toast.loading({
          //   message: '登录中...',
          //   forbidClick: true,
          //   duration: 1000,
          //   loadingType: 'spinner'
          // })
          api.login(this.schoolId, {
            userNo: this.user.userNo,
            password: this.$md5(this.user.password)
          }).then((res: any) => {
            if(res.type == 'STUDENT') {
              this.$store.dispatch('LOGIN', res).then(() => {
                let path = {name: 'appointment'}
                if (this.redirect) {
                  path = this.redirect
                }
                this.$router.push(path)
              })
            } else {
              this.$toast('您不是学生，无法访问')
            }
          }).finally(() => {
            this.timeout = null;
          })
        }, 800)
      }
  
    }
  }
</script>

<style lang="less" scoped>
  .login {
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    .name {
      margin-top: 110px;
      margin-left: 38px;
      display: flex;
      align-items: center;
      .word {
        font-size: 28px;
        color: #303030;
        font-weight: 500;
      }
      .line {
        width: 1px;
        height: 16px;
        background: #909090;
        margin: 0 10px;
      }
      .logo {
        img {
          width: 90px;
          height: 48px;
        }
      }
    }
  }
  
  .login-container {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    margin: 95px 38px 20px;
    .login-ipt {
      width: 100%;
      // height: 34px;
      border-bottom: 1px solid #E9EAED;
      font-size: 14px;
      display: flex;
      // align-items: center;
      justify-content: space-between;
      padding-bottom: 11px;
      margin-bottom: 20px;
      input {
        width: 100%;
        height: 100%;
        border: none;
        outline: none;
        font-size: 16px;
        color: #303030 !important;
      }
      img {
        width: 22px;
        height: 22px;
      }
    }
    .login-btn {
      height: 44px;
      line-height: 44px;
      background: rgba(227, 36, 21, 1);
      box-shadow: 0px 1px 5px 0px rgba(171, 0, 0, 0.3);
      border-radius: 5px;
      font-size: 17px;
      font-weight: 500;
      border: none;
      margin-top: 30px;
    }
  }
</style>
