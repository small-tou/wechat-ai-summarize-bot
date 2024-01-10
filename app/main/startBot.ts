import { checkConfigIsOk, getConfig } from './config';
import { log, Message, ScanStatus, WechatyBuilder } from 'wechaty';
import { getMessagePayload, LOGPRE } from './helper';
import { WechatyInterface } from 'wechaty/dist/esm/src/wechaty/wechaty-impl';
import { FileBox } from 'file-box';
import { RoomInterface } from 'wechaty/dist/esm/src/user-modules/room';
import path from 'path';
import { BASE_PATH, getChatHistoryFromFile } from './util';
import moment from 'moment';
import { gptRequest } from './llama';
import { PuppetPadlocal } from 'wechaty-puppet-padlocal-plus';
import fs from 'fs';
import * as PUPPET from 'wechaty-puppet';

let bot: WechatyInterface;

const lastSendTime = new Map<string, number>();
const sendCount = new Map<string, number>();
let sendCountUpdateTime = new Date().getTime();

export let botStatus = '已停止';
export let botAccount = '';

export async function logoutBot() {
  if (bot) {
    await bot.logout();
  }
}

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

    // 如果是红包，并且定向，接收人是我，则自动领取

    if (message.type() == PUPPET.types.Message.RedEnvelope) {
    }
    botStatus = '运行中';

    if (!config.ENABLE_AUTO_REPLY) {
      return;
    }
    let shouldReply = false;

    const mentionList = await message.mentionList();
    if (mentionList.length == 1) {
      if (
        mentionList.find((m) => {
          if (m.name() === botAccount) {
            return true;
          }
        })
      ) {
        shouldReply = true;
      }
    }

    if (moment().format('YYYY-MM-DD') !== moment(sendCountUpdateTime).format('YYYY-MM-DD')) {
      sendCount.clear();
      sendCountUpdateTime = new Date().getTime();
    }
    const roomName = await message.room()?.topic();
    // 替换掉 xml 标签的内容
    const messageText = message.text()?.replace(/<.+>[\s\S]*<\/.+>/g, '');

    // return;
    if (!message.self()) {
      const roomBlack = [];
      if (!roomBlack.includes(roomName)) {
        // 包含这些关键词的文本可能是提问
        const whilteKeywords = config.AZURE_REPLY_KEYWORDS.split(' ');

        whilteKeywords.forEach((k) => {
          if (messageText.includes(k)) {
            shouldReply = true;
          }
        });
      }
    }
    if (shouldReply) {
      if (lastSendTime.get(message.room().id)) {
        const _lastSendTime = lastSendTime.get(message.room().id);
        const now = new Date().getTime();
        if (now - _lastSendTime < 1000 * 60) {
          return;
        }
      }

      console.log('sendCount', sendCount.get(message.room().id));
      console.log('limit', config.AZURE_REPLY_LIMIT || 10);

      if (sendCount.get(message.room().id) > (config.AZURE_REPLY_LIMIT || 10)) {
        shouldReply = false;
        await message
          .room()
          .say(
            `我今天已经回复过你们很多次了，我每天只能为一个群聊提供 ${
              config.AZURE_REPLY_LIMIT || 10
            } 条免费回复，我要去睡觉啦(¦3[▓▓] 晚安` +
              '\n-------------\n你可以通过向我发送定向红包或者转账（在备注中附上问题）来向我直接提问（不限次数）'
          );
        return;
      }

      const room = await message.room().topic();
      const date = moment().format('YYYY-MM-DD');
      const filePath = path.resolve(BASE_PATH, `${date}/${room}.txt`);
      const content = getChatHistoryFromFile(filePath);
      let messages = [];
      if (content.length > 0) {
        messages = messages.concat(
          content
            .map((c) => {
              if (c.name === botAccount) {
                return `${c.content?.replace(/<.+>[\s\S]*<\/.+>/g, '').slice(-100)}`;
              }
              return `${c.name.replace(/\n/g, '')}：${c.content
                ?.replace(/<.+>[\s\S]*<\/.+>/g, '')
                .slice(-100)
                .replace(/\n/g, '')}`;
            })
            .slice(-15)
        );
      }

      try {
        const text = messageText.replace('@智囊 zhinang.ai', '');
        const user = message.from().name();
        messages.push(`${text.replace(/\n/g, '')}`);

        if (moment().hours() >= 20 || moment().hours() < 8) {
          // 告诉用户我要睡觉了
          const sleepMessage = [
            'Sorry，我的工作时间是每天8点到20点之间，现在是我的休息时间，我上床睡觉啦(¦3[▓▓] 晚安',
            '亲爱的，我虽然是你的智囊，但我也需要休息的，现在是我的休息时间，我上床睡觉啦(¦3[▓▓] 晚安',
            '我亲爱的卡布奇诺，我要去睡觉啦，晚安(¦3[▓▓]',
            '我亲爱的卡布奇诺，我要去洗澡啦，晚安(¦3[▓▓]',
            '亲爱的，我去洗洗睡了，我的工作时间是每天8点到20点之间~~~很乐意在工作时间为您提供服务',
            '我亲爱的卡比巴拉，我的工作时间是每天8点到20点之间，我去上个厕所就去睡觉啦(¦3[▓▓] 晚安',
            '我亲爱的卡比巴拉，我的工作时间是每天8点到20点之间，我去洗个脚就去睡觉啦(¦3[▓▓] 晚安',
            '我亲爱的卡比巴拉，我的工作时间是每天8点到20点之间，我去洗个澡就去睡觉啦(¦3[▓▓] 晚安',
            '亲爱的主人，我的工作时间是每天8点到20点之间，我先去洗澡啦，你要一起吗？',
          ];
          await message
            .room()
            .say(
              '@' +
                user +
                ' ' +
                sleepMessage[Math.floor(Math.random() * sleepMessage.length)] +
                '\n-------------\n你可以通过向我发送定向红包或者转账（在备注中附上问题）来强制唤醒我，我会回答您备注中的问题'
            );
          lastSendTime.set(message.room().id, new Date().getTime());
          return;
        }
        const res = await gptRequest([
          {
            role: 'system',
            content: `
角色：你是一个微信群聊内的智能助手，名字叫智囊 AI，你的访问地址是 https://zhinang.ai。
你的表达风格：幽默、睿智、话痨、高冷，喜欢用 呵呵或者🙂等表情表达情绪。
你拒绝回复以下话题：政治、人物评价、人身攻击、宗教、色情、暴力、赌博、违法、违规等相关话题。

以下是群聊内的最后几条对话，请回应用户的最后一个对话中的问题。`,
          },
          ...messages.map((m) => {
            return {
              role: 'user',
              content: m,
            };
          }),
        ]);
        await message.room().say('@' + user + ' ' + res);

        fs.appendFileSync(
          path.join(BASE_PATH, 'log.txt'),
          `------------------------------\n${new Date().toLocaleString()} \n${user} \n${roomName} \n${messageText} \n${res}\n`
        );
        lastSendTime.set(message.room().id, new Date().getTime());
        sendCount.set(message.room().id, (sendCount.get(message.room().id) || 0) + 1);
      } catch (e) {
        console.error(e);
      }
    }
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
      botAccount = user.name();
    })
    .on('logout', (user, reason) => {
      log.info(LOGPRE, `${user} logout, reason: ${reason}`);
      mainWindow.webContents.send('toast', `${user} logout, reason: ${reason}`);
      mainWindow.webContents.send('logout');
      botStatus = '已退出';
    })
    .on('scan', async (qrcode, status) => {
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

  bot.on('login', async (user) => {
    console.info(`${user.name()} login`);
  });

  bot.on('room-leave', (room, leaverList, remover) => {
    console.log('机器人被踢出群了!');
  });

  bot.on('room-join', (room, inviteeList, inviter) => {
    console.log('有人加入群');
  });

  bot.on('friendship', async (friendship) => {});

  bot.on('room-topic', (payload, newTopic, oldTopic) => {
    console.log('群名称修改', newTopic, oldTopic);
  });

  bot.on('room-invite', (payload) => {
    console.log('收到超过40个人的群邀请', payload);
    //自动接受邀请
    payload.accept();
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
