const MASTER_PASSWORD = "Urbannest@1!";
const API_URL = "/.netlify/functions/savePasswords";

const loginScreen = document.getElementById("login-screen");
const vault = document.getElementById("vault");
const masterInput = document.getElementById("masterInput");
const loginBtn = document.getElementById("loginBtn");
const loginError = document.getElementById("loginError");

loginBtn.onclick = () => {
  if (masterInput.value === MASTER_PASSWORD) {
    loginScreen.style.display = "none";
    vault.style.display = "block";
    loadPasswords();
  } else {
    loginError.textContent = "❌ Invalid master password";
  }
};

const tableBody = document.querySelector("#passwordTable tbody");
const addBtn = document.getElementById("addBtn");
const saveBtn = document.getElementById("saveBtn");
const status = document.getElementById("status");

addBtn.onclick = () => {
  const row = document.createElement("tr");
  row.innerHTML = `
    <td><input placeholder="Service"></td>
    <td><input placeholder="Username"></td>
    <td><input placeholder="Password"></td>
    <td><button class="remove">🗑️</button></td>
  `;
  tableBody.appendChild(row);
  row.querySelector(".remove").onclick = () => row.remove();
};

saveBtn.onclick = async () => {
  const rows = Array.from(tableBody.querySelectorAll("tr"));
  const passwords = rows.map(r => {
    const inputs = r.querySelectorAll("input");
    return { service: inputs[0].value, user: inputs[1].value, password: inputs[2].value };
  }).filter(p => p.service && p.user && p.password);

  if (passwords.length === 0) {
    status.textContent = "⚠️ Please add at least one password.";
    return;
  }

  status.textContent = "⏳ Saving...";

  const res = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ master: MASTER_PASSWORD, data: passwords })
  });

  const text = await res.text();
  status.textContent = text.includes("Saved") ? "✅ " + text : "❌ " + text;
};

async function loadPasswords() {
  try {
    const res = await fetch("https://raw.githubusercontent.com/patelprakash1/password-vault/main/passwords.json");
    if (res.ok) {
      const data = await res.json();
      tableBody.innerHTML = "";
      data.forEach(p => {
        const row = document.createElement("tr");
        row.innerHTML = `
          <td><input value="${p.service}"></td>
          <td><input value="${p.user}"></td>
          <td><input value="${p.password}"></td>
          <td><button class="remove">🗑️</button></td>
        `;
        row.querySelector(".remove").onclick = () => row.remove();
        tableBody.appendChild(row);
      });
    }
  } catch {
    console.log("No existing passwords found.");
  }
}
