import axios from 'axios';
import express from 'express';
import helmet from 'helmet';
import zod from 'zod';
import { Client } from 'pg';

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(helmet());

const schema = zod.object({
  url: zod.string({ required_error: 'URL is required' }),
  method: zod.enum(['get', 'post', 'put', 'delete'], {
    required_error: 'Method is required',
  }),
  body: zod.object({}).optional(),
});

const sqlSchema = zod.object({
  url: zod.string({ required_error: 'URL is required' }),
  sql: zod.string({ required_error: 'SQL is required' }),
});

app.get('/health', (req, res) => {
  res.send('OK');
});

app.post('/sql', async (req, res) => {
  const body = req.body;
  const parsed = sqlSchema.safeParse(body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error });
    return;
  }

  const { url, sql } = parsed.data;
  try {
    const connection = new Client({
      connectionString: url,
    });

    await connection.connect();
    const result = await connection.query(sql);

    await connection.end();

    res.json(result);
  } catch (err) {
    const error = err as Error;
    res.status(400).json({ error: error.message });
  }
});

app.post('/api', (req, res) => {
  const body = req.body;
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error });
  }

  const { url, method, body: requestBody } = parsed.data;

  const result = axios[method](url, requestBody);
  res.json(result);
});

const { PORT } = process.env;

const port = PORT ? parseInt(PORT) : 80;

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
