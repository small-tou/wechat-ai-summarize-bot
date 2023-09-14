import { app } from 'electron';
import path from 'path';
import fs from 'fs';

export const BASE_PATH = path.join(app.getPath('userData'), './data');

if (!fs.existsSync(BASE_PATH)) {
  fs.mkdirSync(BASE_PATH);
}