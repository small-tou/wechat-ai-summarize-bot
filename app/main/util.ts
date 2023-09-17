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
    } catch (e) {
    }
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
    } catch (e) {
    }
  }
  if (!data[roomName]) {
    data[roomName] = {};
  }
  return data[roomName];
}

export function getChatHistoryFromFile(filePath: string) {
  const fileContent = fs.readFileSync(filePath).toString();
  /**
   * 2023-09-16 19:49:47:
   * 甘泉:
   * 一个中文，一个英文
   *
   * 2023-09-16 19:56:28:
   * Update!9.9.9:
   * 嘿嘿，到手了
   *
   * 2023-09-16 20:02:43:
   * 芋头 🚀🌙:
   * 芋头 : [图片]
   */
    // 写一段脚本，从类似的结构中抽取时间、用户名、内容

  const pattern = /(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}):([\s\S]*?):([\s\S]*?)(?=(\n\n|$))/g;

  const res = [];
  let result;
  while ((result = pattern.exec(fileContent))) {
    const time = result[1];
    const name = result[2];
    const content = result[3].trim();
    res.push({
      time,
      name,
      content,
    });
  }
  return res;
}