const API_BASE = "/api/tasks";

const statusMeta = {
  todo: { label: "할 일", badgeClass: "bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200" },
  in_progress: { label: "진행 중", badgeClass: "bg-amber-200 text-amber-800 dark:bg-amber-500/30 dark:text-amber-200" },
  done: { label: "완료", badgeClass: "bg-emerald-200 text-emerald-800 dark:bg-emerald-500/30 dark:text-emerald-200" },
};

const taskForm = document.getElementById("taskForm");
const titleInput = document.getElementById("titleInput");
const dueAtInput = document.getElementById("dueAtInput");
const statusInput = document.getElementById("statusInput");
const taskList = document.getElementById("taskList");
const emptyMessage = document.getElementById("emptyMessage");

const editModal = document.getElementById("editModal");
const editForm = document.getElementById("editForm");
const editTitleInput = document.getElementById("editTitleInput");
const editDescriptionInput = document.getElementById("editDescriptionInput");
const editDueAtInput = document.getElementById("editDueAtInput");
const editStatusInput = document.getElementById("editStatusInput");
const cancelEditBtn = document.getElementById("cancelEditBtn");

const deleteModal = document.getElementById("deleteModal");
const cancelDeleteBtn = document.getElementById("cancelDeleteBtn");
const confirmDeleteBtn = document.getElementById("confirmDeleteBtn");

const themeToggleBtn = document.getElementById("themeToggleBtn");
const themeIcon = document.getElementById("themeIcon");

let editingTaskId = null;
let deletingTaskId = null;

function localInputToUtcIso(localValue) {
  if (!localValue) return null;
  return new Date(localValue).toISOString();
}

function utcIsoToLocalInputValue(utcIso) {
  if (!utcIso) return "";
  const date = new Date(utcIso);
  const pad = (n) => String(n).padStart(2, "0");
  const yyyy = date.getFullYear();
  const mm = pad(date.getMonth() + 1);
  const dd = pad(date.getDate());
  const hh = pad(date.getHours());
  const min = pad(date.getMinutes());
  return `${yyyy}-${mm}-${dd}T${hh}:${min}`;
}

