"use strict";

const STORAGE_KEY = "simple-todo-web-tasks";
const form = document.querySelector("#todo-form");
const input = document.querySelector("#new-task");
const list = document.querySelector("#task-list");
const count = document.querySelector("#task-count");
const message = document.querySelector("#message");

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

    return parsed.filter(task =>
      task &&
      typeof task.text === "string" &&
      task.text.length > 0 &&
      task.text.length <= 200 &&
      ["pending", "correct", "wrong"].includes(task.status)
    );
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
  list.replaceChildren();
  count.textContent = `${tasks.length} ${tasks.length === 1 ? "task" : "tasks"}`;

  if (tasks.length === 0) {
    const empty = document.createElement("li");
    empty.className = "empty-state";
    empty.textContent = "No tasks yet. Add one above!";
    list.append(empty);
    return;
  }

  tasks.forEach((task, index) => {
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
    statusButton.textContent = task.status === "correct" ? "✓ Correct" :
      task.status === "wrong" ? "✗ Wrong" : "○ Pending";
    statusButton.setAttribute("aria-label", `Change status for ${task.text}`);
    statusButton.addEventListener("click", () => {
      const nextStatus = {
        pending: "correct",
        correct: "wrong",
        wrong: "pending"
      };
      tasks[index].status = nextStatus[tasks[index].status];
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
}

form.addEventListener("submit", event => {
  event.preventDefault();
  const text = input.value.trim();

  if (!text) {
    input.focus();
    return;
  }

  tasks.push({ text, status: "pending" });
  saveTasks();
  renderTasks();
  form.reset();
  input.focus();
});

renderTasks();
