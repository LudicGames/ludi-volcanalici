const path = require('path')

module.exports = {
  configureWebpack: {
    resolve: {
      // extensions: ['.ts', '.tsx', '.js', '.vue', '.json'],
      alias: {
        'game': '@/game',
        '$ui': '@/game/components/ui',
        '$entities': '@/game/components/entities',
        '$systems': '@/game/components/systems',
        // allow for easier import syntax
        'ludic$': '@ludic/ludic',
        'ludic-vue$': '@ludic/ludic-vue',
        'ludic-box2d$': '@ludic/ludic-box2d',
      },
      // modules: [path.join(__dirname, 'node_modules'), 'node_modules'],
    },
  }
}