function formatDueAtDisplay(utcIso) {
  if (!utcIso) return "마감 없음";
  const date = new Date(utcIso);
  const pad = (n) => String(n).padStart(2, "0");
  const formatted = `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
  return `${formatted} · ${formatRemaining(date)}`;
}

function formatRemaining(dueDate) {
  const diffMs = dueDate.getTime() - Date.now();
  const isPast = diffMs < 0;
  const absMs = Math.abs(diffMs);
  const hours = Math.floor(absMs / (1000 * 60 * 60));
  const days = Math.floor(hours / 24);
  const remHours = hours % 24;

  let text;
  if (days > 0) {
    text = `${days}일 ${remHours}시간`;
  } else if (hours > 0) {
    text = `${hours}시간`;
  } else {
    const minutes = Math.floor(absMs / (1000 * 60));
    text = `${minutes}분`;
  }
  return isPast ? `${text} 지남` : `${text} 남음`;
}

async function apiRequest(method, url, body) {
  const options = {
    method,
    headers: { "Content-Type": "application/json" },
  };
  if (body !== undefined) options.body = JSON.stringify(body);

  const response = await fetch(url, options);
  if (response.status === 204) return null;

  const data = await response.json().catch(() => null);
  if (!response.ok) {
    const message = data && data.detail ? JSON.stringify(data.detail) : `요청 실패 (${response.status})`;
    throw new Error(message);
  }
  return data;
}

function renderTasks(tasks) {
  taskList.innerHTML = "";

  if (tasks.length === 0) {
    emptyMessage.classList.remove("hidden");
    return;
  }
  emptyMessage.classList.add("hidden");

  for (const task of tasks) {
    const meta = statusMeta[task.status] ?? statusMeta.todo;

    const card = document.createElement("div");
    card.className =
      "glass-card bg-white/70 dark:bg-white/10 rounded-2xl shadow-md p-4 flex items-start justify-between gap-3 cursor-pointer hover:shadow-lg transition-shadow";
    card.dataset.taskId = task.id;

    card.innerHTML = `
      <div class="flex-1 min-w-0">
        <div class="flex items-center gap-2 mb-1 flex-wrap">
          <span class="text-xs font-medium px-2.5 py-1 rounded-full ${meta.badgeClass}">${meta.label}</span>
          <span class="text-xs text-slate-500 dark:text-slate-400">${formatDueAtDisplay(task.due_at)}</span>
        </div>
        <p class="font-medium break-words">${escapeHtml(task.title)}</p>
      </div>
      <button
        type="button"
        class="delete-btn shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
        aria-label="삭제"
      >🗑️</button>
    `;

    card.addEventListener("click", (event) => {
      if (event.target.closest(".delete-btn")) return;
      openEditModal(task);
    });

    card.querySelector(".delete-btn").addEventListener("click", (event) => {
      event.stopPropagation();
      openDeleteModal(task.id);
    });

    taskList.appendChild(card);
  }
}

function escapeHtml(value) {
  const div = document.createElement("div");
  div.textContent = value;
  return div.innerHTML;
}

async function loadTasks() {
  const tasks = await apiRequest("GET", API_BASE);
  renderTasks(tasks);
}

taskForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const payload = {
    title: titleInput.value.trim(),
    status: statusInput.value,
    due_at: localInputToUtcIso(dueAtInput.value),
  };
  try {
    await apiRequest("POST", API_BASE, payload);
    taskForm.reset();
    await loadTasks();
  } catch (err) {
    alert(err.message);
  }
});

async function openEditModal(task) {
  editingTaskId = task.id;
  const detail = await apiRequest("GET", `${API_BASE}/${task.id}`);
  editTitleInput.value = detail.title;
  editDescriptionInput.value = detail.description ?? "";
  editDueAtInput.value = utcIsoToLocalInputValue(detail.due_at);
  editStatusInput.value = detail.status;
  editModal.classList.remove("hidden");
}

function closeEditModal() {
  editModal.classList.add("hidden");
  editingTaskId = null;
}

cancelEditBtn.addEventListener("click", closeEditModal);

editForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (editingTaskId === null) return;
  const payload = {
    title: editTitleInput.value.trim(),
    description: editDescriptionInput.value.trim() || null,
    status: editStatusInput.value,
    due_at: localInputToUtcIso(editDueAtInput.value),
  };
  try {
    await apiRequest("PUT", `${API_BASE}/${editingTaskId}`, payload);
    closeEditModal();
    await loadTasks();
  } catch (err) {
    alert(err.message);
  }
});

function openDeleteModal(taskId) {
  deletingTaskId = taskId;
  deleteModal.classList.remove("hidden");
}

function closeDeleteModal() {
  deleteModal.classList.add("hidden");
  deletingTaskId = null;
}

cancelDeleteBtn.addEventListener("click", closeDeleteModal);

confirmDeleteBtn.addEventListener("click", async () => {
  if (deletingTaskId === null) return;
  try {
    await apiRequest("DELETE", `${API_BASE}/${deletingTaskId}`);
    closeDeleteModal();
    await loadTasks();
  } catch (err) {
    alert(err.message);
  }
});

function applyTheme(theme) {
  document.documentElement.classList.toggle("dark", theme === "dark");
  themeIcon.textContent = theme === "dark" ? "☀️" : "🌙";
}

function initTheme() {
  let theme;
  try {
    theme = localStorage.getItem("theme");
  } catch (e) {
    theme = null;
  }
  if (!theme) {
    theme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }
  applyTheme(theme);
}

themeToggleBtn.addEventListener("click", () => {
  const isDark = document.documentElement.classList.contains("dark");
  const nextTheme = isDark ? "light" : "dark";
  applyTheme(nextTheme);
  try {
    localStorage.setItem("theme", nextTheme);
  } catch (e) {
    // localStorage 접근 불가 시 테마는 세션 동안만 유지
  }
});

initTheme();
loadTasks();
setInterval(loadTasks, 3000);
