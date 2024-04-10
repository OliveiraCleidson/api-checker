import axios from 'axios';
import express from 'express';
import helmet from 'helmet';
import zod from 'zod';

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
