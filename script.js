const MASTER_PASS = "Urbannest@1!"; // Local verification before calling server

document.getElementById("loginBtn").addEventListener("click", () => {
  const inputPass = document.getElementById("masterInput").value.trim();
  if (inputPass === MASTER_PASS) {
    document.getElementById("login-screen").style.display = "none";
    document.getElementById("vault").style.display = "block";
  } else {
    document.getElementById("loginError").textContent = "Invalid master password!";
  }
});

// Add new row
document.getElementById("addBtn").addEventListener("click", () => {
  const table = document.getElementById("passwordTable");
  const row = table.insertRow(-1);
  row.innerHTML = `
    <td><input type="text" placeholder="Service"></td>
    <td><input type="text" placeholder="User"></td>
    <td><input type="text" placeholder="Password"></td>
  `;
});

// Save to GitHub
document.getElementById("saveBtn").addEventListener("click", async () => {
  const table = document.querySelector("#passwordTable");
  const rows = Array.from(table.querySelectorAll("tr")).slice(1);
  const passwords = rows.map(row => {
    const inputs = row.querySelectorAll("input");
    return {
      service: inputs[0].value,
      user: inputs[1].value,
      password: inputs[2].value
    };
  });

  const res = await fetch("/.netlify/functions/savePasswords", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ master: MASTER_PASS, data: passwords }),
  });

  const text = await res.text();
  alert(text);
});
