/* eslint-env node */
import express from 'express';
import fs from 'fs/promises';
import path from 'path';
import cors from 'cors';

const app = express();
const port = 3001;
const savesDir = path.join(process.cwd(), 'saves');

app.use(cors());
app.use(express.json({ limit: '50mb' }));

const setup = async () => {
  try {
    await fs.mkdir(savesDir, { recursive: true });
  } catch (_error) {
    console.error('Error creating saves directory:', _error);
  }
};

app.get('/api/roadmaps', async (req, res) => {
  try {
    const files = await fs.readdir(savesDir);
    const roadmaps = await Promise.all(
      files.map(async (file) => {
        if (path.extname(file) === '.json') {
          const content = await fs.readFile(path.join(savesDir, file), 'utf-8');
          return JSON.parse(content);
        }
        return null;
      })
    );
    res.json(roadmaps.filter(Boolean));
  } catch (_error) {
    res.status(500).json({ message: 'Error loading roadmaps' });
  }
});

app.post('/api/roadmaps', async (req, res) => {
  try {
    const { roadmap, name } = req.body;
    const id = Date.now();
    const newRoadmap = { ...roadmap, id, name };
    const filePath = path.join(savesDir, `${id}.json`);
    await fs.writeFile(filePath, JSON.stringify(newRoadmap, null, 2));
    res.status(201).json(newRoadmap);
  } catch (_error) {
    res.status(500).json({ message: 'Error saving roadmap' });
  }
});

app.delete('/api/roadmaps/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const filePath = path.join(savesDir, `${id}.json`);
    await fs.unlink(filePath);
    res.status(204).send();
  } catch (_error) {
    res.status(500).json({ message: 'Error deleting roadmap' });
  }
});

app.listen(port, () => {
  setup();
  console.log(`Server listening at http://localhost:${port}`);
});