import { app } from 'electron';
import path from 'path';
import fs from 'fs';

const isProd: boolean = process.env.NODE_ENV === 'production';
export const BASE_PATH = path.join(app.getPath('userData'), './data');
export const BASE_PATH_CACHE = path.join(app.getPath('userData'), './ucache');

export const PUBLIC_PATH = path.join(__dirname, isProd ? '../../public' : '../public');
if (!fs.existsSync(BASE_PATH)) {
  fs.mkdirSync(BASE_PATH);
}

if (!fs.existsSync(BASE_PATH_CACHE)) {
  fs.mkdirSync(BASE_PATH_CACHE);
}

console.log('BASE_PATH', BASE_PATH);

export async function delay(ms: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

export function saveData(date: string, roomName: string, kvs: Record<string, any>) {
  const dataFilePath = path.join(BASE_PATH, date, 'data.json');
  let data = {};
  if (fs.existsSync(dataFilePath)) {
    try {
      data = JSON.parse(fs.readFileSync(dataFilePath).toString());
    } catch (e) {}
  }
  if (!data[roomName]) {
    data[roomName] = {};
  }
  Object.assign(data[roomName], kvs);
  fs.writeFileSync(dataFilePath, JSON.stringify(data));
}

export function getData(date: string, roomName: string) {
  const dataFilePath = path.join(BASE_PATH, date, 'data.json');
  let data = {};
  if (fs.existsSync(dataFilePath)) {
    try {
      data = JSON.parse(fs.readFileSync(dataFilePath).toString());
    } catch (e) {}
  }
  if (!data[roomName]) {
    data[roomName] = {};
  }
  return data[roomName];
}
