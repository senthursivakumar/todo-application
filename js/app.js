"use strict";

const STORAGE_KEY = "simple-todo-web-tasks";
const form = document.querySelector("#todo-form");
const input = document.querySelector("#new-task");
const categorySelect = document.querySelector("#task-category");
const foldersContainer = document.querySelector("#task-folders");
const count = document.querySelector("#task-count");
const message = document.querySelector("#message");

const folders = [
  { id: "groceries", name: "Grocery items" },
  { id: "semester", name: "Studies" },
  { id: "routine", name: "Daily routine" },
  { id: "others", name: "Others" }
];

let tasks = loadTasks();

function showMessage(text) {
  message.textContent = text;
}

function loadTasks() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === null) {
      return [];
    }

    const parsed = JSON.parse(saved);
    if (!Array.isArray(parsed)) {
      throw new Error("Saved todo data is not a list.");
    }

    return parsed
      .filter(task =>
        task &&
        typeof task.text === "string" &&
        task.text.length > 0 &&
        task.text.length <= 200 &&
        ["pending", "correct", "wrong", "completed", "not_completed"].includes(task.status)
      )
      .map(task => ({
        text: task.text,
        category: folders.some(folder => folder.id === task.category) ?
          task.category : "others",
        status: task.status === "correct" ? "completed" :
          task.status === "wrong" || task.status === "pending" ? "not_completed" :
          ["completed", "not_completed"].includes(task.status) ? task.status :
          "not_completed"
      }));
  } catch (error) {
    console.error("Could not load saved tasks:", error);
    showMessage("Saved tasks could not be loaded. You can still add new tasks.");
    return [];
  }
}

function saveTasks() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    showMessage("");
    return true;
  } catch (error) {
    console.error("Could not save tasks:", error);
    showMessage("Could not save changes in this browser.");
    return false;
  }
}

function renderTasks() {
  foldersContainer.replaceChildren();
  count.textContent = `${tasks.length} ${tasks.length === 1 ? "task" : "tasks"}`;

  folders.forEach(folder => {
    const section = document.createElement("section");
    section.className = "task-folder";

    const heading = document.createElement("h2");
    heading.textContent = folder.name;

    const list = document.createElement("ul");
    list.className = "task-list";
    list.setAttribute("aria-label", `${folder.name} tasks`);

    const folderTasks = tasks
      .map((task, index) => ({ task, index }))
      .filter(({ task }) => task.category === folder.id);

    if (folderTasks.length === 0) {
      const empty = document.createElement("li");
      empty.className = "empty-state";
      empty.textContent = "No tasks yet.";
      list.append(empty);
    }

    folderTasks.forEach(({ task, index }) => {
      const row = document.createElement("li");
      row.className = "task";
      row.dataset.status = task.status;

      const text = document.createElement("span");
      text.className = "task-text";
      text.textContent = task.text;

      const statusButton = document.createElement("button");
      statusButton.type = "button";
      statusButton.className = "status-button";
      statusButton.dataset.status = task.status;
      statusButton.textContent = task.status === "completed" ? "✓ Completed" :
        "✗ Not completed";
      statusButton.setAttribute("aria-label", `Change status for ${task.text}`);
      statusButton.addEventListener("click", () => {
        tasks[index].status = tasks[index].status === "completed" ?
          "not_completed" : "completed";
        saveTasks();
        renderTasks();
      });

      const deleteButton = document.createElement("button");
      deleteButton.type = "button";
      deleteButton.className = "delete-button";
      deleteButton.textContent = "Delete";
      deleteButton.setAttribute("aria-label", `Delete ${task.text}`);
      deleteButton.addEventListener("click", () => {
        tasks.splice(index, 1);
        saveTasks();
        renderTasks();
      });

      row.append(text, statusButton, deleteButton);
      list.append(row);
    });

    section.append(heading, list);
    foldersContainer.append(section);
  });
}

form.addEventListener("submit", event => {
  event.preventDefault();
  const text = input.value.trim();

  if (!text) {
    input.focus();
    return;
  }

  tasks.push({
    text,
    category: categorySelect.value,
    status: "not_completed"
  });
  saveTasks();
  renderTasks();
  form.reset();
  input.focus();
});

renderTasks();
