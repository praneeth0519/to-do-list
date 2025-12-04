document.addEventListener("DOMContentLoaded", loadTasks);

function addTask() {
    let text = document.getElementById("taskInput").value.trim();
    let priority = document.getElementById("priority").value;

    if (text === "") {
        alert("Please enter a task!");
        return;
    }

    let time = new Date().toLocaleString();

    const task = {
        id: Date.now(),  // unique ID
        text,
        priority,
        time,
        completed: false
    };

    saveTask(task);
    createTaskElement(task);

    document.getElementById("taskInput").value = "";
}

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
    done.onclick = () => toggleComplete(task.id);

    let edit = document.createElement("span");
    edit.textContent = "✎";
    edit.onclick = () => editTask(task.id);

    let del = document.createElement("span");
    del.textContent = "✖";
    del.onclick = () => deleteTask(task.id);

    actions.appendChild(done);
    actions.appendChild(edit);
    actions.appendChild(del);

    li.appendChild(info);
    li.appendChild(actions);

    ul.appendChild(li);
}

/* ---------- STORAGE ---------- */

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
    tasks.forEach(t => createTaskElement(t));
}

/* ---------- ACTIONS ---------- */

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

    let newText = prompt("Edit task:", task.text);
    if (!newText) return;

    task.text = newText;
    localStorage.setItem("tasks", JSON.stringify(tasks));
    loadTasks();
}

/* ---------- FILTERS ---------- */

function filterTasks(type) {
    let tasks = getTasks();
    let filtered = [];

    if (type === "all") filtered = tasks;
    if (type === "pending") filtered = tasks.filter(t => !t.completed);
    if (type === "completed") filtered = tasks.filter(t => t.completed);
    if (type === "high") filtered = tasks.filter(t => t.priority === "High");

    document.getElementById("taskList").innerHTML = "";
    filtered.forEach(createTaskElement);
}
