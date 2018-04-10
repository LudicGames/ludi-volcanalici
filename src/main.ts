import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'

import LudicVue from 'ludic-vue'

Vue.config.productionTip = false

Vue.use(LudicVue)

new Vue({
  router,
  store,
  render: (h) => h(App),
}).$mount('#app')
