export async function handler(event) {
  try {
    const { master, data } = JSON.parse(event.body);

    // Environment variables stored securely in Netlify
    const MASTER_PASS = process.env.MASTER_PASS;
    const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
    const USERNAME = process.env.GITHUB_USER;
    const REPO = process.env.GITHUB_REPO;
    const PATH = "passwords.json";

    // Verify master password
    if (master !== MASTER_PASS) {
      return { statusCode: 403, body: "Invalid master password" };
    }

    // Get current file SHA from GitHub
    const getRes = await fetch(
      `https://api.github.com/repos/${USERNAME}/${REPO}/contents/${PATH}`,
      {
        headers: { Authorization: `token ${GITHUB_TOKEN}` },
      }
    );

    if (!getRes.ok) {
      return {
        statusCode: getRes.status,
        body: `Failed to fetch file from GitHub (${getRes.status})`,
      };
    }

    const file = await getRes.json();

    // Prepare new content (Base64-encoded JSON)
    const newContent = Buffer.from(
      JSON.stringify(data, null, 2)
    ).toString("base64");

    // Update the file on GitHub
    const putRes = await fetch(
      `https://api.github.com/repos/${USERNAME}/${REPO}/contents/${PATH}`,
      {
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
      }
    );

    if (putRes.ok) {
      return { statusCode: 200, body: "Saved successfully!" };
    } else {
      const errText = await putRes.text();
      return {
        statusCode: 500,
        body: "Failed to save. GitHub error: " + errText,
      };
    }
  } catch (err) {
    return { statusCode: 500, body: "Error: " + err.message };
  }
}
