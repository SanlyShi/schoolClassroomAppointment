import Vue from 'vue'
import { Commit} from 'vuex'

export interface State {
  user: any;
  session: string;
}

const state: State = {
  user: null,
  session: '',
}

const mutations = {
  setUser(state: State, user: any) {
    state.user = user
  },
  setSession(state: State, session: any) {
    state.session = session
  }
}

const actions = {
  LOGIN(context: { commit: Commit, state: State}, userInfo: any) {
    localStorage.setItem("_USER_INFO", userInfo)
    // Vue.prototype.$cookies.set("_USER_INFO", userInfo)
    // if(!Vue.prototype.$cookies.get("SAAS_S_ID")) {
      Vue.prototype.$cookies.set("SAAS_S_ID", userInfo.schoolId)
    // }
    // Vue.prototype.$cookies.set("SAAS_S_ID", "default")
  }
}

const getters = {
  getUser: (state: State) => { state.user },
  getSession: (state: State) => { state.session },
}

export default ({
  state,
  mutations,
  actions,
  getters,
})
