import fetch from "node-fetch";

export async function handler(event) {
  try {
    const { master, data } = JSON.parse(event.body);
    const MASTER_PASS = process.env.MASTER_PASS;
    const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
    const USERNAME = process.env.GITHUB_USER;
    const REPO = process.env.GITHUB_REPO;
    const PATH = "passwords.json";

    if (master !== MASTER_PASS) {
      return { statusCode: 403, body: "Invalid master password" };
    }

    // get current file sha
    const getRes = await fetch(`https://api.github.com/repos/${USERNAME}/${REPO}/contents/${PATH}`, {
      headers: { Authorization: `token ${GITHUB_TOKEN}` }
    });
    const file = await getRes.json();

    // update file
    const putRes = await fetch(`https://api.github.com/repos/${USERNAME}/${REPO}/contents/${PATH}`, {
      method: "PUT",
      headers: {
        Authorization: `token ${GITHUB_TOKEN}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        message: "Updated passwords via vault",
        content: Buffer.from(JSON.stringify(data, null, 2)).toString("base64"),
        sha: file.sha
      })
    });

    if (putRes.ok) return { statusCode: 200, body: "Saved successfully!" };
    else return { statusCode: 500, body: "Failed to save. Check token permissions." };
  } catch (err) {
    return { statusCode: 500, body: "Error: " + err.message };
  }
}
