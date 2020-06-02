import Vue from 'vue'
import Vuex, { Commit, Dispatch } from 'vuex'
import login, { State as LoginState } from './modules/login'

Vue.use(Vuex)

export default new Vuex.Store({
  modules: {
    login
  }
})

export interface ActionContextBasic {
  commit: Commit,
  dispatch: Dispatch
}

export interface State {
  login: LoginState,
}