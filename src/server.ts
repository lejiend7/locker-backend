import 'reflect-metadata';
import { AppDataSource } from './database/data-source.js';
import { createApp } from './app.js';

const PORT = process.env.PORT || 3000;

async function bootstrap() {
  try {
    // Initialize TypeORM DataSource
    await AppDataSource.initialize();
    console.log('Database connection established');

    // Create Express app
    const app = createApp();

    // Start server
    app.listen(PORT, () => {
      console.log(`SmartLocker API running on http://localhost:${PORT}`);
      console.log(`Database: ${process.env.DB_NAME || 'smartlocker'}`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

bootstrap();
