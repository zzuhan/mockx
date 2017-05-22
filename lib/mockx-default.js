module.exports = {
  // 填写要转发的域名
  domains: [
    
  ],
  enableDip: false,
  // 相对项目根目录下的mock文件夹
  mockDir: './mock',
  // 所有的映射规则
  rules: [{
    pathname: '/mockJSON',
    json: 'jsonfile.json'
  }, {
    pathname: '/mockFile',
    file: 'file.html'
  }, {
    pathname: '/mockJsData',
    jsdata: 'jsdata.js'
  }]
}
