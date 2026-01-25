import { createStore } from '../el-wa7sh.js';

const STORAGE_KEY = 'todo-wa7sh';

const loadState = () => {
    try {
        const serialized = localStorage.getItem(STORAGE_KEY);
        if (serialized) {
            return JSON.parse(serialized);
        }
    } catch (e) {
        // ignore
    }
    return {
        todos: [],
        filter: 'all', // all, active, completed
        editingId: null
    };
};

export const store = createStore(loadState());

// Persist on change
store.subscribe(state => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
        todos: state.todos,
        filter: state.filter
        // Don't persist editingId
    }));
});

export const actions = {
    addTodo: (title) => {
        const trimmed = title.trim();
        if (trimmed) {
            store.setState(state => ({
                ...state,
                todos: [
                    ...state.todos,
                    {
                        id: Date.now() + Math.random().toString(36).substr(2, 9),
                        title: trimmed,
                        completed: false
                    }
                ]
            }));
        }
    },
    toggleTodo: (id) => {
        store.setState(state => ({
            ...state,
            todos: state.todos.map(t =>
                t.id === id ? { ...t, completed: !t.completed } : t
            )
        }));
    },
    destroyTodo: (id) => {
        store.setState(state => ({
            ...state,
            todos: state.todos.filter(t => t.id !== id)
        }));
    },
    toggleAll: (completed) => {
        store.setState(state => ({
            ...state,
            todos: state.todos.map(t => ({ ...t, completed }))
        }));
    },
    clearCompleted: () => {
        store.setState(state => ({
            ...state,
            todos: state.todos.filter(t => !t.completed)
        }));
    },
    setFilter: (filter) => {
        store.setState({ filter });
    },
    editTodo: (id) => {
        store.setState({ editingId: id });
    },
    saveTodo: (id, title) => {
        const trimmed = title.trim();
        if (trimmed) {
            store.setState(state => ({
                ...state,
                todos: state.todos.map(t => t.id === id ? { ...t, title: trimmed } : t),
                editingId: null
            }));
        } else {
            actions.destroyTodo(id);
        }
    },
    cancelEdit: () => {
        store.setState({ editingId: null });
    }
};
