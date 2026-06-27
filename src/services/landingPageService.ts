import path from 'path';
import { fileURLToPath } from 'url';
import { LandingPageServiceInterface } from '@/services/interfaces/LandingPageServiceInterface.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class LandingPageService implements LandingPageServiceInterface {
  getLandingPagePath(): string {
    return path.join(__dirname, '..', 'public', 'landing.html');
  }
}
