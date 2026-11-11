const form = document.querySelector("#task-form");
const input = document.querySelector("#task-input");
const taskList = document.querySelector("#task-list");
const taskCount = document.querySelector("#task-count");

const tasks = [];

function renderTasks() {
  taskList.replaceChildren();

  if (tasks.length === 0) {
    const emptyMessage = document.createElement("li");
    emptyMessage.className = "empty-state";
    emptyMessage.textContent = "No tasks yet. Add one to get started.";
    taskList.append(emptyMessage);
  } else {
    tasks.forEach((task) => {
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
        renderTasks();
      });

      const text = document.createElement("span");
      text.className = "task-text";
      text.textContent = task.text;
      text.title = "Double-click to edit";
      text.addEventListener("dblclick", () => {
        editTask(task);
      });

      const deleteButton = document.createElement("button");
      deleteButton.className = "delete-button";
      deleteButton.type = "button";
      deleteButton.textContent = "Delete";
      deleteButton.setAttribute("aria-label", `Delete "${task.text}"`);
      deleteButton.addEventListener("click", () => {
        const taskIndex = tasks.indexOf(task);
        if (taskIndex !== -1) {
          tasks.splice(taskIndex, 1);
          renderTasks();
        }
      });

      item.append(checkbox, text, deleteButton);
      taskList.append(item);
    });
  }

  const remaining = tasks.filter((task) => !task.completed).length;
  taskCount.textContent = `${remaining} left`;
}

function editTask(task) {
  const item = taskList.querySelector(
    `.task-item:nth-child(${tasks.indexOf(task) + 1})`
  );
  const text = item?.querySelector(".task-text");

  if (!text) return;

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

  text.replaceWith(editor);
  editor.focus();
  editor.select();
}

form.addEventListener("submit", (event) => {
  event.preventDefault();

  const text = input.value.trim();
  if (!text) return;

  tasks.push({ text, completed: false });
  input.value = "";
  renderTasks();
  input.focus();
});

renderTasks();