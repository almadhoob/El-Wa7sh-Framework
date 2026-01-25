import { h, registerEvent } from '../el-wa7sh.js';
import { store, actions } from '../store.js';

// --- Event Handlers ---

registerEvent('addTodo', (e, target) => {
    if (e.key === 'Enter') {
        actions.addTodo(target.value);
        target.value = '';
    }
});

registerEvent('toggleTodo', (e, target) => {
    const id = target.parentElement.parentElement.getAttribute('data-id');
    actions.toggleTodo(id);
});

registerEvent('destroyTodo', (e, target) => {
    const id = target.parentElement.parentElement.getAttribute('data-id');
    actions.destroyTodo(id);
});

registerEvent('toggleAll', (e, target) => {
    actions.toggleAll(target.checked);
});

registerEvent('clearCompleted', () => {
    actions.clearCompleted();
});

registerEvent('editTodo', (e, target) => {
    const id = target.parentElement.parentElement.getAttribute('data-id');
    actions.editTodo(id);

    setTimeout(() => {
        const editInput = document.querySelector(`li[data-id="${id}"] .edit`);
        if (editInput) {
            editInput.focus();
            editInput.selectionStart = editInput.value.length; // cursor at end
        }
    }, 0);
});

registerEvent('saveTodo', (e, target) => {
    const id = target.parentElement.getAttribute('data-id');
    actions.saveTodo(id, target.value);
});

registerEvent('editKeyup', (e, target) => {
    const id = target.parentElement.getAttribute('data-id');
    if (e.key === 'Enter') {
        target.blur(); // Triggers saveTodo via blur or we call it here
        // actions.saveTodo(id, target.value);
    } else if (e.key === 'Escape') {
        actions.cancelEdit();
    }
});

// --- Helper Components ---

function TodoItem(todo, editingId) {
    const isEditing = editingId === todo.id;
    const classes = [];
    if (todo.completed) classes.push('completed');
    if (isEditing) classes.push('editing');

    return h('li', { className: classes.join(' '), 'data-id': todo.id },
        h('div', { className: 'view' },
            h('input', {
                className: 'toggle',
                type: 'checkbox',
                checked: todo.completed,
                'wa7sh-change': 'toggleTodo'
            }),
            h('label', { 'wa7sh-dblclick': 'editTodo' }, todo.title),
            h('button', { className: 'destroy', 'wa7sh-click': 'destroyTodo' })
        ),
        h('input', {
            id: `edit-${todo.id}`,
            className: 'edit',
            value: todo.title,
            'wa7sh-blur': 'saveTodo', // Save on blur
            'wa7sh-keyup': 'editKeyup'
        })
    );
}

function Footer(todos, filter) {
    const activeCount = todos.filter(t => !t.completed).length;
    const completedCount = todos.length - activeCount;
    const itemWord = activeCount === 1 ? 'item' : 'items';

    return h('footer', { className: 'footer', style: { display: todos.length ? 'block' : 'none' } },
        h('span', { className: 'todo-count' },
            h('strong', {}, activeCount),
            ` ${itemWord} left`
        ),
        h('ul', { className: 'filters' },
            h('li', {},
                h('a', {
                    href: '#/',
                    className: filter === 'all' ? 'selected' : ''
                }, 'All')
            ),
            h('li', {},
                h('a', {
                    href: '#/active',
                    className: filter === 'active' ? 'selected' : ''
                }, 'Active')
            ),
            h('li', {},
                h('a', {
                    href: '#/completed',
                    className: filter === 'completed' ? 'selected' : ''
                }, 'Completed')
            )
        ),
        completedCount > 0 ? h('button', {
            className: 'clear-completed',
            'wa7sh-click': 'clearCompleted'
        }, 'Clear completed') : null
    );
}

// --- Main Component ---

export function Home() {
    const state = store.getState();

    const hash = window.location.hash.replace('#/', '');
    const currentFilter = (hash === 'active' || hash === 'completed') ? hash : 'all';

    // Filter todos
    let filteredTodos = state.todos;
    if (currentFilter === 'active') {
        filteredTodos = state.todos.filter(t => !t.completed);
    } else if (currentFilter === 'completed') {
        filteredTodos = state.todos.filter(t => t.completed);
    }

    const allCompleted = state.todos.length > 0 && state.todos.every(t => t.completed);

    return h('section', { className: 'todoapp' },
        h('header', { className: 'header' },
            h('h1', {}, 'todos'),
            h('input', {
                id: 'new-todo',
                className: 'new-todo',
                placeholder: 'What needs to be done?',
                autofocus: true,
                'wa7sh-keydown': 'addTodo'
            })
        ),
        h('section', { className: 'main', style: { display: state.todos.length ? 'block' : 'none' } },
            h('input', {
                id: 'toggle-all',
                className: 'toggle-all',
                type: 'checkbox',
                checked: allCompleted,
                'wa7sh-change': 'toggleAll'
            }),
            h('label', { for: 'toggle-all' }, 'Mark all as complete'),
            h('ul', { className: 'todo-list' },
                ...filteredTodos.map(todo => TodoItem(todo, state.editingId))
            )
        ),
        Footer(state.todos, currentFilter)
    );
}
