import { app, ipcMain, shell } from 'electron';
import serve from 'electron-serve';
import { createWindow } from './helpers';
import { summarize } from './summarize';
import { getAllDirs } from './helpers/getAllDirs';
import { getConfig, setConfig } from './config';
import { botStatus, sendAudio, sendImage, sendText, startBot } from './startBot';
import path from 'path';
import { BASE_PATH, delay, PUBLIC_PATH, saveData } from './util';
import fs from 'fs';

const isProd: boolean = process.env.NODE_ENV === 'production';

if (isProd) {
  serve({ directory: 'app' });
} else {
  app.setPath('userData', `${app.getPath('userData')} (development)`);
}

(async () => {
  await app.whenReady();
  // pie.initialize(app);
  const mainWindow = createWindow('main', {
    width: 1200,
    height: 800,
    title: '群聊总结智囊',
    icon: path.join(__dirname, PUBLIC_PATH, 'logo.png'),
    backgroundColor: '#ffffff',
  });

  if (isProd) {
    await mainWindow.loadURL('app://./home.html');
  } else {
    const port = process.argv[2];
    await mainWindow.loadURL(`http://localhost:${port}/home`);
    // mainWindow.webContents.openDevTools();
  }
  ipcMain.on('get-bot-status', (event, title) => {
    mainWindow.webContents.send('bot-status-reply', {
      status: botStatus,
    });
  });
  ipcMain.on('summarize', (event, { dateDir, chatFileName }) => {
    const summarizeEvent = summarize(path.join(BASE_PATH, dateDir, chatFileName));
    summarizeEvent.addListener('update', (info) => {
      console.log('summarize update', info);
      mainWindow.webContents.send('toast', info);
    });
    summarizeEvent.addListener('end', () => {
      console.log('summarize end');
      mainWindow.webContents.send('summarize-end');
      const dirs = getAllDirs();
      // 将文件夹列表发送给渲染进程
      event.sender.send('get-all-dirs-reply', dirs);
    });
  });
  ipcMain.on('get-all-dirs', (event, title) => {
    const dirs = getAllDirs();
    // 将文件夹列表发送给渲染进程
    event.sender.send('get-all-dirs-reply', dirs);
  });

  ipcMain.on('save-config', async (event, config) => {
    setConfig(config);
    // if (config.PADLOCAL_API_KEY) {
    // 更新 padlocal token 后，重新启动 bot
    await startBot(mainWindow);
    // }
    mainWindow.webContents.send('toast', `Config saved`);
  });

  ipcMain.on('show-config', async (event, config) => {
    mainWindow.webContents.send('show-config', getConfig());
  });

  ipcMain.on('start-robot', async (event, config) => {
    await startBot(mainWindow);
  });

  ipcMain.on('show-file', (e, _path) => {
    shell.showItemInFolder(path.join(BASE_PATH, _path));
  });
  ipcMain.on('open-url', (e, url) => {
    shell.openExternal(url);
  });
  ipcMain.on('send-summarize', async (e, { dateDir, chatFileName }) => {
    await sendImage(
      chatFileName.replace('.txt', ''),
      path.join(BASE_PATH, dateDir, chatFileName.replace('.txt', ' 的今日群聊总结.png')),
    );
    await delay(5000);
    await sendAudio(
      chatFileName.replace('.txt', ''),
      path.join(BASE_PATH, dateDir, chatFileName.replace('.txt', ' 的今日群聊总结.mp3')),
    );
    await delay(5000);
    await sendText(
      chatFileName.replace('.txt', ''),
      getConfig().LAST_MESSAGE ||
      '主人们，智囊 AI 为您奉上今日群聊总结，祝您用餐愉快！由开源项目 https://github.com/aoao-eth/wechat-ai-summarize-bot 生成',
    );

    try {
      const file = path.join(BASE_PATH, dateDir, chatFileName.replace('.txt', ' 的今日群聊总结.txt'));
      const summarized = fs.readFileSync(file).toString();
      const 评价 = summarized.match(/整体评价.*?\n/);
      const 我的建议 = summarized.match(/我的建议.*?\n/);
      const 活跃发言者 = summarized.match(/今日最活跃的前五名发言者.*?\n/);
      if (活跃发言者) {
        await delay(5000);
        await sendText(chatFileName.replace('.txt', ''), 活跃发言者[0]);
      }
      if (评价) {
        await delay(5000);
        await sendText(chatFileName.replace('.txt', ''), 评价[0] + (我的建议 ? 我的建议[0] : ''));
      }
    } catch (e) {
    }

    mainWindow.webContents.send('toast', `发送成功`);
    saveData(dateDir, chatFileName.replace('.txt', ''), {
      sended: true,
      send_time: new Date().getTime(),
    });
  });
})();

app.on('window-all-closed', () => {
  app.quit();
});
