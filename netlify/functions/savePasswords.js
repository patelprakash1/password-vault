export async function handler(event) {
  try {
    const { master, data } = JSON.parse(event.body);

    // Environment variables from Netlify
    const MASTER_PASS = process.env.MASTER_PASS;
    const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
    const USERNAME = process.env.GITHUB_USER;
    const REPO = process.env.GITHUB_REPO;
    const PATH = "passwords.json";

    // Verify master password
    if (master !== MASTER_PASS) {
      return { statusCode: 403, body: "Invalid master password" };
    }

    // Fetch current file info
    const getRes = await fetch(`https://api.github.com/repos/${USERNAME}/${REPO}/contents/${PATH}`, {
      headers: { Authorization: `token ${GITHUB_TOKEN}` },
    });

    const file = await getRes.json();

    const newContent = Buffer.from(JSON.stringify(data, null, 2)).toString("base64");

    // Update the file
    const putRes = await fetch(`https://api.github.com/repos/${USERNAME}/${REPO}/contents/${PATH}`, {
      method: "PUT",
      headers: {
        Authorization: `token ${GITHUB_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: "Updated passwords via vault",
        content: newContent,
        sha: file.sha,
      }),
    });

    if (putRes.ok) {
      return { statusCode: 200, body: "Saved successfully!" };
    } else {
      const err = await putRes.text();
      return { statusCode: 500, body: "GitHub error: " + err };
    }
  } catch (err) {
    return { statusCode: 500, body: "Error: " + err.message };
  }
}
