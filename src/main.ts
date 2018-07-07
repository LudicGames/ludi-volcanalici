import Vue from 'vue'
import App from './App.vue'
import router from './router'

import LudicVue from 'ludic-vue'
import {Box2D} from 'ludic-box2d'

Vue.config.productionTip = false

Vue.use(LudicVue)

Box2D.then(() => {
  new Vue({
    router,
    render: (h) => h(App),
  }).$mount('#app')
})
