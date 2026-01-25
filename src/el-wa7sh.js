/**
 * El Wa7sh Framework
 * A minimalist web framework by Ahmed Almadhoob
 */

// --- DOM Abstraction ---

/**
 * Creates a virtual DOM node.
 * @param {string} tag The HTML tag name.
 * @param {object} props Attributes and properties.
 * @param {...(string|object)} children Child nodes.
 * @returns {object} Virtual Node.
 */
export function h(tag, props = {}, ...children) {
    return { tag, props: props || {}, children: children.flat() };
}

/**
 * Renders a virtual DOM node into a container.
 * @param {object} vNode The virtual node to render.
 * @param {HTMLElement} container The DOM element to render into.
 */
export function render(vNode, container) {
    container.innerHTML = '';
    const element = createDomElement(vNode);
    container.appendChild(element);
}

function createDomElement(vNode) {
    if (typeof vNode === 'string' || typeof vNode === 'number') {
        return document.createTextNode(vNode);
    }

    // Support function components
    if (typeof vNode.tag === 'function') {
        const componentVNode = vNode.tag(vNode.props);
        return createDomElement(componentVNode);
    }

    const { tag, props, children } = vNode;
    const element = document.createElement(tag);

    // Set attributes
    if (props) {
        Object.entries(props).forEach(([key, value]) => {
            if (key.startsWith('on') && typeof value === 'function') {
                // Direct event binding (standard) - but we will use custom system mostly
                element.addEventListener(key.substring(2).toLowerCase(), value);
            } else if (key === 'className') {
                element.setAttribute('class', value);
            } else if (key === 'style' && typeof value === 'object') {
                Object.assign(element.style, value);
            } else {
                element.setAttribute(key, value);
            }
        });
    }

    // Recursively append children
    children.forEach(child => {
        if (child !== null && child !== undefined && child !== false) { // Skip conditional rendering nulls
            element.appendChild(createDomElement(child));
        }
    });

    return element;
}


// --- State Management ---

export function createStore(initialState) {
    let state = initialState;
    const listeners = new Set();

    const getState = () => state;

    const setState = (newStateOrUpdater) => {
        if (typeof newStateOrUpdater === 'function') {
            state = newStateOrUpdater(state);
        } else {
            state = { ...state, ...newStateOrUpdater };
        }
        notify();
    };

    const subscribe = (listener) => {
        listeners.add(listener);
        return () => listeners.delete(listener);
    };

    const notify = () => {
        listeners.forEach(listener => listener(state));
    };

    return { getState, setState, subscribe };
}


// --- Component Base ---
let rootContainer = null;
let currentApp = null;

export function mount(App, container) {
    rootContainer = container;
    currentApp = App;
    update();
}

export function update() {
    if (rootContainer && currentApp) {
        render(currentApp(), rootContainer);
    }
}


// --- Event Handling ---

const eventRegistry = {};

export function registerEvent(eventName, handler) {
    eventRegistry[eventName] = handler;
}

// Initialize Global Delegate
export function initEventSystem() {
    ['click', 'change', 'input', 'submit'].forEach(eventType => {
        document.addEventListener(eventType, (e) => {
            const target = e.target;
            const handlerName = target.getAttribute(`wa7sh-${eventType}`);

            if (handlerName && eventRegistry[handlerName]) {
                e.preventDefault(); // Prevent default for things like submit, links
                eventRegistry[handlerName](e, target);
            }
        });
    });
}


// --- Routing System ---

const routes = {}; // path -> Component

export function registerRoute(path, component) {
    routes[path] = component;
}

export function navigate(path) {
    window.history.pushState({}, '', path);
    update();
}

// Router Component to use
export function Router() {
    const path = window.location.pathname;
    const Component = routes[path] || routes['/404'] || (() => h('div', {}, '404 Not Found'));
    return h(Component, {});
}

// Listen to popstate
window.addEventListener('popstate', () => {
    update();
});
