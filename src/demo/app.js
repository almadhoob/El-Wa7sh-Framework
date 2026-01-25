import { mount, registerRoute, Router, initEventSystem, update } from '../el-wa7sh.js';
import { Home } from './components/Home.js';
import { store } from './store.js';

// Initialize Global Event System
initEventSystem();

// Register Routes
registerRoute('/', Home);
registerRoute('/active', Home);
registerRoute('/completed', Home);

// Mount App
const appContainer = document.getElementById('app');

// Subscribe to store changes to re-render
store.subscribe(() => {
    update();
});

// Start
mount(Router, appContainer);
