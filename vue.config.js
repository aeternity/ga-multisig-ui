module.exports = {
  transpileDependencies: [
    '@aeternity'
  ],
  chainWebpack: config => {
    config.module
      .rule('aes')
      .test(/\.aes$/)
      .use('raw-loader')
      .loader('raw-loader')
      .end()
  },
}
