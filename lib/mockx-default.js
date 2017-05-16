module.exports = {
  // 填写要转发的域名
  domains: [
    
  ],
  projectIds: [],
  // 相对项目根目录下的mock文件夹
  mockDir: './mock',
  // 所有的映射规则
  rules: [{
    route: '/mockJSON',
    json: 'jsonfile.json'
  }, {
    route: '/mockFile',
    file: 'file.html'
  }, {
    route: '/mockJsData',
    jsdata: 'jsdata.js'
  }]
}
