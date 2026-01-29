const API_URL = 'http://localhost:8080/api/tasks';

async function loadTasks() {
    try {
        const response = await fetch(API_URL);
        const tasks = await response.json();
        displayTasks(tasks);
    } catch (error) {
        console.error('Error loading tasks:', error);
    }
}

async function addTask() {
    const title = document.getElementById('taskTitle').value;
    const desc = document.getElementById('taskDesc').value;

    if (!title.trim()) {
        alert('Введите название задачи');
        return;
    }

    const task = {
        title: title,
        description: desc,
        completed: false
    };

    try {
        await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(task)
        });

        document.getElementById('taskTitle').value = '';
        document.getElementById('taskDesc').value = '';
        loadTasks();
    } catch (error) {
        console.error('Error adding task:', error);
    }
}

async function updateTask(task) {
    try {
        await fetch(API_URL, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(task)
        });
        loadTasks();
    } catch (error) {
        console.error('Error updating task:', error);
    }
}

async function deleteTask(id) {
    if (!confirm('Удалить задачу?')) return;

    try {
        await fetch(`${API_URL}?id=${id}`, {
            method: 'DELETE'
        });
        loadTasks();
    } catch (error) {
        console.error('Error deleting task:', error);
    }
}

function displayTasks(tasks) {
    const tasksList = document.getElementById('tasksList');
    tasksList.innerHTML = '';

    tasks.forEach(task => {
        const taskElement = document.createElement('div');
        taskElement.className = `task ${task.completed ? 'completed' : ''}`;

        taskElement.innerHTML = `
            <div class="task-header">
                <div class="task-title">${escapeHtml(task.title)}</div>
            </div>
            <div class="task-desc">${escapeHtml(task.description || '')}</div>
            <div class="task-date">Создано: ${new Date(task.createdAt).toLocaleString()}</div>
            <div class="task-actions">
                <button class="btn-complete" onclick="toggleComplete(${task.id}, ${task.completed})">
                    ${task.completed ? 'Отменить' : 'Выполнить'}
                </button>
                <button class="btn-delete" onclick="deleteTask(${task.id})">
                    Удалить
                </button>
            </div>
        `;

        tasksList.appendChild(taskElement);
    });
}

function toggleComplete(id, currentStatus) {
    const title = prompt('Обновить название задачи:');
    const desc = prompt('Обновить описание задачи:');

    if (title === null) return;

    const task = {
        id: id,
        title: title,
        description: desc,
        completed: !currentStatus
    };

    updateTask(task);
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

document.addEventListener('DOMContentLoaded', loadTasks);

document.getElementById('taskTitle').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') addTask();
});