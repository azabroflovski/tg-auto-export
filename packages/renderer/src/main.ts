import { createApp } from 'vue'
import App from './App.vue'
import naive from 'naive-ui'
import './samples/node-api'

createApp(App)
  .use(naive)
  .mount('#app')
  .$nextTick(window.removeLoading)
