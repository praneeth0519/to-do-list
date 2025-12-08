document.addEventListener("DOMContentLoaded", () => {
    loadTasks();

    // live character count
    document.getElementById("taskInput").addEventListener("input", () => {
        document.getElementById("count").innerText =
            document.getElementById("taskInput").value.length;
    });

    document.getElementById("taskInput").focus();
});

function addTask() {
    let input = document.getElementById("taskInput");
    let text = input.value.trim();

    if (!text) return;

    let task = {
        id: Date.now(),
        text,
        completed: false,
        color: randomColor()
    };

    saveTask(task);
    createTaskElement(task);
    input.value = "";
    document.getElementById("count").innerText = 0;
}

/* Generates a random soft color */
function randomColor() {
    const colors = ["#ff7675", "#74b9ff", "#55efc4", "#ffeaa7", "#a29bfe"];
    return colors[Math.floor(Math.random() * colors.length)];
}

/* Create UI Element */
function createTaskElement(task) {
    let ul = document.getElementById("taskList");

    let li = document.createElement("li");
    li.setAttribute("data-id", task.id);

    // Unique color bar
    let bar = document.createElement("div");
    bar.className = "color-bar";
    bar.style.background = task.color;

    let text = document.createElement("span");
    text.className = "task-text";
    text.textContent = task.text;

    if (task.completed) text.classList.add("completed");

    text.ondblclick = () => editTask(task.id, text);

    let actions = document.createElement("div");
    actions.className = "actions";

    let done = document.createElement("span");
    done.textContent = "✔";
    done.onclick = () => completeSmooth(task.id, li);

    let del = document.createElement("span");
    del.textContent = "✖";
    del.onclick = () => deleteSmooth(task.id, li);

    actions.appendChild(done);
    actions.appendChild(del);

    li.appendChild(bar);
    li.appendChild(text);
    li.appendChild(actions);

    ul.appendChild(li);
}

/* STORAGE */
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

/* SMOOTH COMPLETE */
function completeSmooth(id, li) {
    li.classList.add("completed-glow");
    setTimeout(() => toggleComplete(id), 250);
}

function toggleComplete(id) {
    let tasks = getTasks();
    tasks = tasks.map(t => {
        if (t.id === id) t.completed = !t.completed;
        return t;
    });
    localStorage.setItem("tasks", JSON.stringify(tasks));
    loadTasks();
}

/* SMOOTH DELETE */
function deleteSmooth(id, li) {
    li.classList.add("delete-anim");
    setTimeout(() => deleteTask(id), 300);
}

function deleteTask(id) {
    let tasks = getTasks();
    tasks = tasks.filter(t => t.id !== id);
    localStorage.setItem("tasks", JSON.stringify(tasks));
    loadTasks();
}

/* EDIT TASK */
function editTask(id, textElement) {
    let newText = prompt("Edit your task:", textElement.textContent);
    if (!newText) return;

    let tasks = getTasks();
    tasks = tasks.map(t => {
        if (t.id === id) t.text = newText;
        return t;
    });

    localStorage.setItem("tasks", JSON.stringify(tasks));
    loadTasks();
}
