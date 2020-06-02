import request from '../assets/utils/request'
import login from '@/store/modules/login'


export default {
  /**
   * 登录
   * @param {Object} params 
   */
  login(schoolId: string, params: any):Promise<any>{
    return request(`/school/${schoolId}/login`, 'POST', params)
  },
  /**
   * 登录检查
   */
  loginCheck():Promise<any>{
    return request(`/login/check`)
  },
  /**
   * 获取班级列表
   */
  getColleges():Promise<any>{
    return request(`api/colleges`)
  },
   /**
   * 获取可预约教室列表
   */
  getRoomList(param:any):Promise<any>{
    return request(`api/appointment/classroom/getList`,'post',param)
  },
  /**
   * 获取可预约楼栋列表
   */
  getBuildingList():Promise<any>{
    return request(`api/appointment/classroom/getBuildingList`,'post')
  },
  /**
   * 获取楼层列表
   */
  getFloorList(param:any):Promise<any>{
    return request('api/appointment/classroom/getFloorList','post',param)
  },
  /**
   * 关键字搜索学生
   */
  getPersonList(param:any):Promise<any>{
    return request('api/appointment/system/user/searchResults?keyword='+param.keyword,'post')
  },
  /**
   * 确定预约
   */
  submitBooking(param:any):Promise<any>{
    return request('api/appointment/classroomAppointment/add','post',param)
  },
  /**
   * 修改预约
   */
  updateBooking(param:any):Promise<any>{
    return request('api/appointment/classroomAppointment/update','post',param)
  },

  
  /**
   * 获取预约详情
   */
  getAppointmentDetail(param:any):Promise<any>{
    return request('api/appointment/classroomAppointment/getDetail?appointmentId='+param.appointmentId,'post',param)
  },
   /**
   * 我的预约列表
   */
  getAppointmentRecord(param:any,type:string):Promise<any>{
    if(type === 'join'){//如果是参与记录
      return request('api/appointment/classroomAppointment/getJoinList','post',param)
    }
    return request('api/appointment/classroomAppointment/getList','post',param)
  },
   /**
   * 获取预约规则
   */
  getInstruction():Promise<any>{
    return request('api/appointment/classroom/getInstruction','post')
  },
   /**
   * 获取预约规则
   */
  cancelAppointment(param:any):Promise<any>{
    return request('api/appointment/classroomAppointment/cancelAppointment?appointmentId='+param.appointmentId,'post',param)
  },
  /**
   * 获取预约设置
   */
  getAppointmentRule():Promise<any>{
    return request('api/appointment/rule','post')
  },
  
}