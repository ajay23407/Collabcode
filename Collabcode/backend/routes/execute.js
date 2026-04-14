const express = require("express");
const axios = require("axios");
const protect = require("../middlewares/auth");

const router = express.Router();

router.use(protect);

// Language mapping (Judge0 IDs)
const LANGUAGE_MAP = {
  javascript: 63,
  python: 71,
  cpp: 54,
  java: 62,
};

router.post("/", async (req, res) => {
  const { code, language } = req.body;

  if (!code) {
    return res.status(400).json({ error: "No code provided" });
  }

  const language_id = LANGUAGE_MAP[language];

  if (!language_id) {
    return res.status(400).json({ error: "Unsupported language" });
  }

  try {
    console.log("🔥 JUDGE0 FREE API RUNNING");

    const response = await axios.post(
      "https://ce.judge0.com/submissions?base64_encoded=false&wait=true",
      {
        source_code: code,
        language_id: language_id,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    const result = response.data;

    res.json({
      stdout: result.stdout,
      stderr: result.stderr,
      exitCode: result.status?.id,
    });

  } catch (err) {
    console.error("🔥 FULL ERROR:", err.response?.data || err.message);

    res.status(500).json({
      stdout: "",
      stderr: JSON.stringify(err.response?.data || err.message),
      exitCode: 1,
    });
  }
});

module.exports = router;