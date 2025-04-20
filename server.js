const express = require('express');
const multer = require('multer');
const cors = require('cors');
const OpenAI = require('openai');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Serve frontend from /public folder
app.use(express.static(path.join(__dirname, 'public')));

// Upload config
const upload = multer({ dest: 'uploads/' });

// OpenAI setup
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

app.post('/analyze', upload.array('images', 4), async (req, res) => {
  try {
    const messages = [
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: 'These are frames from a golf swing video. Evaluate the swing technique across the frames, identify any flaws, and suggest 2 drills to help improve the swing.',
          },
          ...req.files.map((file) => ({
            type: 'image_url',
            image_url: {
              url: `data:image/jpeg;base64,${fs.readFileSync(file.path).toString('base64')}`,
            },
          })),
        ],
      },
    ];

    const response = await openai.chat.completions.create({
      model: 'gpt-4-vision-preview',
      messages,
      max_tokens: 600,
    });

    const feedback = response.choices[0].message.content;
    res.json({ feedback });

    req.files.forEach((file) => fs.unlinkSync(file.path));
  } catch (err) {
    console.error('❌ Error analyzing images:', err);
    res.status(500).json({ error: 'Failed to analyze images' });
  }
});

app.listen(port, () => {
  console.log(`✅ Server running on port ${port}`);
});
