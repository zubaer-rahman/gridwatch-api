import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';

const app: Application = express();

// Parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Security
app.use(helmet());
app.use(cors());

// Test Route
app.get('/', (req: Request, res: Response) => {
  res.send({
    success: true,
    message: 'GridWatch API is running...',
    data: {}
  });
});

// Default not found and error handler can be added later

export default app;
