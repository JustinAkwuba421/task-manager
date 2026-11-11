const STORAGE_KEY = "task-manager-tasks";

const form = document.querySelector("#task-form");
const input = document.querySelector("#task-input");
const taskList = document.querySelector("#task-list");
const taskCount = document.querySelector("#task-count");
const filterButtons = document.querySelectorAll(".filter-button");
const clearCompletedButton = document.querySelector("#clear-completed");

let currentFilter = "all";
let tasks = loadTasks();

function loadTasks() {
  try {
    const savedTasks = JSON.parse(localStorage.getItem(STORAGE_KEY));

    if (!Array.isArray(savedTasks)) {
      return [];
    }

    return savedTasks.filter(
      (task) =>
        task &&
        typeof task.id === "string" &&
        typeof task.text === "string" &&
        typeof task.completed === "boolean"
    );
  } catch {
    return [];
  }
}

function saveTasks() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  } catch (error) {
    console.error("Could not save tasks to localStorage:", error);
  }
}

function getVisibleTasks() {
  if (currentFilter === "active") {
    return tasks.filter((task) => !task.completed);
  }

  if (currentFilter === "completed") {
    return tasks.filter((task) => task.completed);
  }

  return tasks;
}

function updateTaskCount() {
  const remaining = tasks.filter((task) => !task.completed).length;
  taskCount.textContent = `${remaining} ${remaining === 1 ? "task" : "tasks"} left`;
}

function createTaskItem(task) {
  const item = document.createElement("li");
  item.className = `task-item${task.completed ? " completed" : ""}`;

  const checkbox = document.createElement("input");
  checkbox.className = "task-checkbox";
  checkbox.type = "checkbox";
  checkbox.checked = task.completed;
  checkbox.setAttribute(
    "aria-label",
    `Mark "${task.text}" as ${task.completed ? "incomplete" : "complete"}`
  );
  checkbox.addEventListener("change", () => {
    task.completed = checkbox.checked;
    saveTasks();
    renderTasks();
  });

  const text = document.createElement("span");
  text.className = "task-text";
  text.textContent = task.text;
  text.title = "Double-click to edit";
  text.addEventListener("dblclick", () => {
    startEditingTask(task, item, text);
  });

  const deleteButton = document.createElement("button");
  deleteButton.className = "delete-button";
  deleteButton.type = "button";
  deleteButton.textContent = "Delete";
  deleteButton.setAttribute("aria-label", `Delete "${task.text}"`);
  deleteButton.addEventListener("click", () => {
    tasks = tasks.filter((currentTask) => currentTask.id !== task.id);
    saveTasks();
    renderTasks();
  });

  item.append(checkbox, text, deleteButton);
  return item;
}

function startEditingTask(task, item, textElement) {
  const editor = document.createElement("input");
  editor.className = "task-edit-input";
  editor.type = "text";
  editor.value = task.text;
  editor.setAttribute("aria-label", "Edit task");

  let editing = true;

  function finishEditing(save) {
    if (!editing) return;
    editing = false;

    const updatedText = editor.value.trim();

    if (save && updatedText) {
      task.text = updatedText;
      saveTasks();
    }

    renderTasks();
  }

  editor.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      finishEditing(true);
    } else if (event.key === "Escape") {
      event.preventDefault();
      finishEditing(false);
    }
  });

  editor.addEventListener("blur", () => {
    finishEditing(true);
  });

  textElement.replaceWith(editor);
  editor.focus();
  editor.select();
}

function renderTasks() {
  taskList.replaceChildren();

  const visibleTasks = getVisibleTasks();

  if (visibleTasks.length === 0) {
    const emptyMessage = document.createElement("li");
    emptyMessage.className = "empty-state";

    if (tasks.length === 0) {
      emptyMessage.textContent = "No tasks yet. Add one to get started.";
    } else if (currentFilter === "active") {
      emptyMessage.textContent = "No active tasks.";
    } else if (currentFilter === "completed") {
      emptyMessage.textContent = "No completed tasks.";
    }

    taskList.append(emptyMessage);
  } else {
    visibleTasks.forEach((task) => {
      taskList.append(createTaskItem(task));
    });
  }

  updateTaskCount();
}

form.addEventListener("submit", (event) => {
  event.preventDefault();

  const text = input.value.trim();
  if (!text) return;

  tasks.push({
    id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    text,
    completed: false
  });

  saveTasks();
  renderTasks();
  form.reset();
  input.focus();
});

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    currentFilter = button.dataset.filter;

    filterButtons.forEach((filterButton) => {
      const isActive = filterButton === button;
      filterButton.classList.toggle("active", isActive);
      filterButton.setAttribute("aria-pressed", String(isActive));
    });

    renderTasks();
  });
});

clearCompletedButton.addEventListener("click", () => {
  tasks = tasks.filter((task) => !task.completed);
  saveTasks();
  renderTasks();
});

renderTasks();