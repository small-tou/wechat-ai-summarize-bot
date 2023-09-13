import { app, ipcMain } from 'electron';
import serve from 'electron-serve';
import { createWindow } from './helpers';
import fs from 'fs';
import path from 'path';
import { uniq } from 'lodash';
import bot from './watch';
import { log, ScanStatus } from 'wechaty';
import { LOGPRE } from './helper';

const isProd: boolean = process.env.NODE_ENV === 'production';

if (isProd) {
  serve({ directory: 'app' });
} else {
  app.setPath('userData', `${app.getPath('userData')} (development)`);
}

function getChatInfoForDate(date: string, chatName: string) {
  const filePath = path.join(__dirname, `../../data/${date}/${chatName}.txt`);
  if (!fs.existsSync(filePath)) {
    return false;
  } else {
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const chats = fileContent.split(/\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}:\n/).filter((item) => item);
    // 对话数量
    const chatCount = chats.length;
    // 参与人
    const chatMembers = uniq(
      chats.map((item) => {
        return item.split('\n')[0];
      })
    );

    return {
      chatCount,
      chatMembers,
      chatMembersCount: chatMembers.length,
      chatLetters: fileContent.length,
    };
  }
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

  // 向 mainWindow 发送事件

  bot.start().then(() => {
    mainWindow.webContents.send('toast', `bot started`);
  });

  bot
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
        const qrcodeImageUrl = 'https://wechaty.js.org/qrcode/' + encodeURIComponent(qrcode);
        mainWindow.webContents.send('scan-wait', qrcodeImageUrl);
      } else {
        log.info(LOGPRE, `onScan: ${ScanStatus[status]}(${status})`);
        mainWindow.webContents.send('toast', `onScan: ${ScanStatus[status]}(${status})`);
      }
    });
})();

app.on('window-all-closed', () => {
  app.quit();
});
ipcMain.on('get-dir', (event, title) => {
  // 获取 ../data 目录下的所有文件夹
  const dir = path.join(__dirname, '../../data');
  const files = fs.readdirSync(dir);
  const dirs = files
    .filter((file) => {
      // 判断是否为文件夹
      return fs.statSync(path.join(dir, file)).isDirectory();
    })
    .map((_path) => {
      const childFiles = fs.readdirSync(path.join(dir, _path));
      const summarizeSuffix = /_summarized| 的今日群聊总结/;
      const chatFiles = childFiles
        .filter((file) => {
          return !summarizeSuffix.test(file);
        })
        .map((file) => {
          const chatInfo = getChatInfoForDate(_path, file.replace('.txt', ''));
          return {
            name: file,
            info: chatInfo
              ? chatInfo
              : {
                  chatCount: 0,
                  chatMembers: [],
                  chatLetters: 0,
                  chatMembersCount: 0,
                },
            hasSummarized:
              fs.existsSync(path.join(dir, _path, file).replace('.txt', ' 的今日群聊总结.txt')) ||
              fs.existsSync(path.join(dir, _path, file).replace('.txt', '_summarized.txt')),
            hasImage:
              fs.existsSync(path.join(dir, _path, file).replace('.txt', ' 的今日群聊总结.png')) ||
              fs.existsSync(path.join(dir, _path, file).replace('.txt', '_summarized.png')),
            hasAudio:
              fs.existsSync(path.join(dir, _path, file).replace('.txt', ' 的今日群聊总结.mp3')) ||
              fs.existsSync(path.join(dir, _path, file).replace('.txt', '_summarized.mp3')),
          };
        })
        .sort((r1, r2) => {
          return r1.info?.chatCount - r2.info?.chatCount > 0 ? -1 : 1;
        });
      return {
        path: _path,
        chatFiles,
        allFiles: childFiles,
      };
    })
    .sort((r1, r2) => {
      return r1.path > r2.path ? -1 : 1;
    });
  // 将文件夹列表发送给渲染进程
  event.sender.send('get-dir-reply', dirs);
});
