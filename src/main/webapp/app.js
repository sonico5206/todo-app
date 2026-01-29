const API_URL = 'http://localhost:8080/api/tasks';

// Загрузить все задачи
async function loadTasks() {
    try {
        const response = await fetch(API_URL);
        const tasks = await response.json();
        displayTasks(tasks);
    } catch (error) {
        console.error('Error loading tasks:', error);
    }
}

// Добавить новую задачу
async function addTask() {
    const titleInput = document.getElementById('taskTitle');
    const descInput = document.getElementById('taskDesc');

    const title = titleInput.value.trim();
    const desc = descInput.value.trim();

    if (!title) {
        alert('Введите название задачи');
        titleInput.focus();
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

        // Очищаем поля
        titleInput.value = '';
        descInput.value = '';

        // Обновляем список
        loadTasks();
    } catch (error) {
        console.error('Error adding task:', error);
        alert('Ошибка при добавлении задачи');
    }
}

// Обновить задачу
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

// Удалить задачу
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

// Отобразить задачи на странице
function displayTasks(tasks) {
    const tasksList = document.getElementById('tasksList');

    if (tasks.length === 0) {
        tasksList.innerHTML = `
            <div class="empty-state">
                <p>Пока нет задач!</p>
                <p>Добавьте первую задачу выше</p>
            </div>
        `;
        return;
    }

    tasksList.innerHTML = '';

    tasks.forEach(task => {
        const taskElement = document.createElement('div');
        taskElement.className = `task ${task.completed ? 'completed' : ''}`;

        taskElement.innerHTML = `
            <div class="task-header">
                <div class="task-title">${escapeHtml(task.title)}</div>
                <div class="task-status">${task.completed ? 'Выполнено' : 'В процессе'}</div>
            </div>
            <div class="task-desc">${escapeHtml(task.description || 'Нет описания')}</div>
            <div class="task-date">Создано: ${new Date(task.createdAt).toLocaleString()}</div>
            <div class="task-actions">
                <button class="btn-edit" onclick="editTaskWithPrompt(${task.id})">
                    Изменить
                </button>
                <button class="btn-complete" onclick="toggleComplete(${task.id}, ${task.completed})">
                    ${task.completed ? 'Возобновить' : 'Выполнить'}
                </button>
                <button class="btn-delete" onclick="deleteTask(${task.id})">
                    🗑️ Удалить
                </button>
            </div>
        `;

        tasksList.appendChild(taskElement);
    });
}

// Изменить задачу через prompt
async function editTaskWithPrompt(id) {
    try {
        // Получаем все задачи
        const response = await fetch(API_URL);
        const tasks = await response.json();
        const task = tasks.find(t => t.id === id);

        if (!task) {
            alert('Задача не найдена');
            return;
        }

        // Запрашиваем новое название
        let newTitle = prompt('Введите новое название задачи:', task.title);

        // Если пользователь нажал "Отмена" - выходим
        if (newTitle === null) {
            console.log('Редактирование отменено');
            return;
        }

        // Если пользователь ввел пустую строку
        newTitle = newTitle.trim();
        if (!newTitle) {
            alert('Название задачи не может быть пустым!');
            return;
        }

        // Запрашиваем новое описание
        let newDesc = prompt('Введите новое описание задачи:', task.description || '');

        // Если нажали "Отмена" для описания, используем старое
        if (newDesc === null) {
            newDesc = task.description || '';
        }

        // Обновляем задачу
        const updatedTask = {
            id: id,
            title: newTitle,
            description: newDesc,
            completed: task.completed
        };

        await updateTask(updatedTask);

    } catch (error) {
        console.error('Ошибка при редактировании задачи:', error);
        alert('Произошла ошибка при редактировании задачи');
    }
}

// Переключить статус выполнения (без prompt)
async function toggleComplete(id, currentStatus) {
    try {
        // Получаем все задачи
        const response = await fetch(API_URL);
        const tasks = await response.json();
        const task = tasks.find(t => t.id === id);

        if (!task) return;

        // Меняем только статус выполнения
        const updatedTask = {
            id: id,
            title: task.title,
            description: task.description,
            completed: !currentStatus
        };

        await updateTask(updatedTask);

    } catch (error) {
        console.error('Ошибка при обновлении статуса:', error);
    }
}

// Защита от XSS
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Загрузить задачи при старте
document.addEventListener('DOMContentLoaded', loadTasks);

// Добавить задачу по Enter
document.getElementById('taskTitle')?.addEventListener('keypress', function(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        addTask();
    }
});

// Фокус на поле ввода при загрузке
window.addEventListener('load', function() {
    document.getElementById('taskTitle')?.focus();
});