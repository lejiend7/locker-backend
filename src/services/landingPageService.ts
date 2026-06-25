import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class LandingPageService {
  getLandingPagePath(): string {
    return path.join(__dirname, '..', 'public', 'landing.html');
  }
}
