import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'

import LudicVue from 'ludic-vue'
import {Box2D} from 'ludic-box2d'

Vue.config.productionTip = false

Vue.use(LudicVue)

Box2D.then(() => {
  new Vue({
    router,
    store,
    render: (h) => h(App),
  }).$mount('#app')
})
