import { app, ipcMain } from 'electron';
import serve from 'electron-serve';
import { createWindow } from './helpers';
import fs from 'fs';
import path from 'path';

const isProd = process.env.NODE_ENV === 'production';

if (isProd) {
  serve({ directory: 'app' });
} else {
  app.setPath('userData', `${app.getPath('userData')} (development)`);
}

(async () => {
  await app.whenReady();

  const mainWindow = createWindow('main', {
    width: 1000,
    height: 600,
  });

  if (isProd) {
    await mainWindow.loadURL('app://./home.html');
  } else {
    const port = process.argv[2];
    await mainWindow.loadURL(`http://localhost:${port}/home`);
    mainWindow.webContents.openDevTools();
  }

})();

app.on('window-all-closed', () => {
  app.quit();
});

ipcMain.on('get-dir', (event, title) => {
  console.log('get-dir');
  // 获取 ../data 目录下的所有文件夹
  const dir = path.join(__dirname, '../../data');
  const files = fs.readdirSync(dir);
  const dirs = files.filter((file) => {
    // 判断是否为文件夹
    return fs.statSync(path.join(dir, file)).isDirectory();
  });
  // 将文件夹列表发送给渲染进程
  event.sender.send('get-dir-reply', dirs);
});