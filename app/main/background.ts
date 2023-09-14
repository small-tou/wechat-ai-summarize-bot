import { app, ipcMain } from 'electron';
import serve from 'electron-serve';
import { createWindow } from './helpers';
import bot from './bot';
import { log, ScanStatus } from 'wechaty';
import { LOGPRE } from './helper';
import { summarize } from './summarize';
import { getAllDirs } from './helpers/getAllDirs';

const isProd: boolean = process.env.NODE_ENV === 'production';

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
    title: '微信群聊总结',
  });

  if (isProd) {
    await mainWindow.loadURL('app://./home.html');
  } else {
    const port = process.argv[2];
    await mainWindow.loadURL(`http://localhost:${port}/home`);
    mainWindow.webContents.openDevTools();
  }

  // 向 mainWindow 发送事件


  bot
    .on('error', (error) => {
      log.error(LOGPRE, `on error: ${error}`);
      mainWindow.webContents.send('toast', `error: ${error}`);
    })
    .on('login', (user) => {
      log.info(LOGPRE, `${user} login`);
      mainWindow.webContents.send('toast', `${user} login success`);
      mainWindow.webContents.send('login');
    })

    .on('logout', (user, reason) => {
      log.info(LOGPRE, `${user} logout, reason: ${reason}`);
      mainWindow.webContents.send('toast', `${user} logout, reason: ${reason}`);
      mainWindow.webContents.send('logout');
    })
    .on('scan', (qrcode, status) => {
      if (status === ScanStatus.Waiting && qrcode) {
        mainWindow.webContents.send('scan-wait', qrcode);
      } else if (status === ScanStatus.Scanned) {
        mainWindow.webContents.send('scan-submit');
        mainWindow.webContents.send('toast', `QRCode Scanned`);
      } else if (status === ScanStatus.Confirmed) {
        mainWindow.webContents.send('scan-confirmed');
        mainWindow.webContents.send('toast', `QRCode Confirmed`);
      } else {
        log.info(LOGPRE, `onScan: ${ScanStatus[status]}(${status})`);
        mainWindow.webContents.send('toast', `onScan: ${ScanStatus[status]}(${status})`);
      }
    })
    .on('stop', () => {
      mainWindow.webContents.send('toast', `stop`);
    });

  await bot.start();
  mainWindow.webContents.send('toast', `bot started`);
  await bot.ready();
  mainWindow.webContents.send('toast', `bot ready`);
  ipcMain.on('summarize', (event, filePath) => {
    const summarizeEvent = summarize(filePath);
    summarizeEvent.on('update', (info) => {
      mainWindow.webContents.send('toast', info);
    });
  });
  ipcMain.on('get-all-dirs', (event, title) => {
    const dirs = getAllDirs();
    // 将文件夹列表发送给渲染进程
    event.sender.send('get-all-dirs-reply', dirs);
  });

})();

app.on('window-all-closed', () => {
  app.quit();
});


