let todos = [];
let currentFilter = "all";

const todoForm = document.getElementById("todo-form");
const todoInput = document.getElementById("todo-input");
const todoList = document.getElementById("todo-list");
const remainingCountEl = document.getElementById("remaining-count");
const completedCountEl = document.getElementById("completed-count");
const filterButtons = document.querySelectorAll(".filter-btn");


function addTodo(text) {
    const trimmedText = text.trim();

    if (!trimmedText) {
        alert("Пожалуйста, введите текст задачи!");
        return;
    }

    const newTodo = {
        id: Date.now(),
        text: trimmedText,
        completed: false
    };

    todos.push(newTodo);
    render();
}

function toggleTodo(id) {
    todos = todos.map(todo => {
        if (todo.id === id) {
            return { ...todo, completed: !todo.completed };
        }
        return todo;
    });
    render();
}

function deleteTodo(id) {
    todos = todos.filter(todo => todo.id !== id);
    render();
}

function setFilter(filter) {
    currentFilter = filter;

    filterButtons.forEach(btn => {
        if (btn.dataset.filter === filter) {
            btn.classList.add("active");
        } else {
            btn.classList.remove("active");
        }
    });

    render();
}


function render() {
    const remainingCount = todos.filter(todo => !todo.completed).length;
    const completedCount = todos.filter(todo => todo.completed).length;

    remainingCountEl.textContent = remainingCount;
    completedCountEl.textContent = completedCount;

    const filteredTodos = todos.filter(todo => {
        if (currentFilter === "active") return !todo.completed;
        if (currentFilter === "completed") return todo.completed;
        return true;
    });

    todoList.innerHTML = "";

    if (filteredTodos.length === 0) {
        const emptyMsg = document.createElement("li");
        emptyMsg.className = "empty-list";
        emptyMsg.textContent = "Задач нет";
        todoList.appendChild(emptyMsg);
        return;
    }

    filteredTodos.forEach(todo => {
        const li = document.createElement("li");
        li.className = "todo-item";

        const contentDiv = document.createElement("div");
        contentDiv.className = "todo-content";

        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.className = "todo-checkbox";
        checkbox.checked = todo.completed;
        checkbox.addEventListener("change", () => toggleTodo(todo.id));

        const span = document.createElement("span");
        span.className = "todo-text";
        if (todo.completed) {
            span.classList.add("completed");
        }
        span.textContent = todo.text;

        contentDiv.appendChild(checkbox);
        contentDiv.appendChild(span);

        const deleteBtn = document.createElement("button");
        deleteBtn.className = "delete-btn";
        deleteBtn.textContent = "Удалить";
        deleteBtn.type = "button";
        deleteBtn.addEventListener("click", () => deleteTodo(todo.id));

        li.appendChild(contentDiv);
        li.appendChild(deleteBtn);

        todoList.appendChild(li);
    });
}

todoForm.addEventListener("submit", (event) => {
    event.preventDefault();
    addTodo(todoInput.value);
    todoInput.value = "";
    todoInput.focus();
});

filterButtons.forEach(button => {
    button.addEventListener("click", () => {
        const filter = button.dataset.filter;
        setFilter(filter);
    });
});

render();