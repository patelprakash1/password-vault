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

    let sha = null;
    const getRes = await fetch(`https://api.github.com/repos/${USERNAME}/${REPO}/contents/${PATH}`, {
      headers: { Authorization: `token ${GITHUB_TOKEN}` }
    });

    if (getRes.ok) {
      const file = await getRes.json();
      sha = file.sha;
    }

    if (!Array.isArray(data) || data.length === 0) {
      return { statusCode: 400, body: "No passwords to save (data empty)." };
    }

    const newContent = Buffer.from(JSON.stringify(data, null, 2)).toString("base64");

    const putRes = await fetch(`https://api.github.com/repos/${USERNAME}/${REPO}/contents/${PATH}`, {
      method: "PUT",
      headers: {
        Authorization: `token ${GITHUB_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: "Updated passwords via vault",
        content: newContent,
        sha: sha || undefined,
      }),
    });

    if (putRes.ok) {
      const json = await putRes.json();
      return { statusCode: 200, body: `Saved successfully! Commit: ${json.commit.sha}` };
    } else {
      const err = await putRes.text();
      return { statusCode: 500, body: "GitHub PUT error: " + err };
    }
  } catch (err) {
    return { statusCode: 500, body: "Error: " + err.message };
  }
}
