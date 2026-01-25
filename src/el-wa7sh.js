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
    // 1. Snapshot Focus
    const activeElement = document.activeElement;
    const selectionStart = activeElement ? activeElement.selectionStart : null;
    const selectionEnd = activeElement ? activeElement.selectionEnd : null;
    let activeId = null;
    if (activeElement && activeElement.id) {
        activeId = activeElement.id;
    }

    // 2. Clear and Render
    container.innerHTML = '';
    const element = createDomElement(vNode);
    container.appendChild(element);

    // 3. Restore Focus
    if (activeId) {
        const restored = document.getElementById(activeId);
        if (restored) {
            restored.focus();
            if (selectionStart !== null && selectionEnd !== null && typeof restored.setSelectionRange === 'function') {
                try {
                    restored.setSelectionRange(selectionStart, selectionEnd);
                } catch (e) {
                    // Ignore if setSelectionRange fails (e.g. non-text inputs)
                }
            }
        }
    }
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
                // Direct event binding
                element.addEventListener(key.substring(2).toLowerCase(), value);
            } else if (key === 'className') {
                if (value) element.setAttribute('class', value);
            } else if (key === 'checked') {
                // Special handling for boolean attributes
                if (value) element.setAttribute(key, '');
                element.checked = !!value;
            } else if (key === 'value') {
                element.value = value;
            } else if (key === 'style' && typeof value === 'object') {
                Object.assign(element.style, value);
            } else {
                if (value !== false && value !== null && value !== undefined) {
                    element.setAttribute(key, value);
                }
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
    ['click', 'change', 'input', 'submit', 'dblclick', 'keydown', 'keyup'].forEach(eventType => {
        document.addEventListener(eventType, (e) => {
            const target = e.target;
            // Traverse up to find element with wa7sh-{event}
            let el = target;
            while (el && el !== document) {
                const handlerName = el.getAttribute(`wa7sh-${eventType}`);
                if (handlerName && eventRegistry[handlerName]) {
                    // Don't prevent default blindly - e.g. for checkboxes or text inputs
                    if (eventType === 'submit') e.preventDefault();

                    eventRegistry[handlerName](e, el);
                    break; // Only fire the first one found bubbling up
                }
                el = el.parentElement;
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
    window.location.hash = path;
}

export function Router() {
    // Hash routing
    const hash = window.location.hash.slice(1) || '/'; // Default to /

    const Component = routes[hash] || routes['/'] || (() => h('div', {}, '404'));
    return h(Component, {});
}

// Listen to hashchange
window.addEventListener('hashchange', () => {
    update();
});
