document.addEventListener("DOMContentLoaded", loadTasks);

function addTask() {
    let text = document.getElementById("taskInput").value.trim();
    let priority = document.getElementById("priority").value;

    if (text === "") {
        alert("Please enter a task!");
        return;
    }

    const task = {
        id: Date.now(),
        text,
        priority,
        time: new Date().toLocaleString(),
        completed: false
    };

    saveTask(task);
    createTaskElement(task);

    document.getElementById("taskInput").value = "";
}

/* Create UI Item */
function createTaskElement(task) {
    let ul = document.getElementById("taskList");

    let li = document.createElement("li");
    li.setAttribute("data-id", task.id);

    let info = document.createElement("div");
    info.className = "task-info";

    let text = document.createElement("span");
    text.textContent = task.text;
    if (task.completed) text.classList.add("completed");

    let time = document.createElement("span");
    time.className = "time";
    time.textContent = task.time;

    let priority = document.createElement("span");
    priority.className = "priority " + task.priority.toLowerCase();
    priority.textContent = "Priority: " + task.priority;

    info.appendChild(text);
    info.appendChild(time);
    info.appendChild(priority);

    let actions = document.createElement("div");
    actions.className = "actions";

    let done = document.createElement("span");
    done.textContent = "✔";
    done.onclick = () => smoothComplete(task.id, li);

    let edit = document.createElement("span");
    edit.textContent = "✎";
    edit.onclick = () => editTask(task.id);

    let del = document.createElement("span");
    del.textContent = "✖";
    del.onclick = () => smoothDelete(task.id, li);

    actions.appendChild(done);
    actions.appendChild(edit);
    actions.appendChild(del);

    li.appendChild(info);
    li.appendChild(actions);

    ul.appendChild(li);
}

/* ------------- SMOOTH COMPLETE ------------- */
function smoothComplete(id, li) {
    li.classList.add("complete-animation");

    setTimeout(() => {
        toggleComplete(id);
    }, 350);
}

/* ------------- SMOOTH DELETE ------------- */
function smoothDelete(id, li) {
    li.classList.add("delete-animation");

    setTimeout(() => {
        deleteTask(id);
    }, 400);
}

/* STORAGE FUNCTIONS */
function saveTask(task) {
    let tasks = getTasks();
    tasks.push(task);
    localStorage.setItem("tasks", JSON.stringify(tasks));
}

function getTasks() {
    return JSON.parse(localStorage.getItem("tasks")) || [];
}

function loadTasks() {
    let tasks = getTasks();
    document.getElementById("taskList").innerHTML = "";
    tasks.forEach(createTaskElement);
}

/* BASIC LOGIC */
function toggleComplete(id) {
    let tasks = getTasks();
    tasks = tasks.map(t => {
        if (t.id === id) t.completed = !t.completed;
        return t;
    });
    localStorage.setItem("tasks", JSON.stringify(tasks));
    loadTasks();
}

function deleteTask(id) {
    let tasks = getTasks();
    tasks = tasks.filter(t => t.id !== id);
    localStorage.setItem("tasks", JSON.stringify(tasks));
    loadTasks();
}

function editTask(id) {
    let tasks = getTasks();
    let task = tasks.find(t => t.id === id);

    let newText = prompt("Edit Task:", task.text);
    if (!newText) return;

    task.text = newText;
    localStorage.setItem("tasks", JSON.stringify(tasks));
    loadTasks();
}

/* FILTERS */
function filterTasks(type) {
    let tasks = getTasks();

    let filtered = {
        all: tasks,
        pending: tasks.filter(t => !t.completed),
        completed: tasks.filter(t => t.completed),
        high: tasks.filter(t => t.priority === "High")
    }[type];

    document.getElementById("taskList").innerHTML = "";
    filtered.forEach(createTaskElement);
}

