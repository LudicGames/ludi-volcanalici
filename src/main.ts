import Vue from 'vue'
import App from './App.vue'
import router from './router'

import LudicVue from 'ludic-vue'
import {Box2D} from 'ludic-box2d'

Vue.config.productionTip = false

Vue.use(LudicVue)

// import Box2D from '@ludic/box2d/build/Box2D_v2.3.1_min.wasm.js'
// import Box2DWasm from 'file-loader!@ludic/box2d/build/Box2D_v2.3.1_min.wasm.wasm'
// console.log({Box2D, Box2DWasm})

Box2D.then(() => {
  new Vue({
    router,
    render: (h) => h(App),
  }).$mount('#app')
})
