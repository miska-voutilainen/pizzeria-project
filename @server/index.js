import express from 'express';
import { connectMariaDB, closeMariaDB } from './config/db.js';
import createAuthRoutes from './src/routes/authRoutes.js';

(async () => {
  const pool = await connectMariaDB();
  const app = express();

  app.use(express.json());
  app.use('/api', createAuthRoutes(pool));

  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => console.log(`API listening on ${PORT}`));

  // graceful shutdown
  process.on('SIGINT', async () => {
    await closeMariaDB();
    process.exit(0);
  });
})();