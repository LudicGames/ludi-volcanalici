const path = require('path')

module.exports = {
  configureWebpack: {
    module: {
      defaultRules: [
        // needed to load the wasm files properly
        { type: "javascript/auto", resolve: {} },
      ],
    },
    resolve: {
      alias: {
        'game': '@/game',
        '$ui': '@/game/components/ui',
        '$entities': '@/game/components/entities',
        '$systems': '@/game/components/systems',
        // allow for easier import syntax
        '@ludic/ludic$': '@ludic/ludic/dist/ludic.commonjs2.js',
        'ludic$': '@ludic/ludic',
        'ludic-vue$': '@ludic/ludic-vue',
        'ludic-box2d$': '@ludic/ludic-box2d',
        'ein$': '@ludic/ein',
      },
      // modules: [path.join(__dirname, 'node_modules'), 'node_modules'],
    },
  }
}
