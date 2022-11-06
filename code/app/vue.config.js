// vue.config.js
module.exports = {
    publicPath: '/', // '/rose-app',
    devServer: {
        disableHostCheck: true,
        // allowedHosts: ["all"],
    },
    chainWebpack: config => {
        config
            .plugin('html')
            .tap(args => {
                args[0].title = 'Hello GeekReady 2022'
                return args
            })
    }
}