# El Wa7sh Framework 👻

Welcome to El Wa7sh, a minimalist web framework designed to be powerful yet simple. This documentation will guide you through its core features and usage.

## Features at a Glance

- **Abstracted DOM**: Use a simple virtual DOM system to build your UI.
- **Custom Events**: A unique event delegation system that keeps your logic clean.
- **State Management**: A store system to manage data across your application.
- **Routing**: Built-in client-side routing to build Single Page Applications (SPAs).

---

## 1. Abstracting the DOM

El Wa7sh provides a helper function `h` (hyperscript) to create virtual DOM elements. This abstracts away the complexity of `document.createElement`.

### How to Create an Element

Use `h(tag, props, ...children)`.

```javascript
import { h } from './el-wa7sh.js';

// Creates: <div>Hello World</div>
const element = h('div', {}, 'Hello World');
```

### Nesting Elements

You can pass other `h()` calls as children to nest elements.

```javascript
const card = h('div', { className: 'card' },
    h('h2', {}, 'Title'),
    h('p', {}, 'This is a nested paragraph.')
);
```

### Adding Attributes

The second argument `props` is an object where keys are attribute names (like `id`, `style`) or property names (like `className` for `class`).

```javascript
const btn = h('button', { 
    className: 'btn-primary',
    id: 'submit-btn',
    disabled: false 
}, 'Submit');
```

---

## 2. Event Handling

El Wa7sh does not use the standard `onclick` directly on elements for application logic. Instead, it uses a **Delegated Event System**. You register global event handlers and link them to elements using `wa7sh-[event]` attributes.

### How to Create an Event

1.  **Register the event handler** in your JavaScript code nicely separated from your view.
2.  **Bind it to an element** using the attribute `wa7sh-click`, `wa7sh-input`, `wa7sh-submit`, etc.

```javascript
import { h, registerEvent } from './el-wa7sh.js';

// 1. Register the action
registerEvent('sayHello', (event, targetElement) => {
    alert('Hello from El Wa7sh!');
});

// 2. Bind in the view
function MyComponent() {
    return h('button', { 'wa7sh-click': 'sayHello' }, 'Click Me');
}
```

### Why this way?
This separates your view structure from your logic. You can define all your "actions" in one place or alongside components, and your component render functions remain pure and declarative strings/objects.

---

## 3. State Management

The framework includes a centralized store to manage your application's data.

### Using the Store

```javascript
import { createStore } from './el-wa7sh.js';

// Initialize
const store = createStore({ count: 0 });

// Read State
console.log(store.getState().count);

// Update State
store.setState({ count: 1 });
// OR with a function for previous state dependence
store.setState(oldState => ({ count: oldState.count + 1 }));

// Subscribe to Changes
store.subscribe(newState => {
    console.log('State changed:', newState);
});
```

---

## 4. Routing System

Create SPAs with the built-in router.

```javascript
import { registerRoute, navigate } from './el-wa7sh.js';
import { Home } from './Home.js';
import { About } from './About.js';

// Register standard routes
registerRoute('/', Home);
registerRoute('/about', About);

// Navigate programmatically
navigate('/about');
```

### Synchronizing State with URL
When you use `navigate(path)`, the framework automatically:
1. Updates the browser URL history.
2. Triggers the routing logic to find the matching component.
3. Updates the view.

---

## Full Example

```javascript
import { h, mount, registerEvent, createStore } from './el-wa7sh.js';

// 1. State
const store = createStore({ active: false });

// 2. Events
registerEvent('toggle', () => {
    store.setState(s => ({ active: !s.active }));
});

// 3. Component
function App() {
    const state = store.getState();
    return h('div', {},
        h('h1', {}, state.active ? 'Active!' : 'Inactive'),
        h('button', { 'wa7sh-click': 'toggle' }, 'Toggle State')
    );
}

// 4. Mount
const container = document.getElementById('app');
mount(App, container);

// 5. Reactivity
store.subscribe(() => {
    const { update } = import('./el-wa7sh.js'); 
    update();
});
```

---

## Credits

This is [El Wa7sh Framework](https://github.com/almadhoob/El-Wa7sh-Framework), which is licensed under the [MIT License](./LICENSE) by Ahmed Almadhoob.
