// /api/services is a base endpoint
const api = "/api/services";
// load services from api and show them

const listEl = document.getElementById("list");
const catEl = document.getElementById("cat");

const editIdEl = document.getElementById("editId");
const titleEl = document.getElementById("title");
const categoryEl = document.getElementById("category");
const descriptionEl = document.getElementById("description");
const urlEl = document.getElementById("url");

const formTitleEl = document.getElementById("formTitle");
const cancelBtn = document.getElementById("cancelBtn");
const saveBtn = document.getElementById("saveBtn"); // added

async function load() {
  const cat = catEl.value.trim();
  const url = cat ? `${api}?category=${encodeURIComponent(cat)}` : api;

  try {
    const res = await fetch(url);
    if (!res.ok) {
      alert("Failed to load services");
      return;
    }

    const data = await res.json();
    listEl.innerHTML = "";
    data.forEach(renderItem);
  } catch (err) {
    alert("Server is not reachable. Is it running?");
  }
}

function renderItem(s) {
  const div = document.createElement("div");
  div.className = "item";

  div.innerHTML = `
    <div class="item-title">${escapeHtml(s.title)} <span class="muted">(${escapeHtml(s.category)})</span></div>
    <div class="muted">${s.description ? escapeHtml(s.description) : ""}</div>
    <div class="muted">${s.url ? `<a href="${escapeAttr(s.url)}" target="_blank" rel="noreferrer">Open link</a>` : ""}</div>
    <div class="actions">
      <button class="btn-secondary" data-edit="${s.id}">Edit</button>
      <button class="btn-danger" data-del="${s.id}">Delete</button>
    </div>
  `;

  div.addEventListener("click", async (e) => {
    const editId = e.target.getAttribute("data-edit");
    const delId = e.target.getAttribute("data-del");

    if (editId) startEdit(s);
    if (delId) await removeService(Number(delId));
  });

  listEl.appendChild(div);
}

function startEdit(s) {
  editIdEl.value = s.id;
  titleEl.value = s.title || "";
  categoryEl.value = s.category || "";
  descriptionEl.value = s.description || "";
  urlEl.value = s.url || "";

  formTitleEl.textContent = "Edit Service";
  cancelBtn.style.display = "inline-block";
}

function resetForm() {
  editIdEl.value = "";
  document.getElementById("form").reset();
  formTitleEl.textContent = "Add a Service";
  cancelBtn.style.display = "none";
}

async function removeService(id) {
  if (!confirm("Delete this service?")) return;

  try {
    const res = await fetch(`${api}/${id}`, { method: "DELETE" });
    if (!res.ok && res.status !== 204) {
      alert("Delete failed");
      return;
    }
    await load();
  } catch (err) {
    alert("Server is not reachable. Is it running?");
  }
}

document.getElementById("loadBtn").addEventListener("click", load);

cancelBtn.addEventListener("click", () => {
  resetForm();
});

document.getElementById("form").addEventListener("submit", async (e) => {
  e.preventDefault();

  // front-end url validation (because input type="url")
  // url is optional, but if user typed something, it must look like a url
  if (urlEl.value && !urlEl.checkValidity()) {
    alert("Please enter a valid URL starting with http:// or https://");
    return;
  }

  const payload = {
    title: titleEl.value,
    category: categoryEl.value,
    description: descriptionEl.value,
    url: urlEl.value
  };

  const editId = editIdEl.value;

  // prevent double-click save while request is running
  saveBtn.disabled = true;
  saveBtn.textContent = "Saving...";

  try {
    let res;
    if (editId) {
      // UPDATE
      res = await fetch(`${api}/${editId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
    } else {
      // CREATE
      res = await fetch(api, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
    }

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      alert(err.error || "Save failed");
      return;
    }

    resetForm();
    await load();
  } catch (err) {
    alert("Server is not reachable. Is it running?");
  } finally {
    saveBtn.disabled = false;
    saveBtn.textContent = "Save";
  }
});

function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, (m) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  }[m]));
}
function escapeAttr(str) {
  return String(str).replace(/"/g, "&quot;");
}

load();
