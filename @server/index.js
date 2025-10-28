import express from 'express';
import { connectMongoDB } from './config/db.js';
import createAuthRoutes from './src/routes/authRoutes.js';

const app = express();
app.use(express.json());

const db = await connectMongoDB();

app.use('/api', createAuthRoutes(db));

app.listen(process.env.PORT || 3001, () => {
  console.log(`Server running on http://localhost:${process.env.PORT || 3001}`);
});