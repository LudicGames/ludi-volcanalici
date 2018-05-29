const path = require('path')

module.exports = {
  configureWebpack: {
    resolve: {
      alias: {
        'game': '@/game',
        '$ui': '@/game/components/ui',
        '$entities': '@/game/components/entities',
        '$systems': '@/game/components/systems',
        // allow for easier import syntax
        'ludic$': '@ludic/ludic/dist/ludic.commonjs2.js',
        'ludic-vue$': '@ludic/ludic-vue',
        'ludic-box2d$': '@ludic/ludic-box2d',
        'ein$': '@ludic/ein',
      },
      // modules: [path.join(__dirname, 'node_modules'), 'node_modules'],
    },
  }
}
