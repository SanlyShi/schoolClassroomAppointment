declare module '*.vue' {
  import Vue from 'vue'
  export default Vue
}

declare module 'qs' {
  const qs: any;
  export default qs;
}

declare module "js-md5" {
  const jsMd5: any;
  export default jsMd5;
}
interface Date{
  format(fmt:string):string
}