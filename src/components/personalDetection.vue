<template>
  <div class="input-group ditection">
    <input
      class="form-control"
      type="text"
      :placeholder="placeholder"
      v-model="searchVal"
      @input="_search"
    />
    <ul class="dropdown-menu" v-if="show">
      <li
        class="res-item"
        v-for="(option, oindex) in options"
        :key="oindex"
        @click="_afterSelect(option)"
      >
        <div class="option-content">
          <p>
            <span>{{option.name}}</span>
            <span class="user-no" v-if="option.userNo">({{option.userNo}})</span>
          </p>
          <p>
            <span>{{option.organizationName || ''}}</span>
          </p>
          <p>
            <span>{{option.unitName || ''}}</span>
          </p>
        </div>
      </li>
      <li>
        <div class="option-content">
          <p>
            搜索到{{options.length}}条结果
            <i class="maticon pull-right close" @click="_close"></i>
          </p>
        </div>
      </li>
    </ul>
  </div>
</template>
<script>
import api from "../api/index";
export default {
  props: {
    url: {
      default: ""
    },
    placeholder: {
      default: "学工号/姓名"
    },
    type: {
      default: "param"
    },
    keyword: {
      default: "keyword"
    }
  },
  data: function() {
    return {
      timer: null,
      show: false,
      searchVal:"",
      options: []
    };
  },
  methods: {
    _close: function() {
      this._reset();
    },
    _search: function() {
      if (this.timer) {
        clearTimeout(this.timer);
      }
      this.timer = setTimeout(() => {
        this.$set(this, "show", true);
        this._getOptions();
      }, 600);
    },
    _getOptions: function() {
      if (this.show) {
        let params = {};
        if (this.searchVal) {
          params[this.keyword] = this.searchVal;
          api.getPersonList(params).then(o => [(this.options = o)]);
        }
      }
    },
    _afterSelect: function(option) {
      this.$emit("afterSelected", option);
      this._reset();
      if (option.userNo) {
        this.searchVal = `${option.name}(${option.userNo})`;
      } else if (option.roleId) {
        this.searchVal = `${option.name}`;
      } else if (option.unitName) {
        this.searchVal = `${option.unitName}`;
      }
    },
    _reset: function() {
      this.show = false;
      this.options = [];
      this.searchVal = "";
    }
  }
};
</script>
<style lang="less" scoped>
.form-control {
  width:100%;
  border-radius: 0.0533rem;
  padding: .2rem;
  box-sizing: border-box;
  border: 0.0267rem solid #81BEFF;
}
.ditection {
  width: 5.92rem;
  display: inline-block;
  text-align: center;
  position: relative;
  .dropdown-menu {
    display: block;
    position: absolute;
    background: white;
    top:1.2rem;
    left: 0;
    width: 5.92rem;
    z-index: 5;
    max-height: 200px;
    padding: 0;
    overflow: auto;
    .res-item {
      cursor: pointer;
      &:hover {
        background: #f0f0f0;
      }
    }
    .option-content {
      padding: 5px 10px;
      border-bottom: 1px solid #e0e0e0;
      p {
        margin: 0;
      }
      .user-no {
        font-size: 12px;
        color: #999;
      }
      .user-org {
        font-size: 13px;
        color: #666;
      }
    }
  }
}
</style>
