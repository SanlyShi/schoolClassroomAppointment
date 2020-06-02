<template>
  <div id="app">
      <router-view ref="routerView" />
  </div>
</template>

<script>
export default {
  data() {
    return {
      oldRouterPath: [],
      activeTab:0
    };
  },
  watch: {
   
  },
  mounted(){
    document.body.addEventListener('focusout', () => {
    　　   window.scrollTo({ top: 0, left: 0, behavior: 'smooth' })
  　   })
  }
};
</script>

<style lang="less">
@import url("./assets/style/common.less");
#app {
  font-family: "Avenir", Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #303030;
  height: 100%;
  //对vant组件所有的不满意都在这里说
  .van-dialog__header{
    padding-top: 0.5067rem;
    color:#303030;
  }
  .van-cell--required::before{
    top:13px;
  }
  .van-cell{
    color:#303133
  }
  .van-dialog__footer--buttons{
    // border-top:0.0267rem solid #CCCCCE;
    border-radius:0 0 0.2667rem 0.2667rem;
    //  .van-dialog__cancel{
    //   border-right:0.0267rem solid #CCCCCE
    // }
  }
  .van-dialog__content{
    .ditection{
      margin:0.32rem 0;
    }
   
  }
  .van-tabbar{
    height:1.6rem;
  }
  .van-tabbar-item{
    color:#909399;
  }
  .van-tabbar-item--active{
    color:#4c76f7
  }
  .van-list__finished-text{
    color:#909399;
    line-height: normal;
  }
}
</style>
