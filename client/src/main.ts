/**
 * main.ts
 *
 * Bootstraps Vuetify and other plugins then mounts the App`
 */
import { createApp } from 'vue'

// Plugins
import App from './App.vue'
import { registerPlugins } from './plugins'

// Components
import './styles/style.css'
// Composables

const app = createApp(App)

registerPlugins(app)

app.mount('#app')
