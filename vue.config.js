module.exports = {
  chainWebpack: config => {
    if (process.env.NODE_ENV === 'development') {
      config
        .output
        .filename('[name].[hash].js')
        .end()
    }
  },
  configureWebpack: {
    resolve: {
      alias: {
        'h264-mp4-encoder': 'h264-mp4-encoder/embuild/dist/h264-mp4-encoder.web.js',
      },
    },
  },
}
