import { app, ipcMain } from 'electron';
import serve from 'electron-serve';
import { createWindow } from './helpers';
import { summarize } from './summarize';
import { getAllDirs } from './helpers/getAllDirs';
import { checkConfigIsOk, getConfig, setConfig } from './config';
import { sendAudio, sendImage, sendText, startBot } from './startBot';
import path from 'path';
import { BASE_PATH, delay } from './util';
import {shell} from 'electron';

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
    height: 800,
    title: '微信群聊智囊',
  });

  if (isProd) {
    await mainWindow.loadURL('app://./home.html');
  } else {
    const port = process.argv[2];
    await mainWindow.loadURL(`http://localhost:${port}/home`);
    // mainWindow.webContents.openDevTools();
  }



  ipcMain.on('summarize', (event, {
    dateDir,
    chatFileName,
  }) => {
    const summarizeEvent = summarize(path.join(BASE_PATH, dateDir, chatFileName));
    summarizeEvent.addListener('update', (info) => {
      console.log('summarize update', info)
      mainWindow.webContents.send('toast', info);
    });
    summarizeEvent.addListener('end', ( ) => {
      console.log('summarize end')
      mainWindow.webContents.send('summarize-end' );
    })
  });
  ipcMain.on('get-all-dirs', (event, title) => {
    const dirs = getAllDirs();
    // 将文件夹列表发送给渲染进程
    event.sender.send('get-all-dirs-reply', dirs);
  });

  ipcMain.on('save-config', async (event, config) => {
    setConfig(config);
    if (config.PADLOCAL_API_KEY) {
      // 更新 padlocal token 后，重新启动 bot
      await startBot(mainWindow);
    }
    mainWindow.webContents.send('toast', `Config saved`);
  });

  ipcMain.on('show-config', async (event, config) => {

    mainWindow.webContents.send('show-config',getConfig());
  });

  ipcMain.on('start-robot', async (event, config) => {
    await startBot(mainWindow);
  });

  ipcMain.on('show-file', (e,_path) =>{
    shell.showItemInFolder(path.join(BASE_PATH,_path));
  });
  ipcMain.on('send-summarize',async (e, {
    dateDir,
    chatFileName,
  })=>{
    await sendImage(chatFileName.replace('.txt',''),path.join(BASE_PATH,dateDir,chatFileName.replace('.txt',' 的今日群聊总结.png')))
    await delay(1000)
    await sendAudio(chatFileName.replace('.txt',''),path.join(BASE_PATH,dateDir,chatFileName.replace('.txt',' 的今日群聊总结.mp3')))
    await delay(1000)
    await sendText(chatFileName.replace('.txt',''),'主人们，智囊 AI 为您奉上今日群聊总结，祝您用餐愉快！由开源项目 wx.zhinang.ai 生成')
    mainWindow.webContents.send('toast', `发送成功`);
  });


})();

app.on('window-all-closed', () => {
  app.quit();
});


