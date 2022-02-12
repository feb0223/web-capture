const capture = require('../index')

const urlList = [
  {title: 'トップ', path: '/'},
];

const data = {
  sp: {
    urlList: urlList,
    destDir: './dest/sp',
    baseUrl: 'https://www.google.com',
    viewportSize: {
      width: 320,
      height: 600
    },
    useragent: 'ios8'
  },
  pc: {
    urlList: urlList,
    destDir: './dest/pc',
    baseUrl: 'https://www.google.com',
    viewportSize: {
      width: 1200,
      height: 600
    },
    userAgent: 'chrome'
  }
}

capture(data.sp, () => {
  capture(data.pc, () => {
    process.exit()
  })
})

