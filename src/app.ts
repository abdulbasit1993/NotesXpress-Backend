import express from 'express';
import config from './config/config';
import database from './config/db';
const routes = require('./routes');

const app = express();

app.use(express.json());

app.use('/api', routes);

process.on('SIGINT', async () => {
  console.log('Shutting down gracefully...');
  await database.close();
  process.exit(0);
});

async function startApp() {
  try {
    await database.connect(
      process.env.MONGODB_URL ?? '',
      process.env.DB_NAME ?? '',
    );

    app.listen(config.port, () => {
      console.log(`Server running on port ${config.port}`);
    });
  } catch (error) {
    console.error('Failed to start application: ', error);
    process.exit(1);
  }
}

startApp();

export default app;
