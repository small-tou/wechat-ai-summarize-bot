import { checkConfigIsOk, getConfig } from './config';
import { log, Message, ScanStatus, WechatyBuilder } from 'wechaty';
import { getMessagePayload, LOGPRE } from './helper';
import { PuppetPadlocal } from 'wechaty-puppet-padlocal-plus';
import { WechatyInterface } from 'wechaty/dist/esm/src/wechaty/wechaty-impl';
import { FileBox } from 'file-box';
import { RoomInterface } from 'wechaty/dist/esm/src/user-modules/room';

let bot: WechatyInterface;

export let botStatus = '已停止';

export async function startBot(mainWindow: Electron.BrowserWindow) {
  if (!checkConfigIsOk()) {
    console.log('miss config');
    mainWindow.webContents.send('toast', `miss config`);
    mainWindow.webContents.send('show-config', getConfig());
    return;
  }

  if (bot) {
    // 清理，重新启动 bot
    await bot.stop();
    bot = null;
  }
  const config = getConfig();

  const puppet = new PuppetPadlocal({
    token: config.PADLOCAL_API_KEY,
  });
  bot = WechatyBuilder.build({
    name: 'WXGroupSummary',
    puppet,
  });
  bot.on('message', async (message) => {
    log.info(LOGPRE, `on message: ${message.toString()}`);

    await getMessagePayload(message);

    // await dingDongBot(message);
    botStatus = '运行中';
  });
  // 向 mainWindow 发送事件
  bot
    .on('error', (error) => {
      log.error(LOGPRE, `on error: ${error}`);
      mainWindow.webContents.send('toast', `错误: ${error}`);
      botStatus = '错误';
    })
    .on('login', (user) => {
      log.info(LOGPRE, `${user} login`);
      mainWindow.webContents.send('toast', `${user} login success`);
      mainWindow.webContents.send('login');
      botStatus = '登录成功';
    })
    .on('logout', (user, reason) => {
      log.info(LOGPRE, `${user} logout, reason: ${reason}`);
      mainWindow.webContents.send('toast', `${user} logout, reason: ${reason}`);
      mainWindow.webContents.send('logout');
      botStatus = '已退出';
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
      botStatus = '已扫描';
    })
    .on('stop', () => {
      mainWindow.webContents.send('toast', `stop`);
      botStatus = '已停止';
    });

  await bot.start();
  mainWindow.webContents.send('toast', `bot started`);
  await bot.ready();
  mainWindow.webContents.send('toast', `bot ready`);

  return bot;
}

const roomCache = new Map<string, RoomInterface>();
const getRoomByName = async (name: string) => {
  if (roomCache.has(name)) {
    return roomCache.get(name);
  }
  const roomList = await bot.Room.findAll();
  for (const room of roomList) {
    if (room.payload.topic === name) {
      console.log('找到了名为 [', name, '] 的群聊，其 ID 为:', room.id);
      roomCache.set(name, room);
      return room;
    }
  }
};
const sendMessage = async (toRoomName: string, payload: any): Promise<Message> => {
  const room = await getRoomByName(toRoomName);
  const message = (await room.say(payload)) as Message;
  return message;
};

export async function sendText(toRoomName: string, text: string) {
  console.log('sendText', toRoomName, text);
  const message = await sendMessage(toRoomName, text);
  return message;
}

export async function sendImage(toRoomName: string, imageFilePath: string) {
  console.log('sendImage', toRoomName, imageFilePath);
  // 图片大小建议不要超过 2 M
  const fileBox = FileBox.fromFile(imageFilePath);

  const message = await sendMessage(toRoomName, fileBox);
  return message;
}

export async function sendAudio(toRoomName: string, fileFilePath: string) {
  console.log('sendAudio', toRoomName, fileFilePath);
  const fileBox = FileBox.fromFile(fileFilePath);
  const message = await sendMessage(toRoomName, fileBox);
  return message;
}
