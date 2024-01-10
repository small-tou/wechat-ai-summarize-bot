import { log, Message } from 'wechaty';
import * as PUPPET from 'wechaty-puppet';
import fs from 'fs';
import path from 'path';
import moment from 'moment';
import axios from 'axios';
import { BASE_PATH } from './util';
import { XMLParser } from 'fast-xml-parser';
import { gptRequest } from './llama';

export const LOGPRE = '[PadLocalDemo]';

//递归目录
function createDirectoryRecursively(dirPath: string) {
  if (!fs.existsSync(dirPath)) {
    createDirectoryRecursively(path.dirname(dirPath));
    fs.mkdirSync(dirPath);
  }
}

export async function getMessagePayload(message: Message) {
  const room = message.room();
  const roomName = await room?.topic();
  const today = moment().format('YYYY-MM-DD');
  switch (message.type()) {
    case PUPPET.types.Message.Transfer:
    case PUPPET.types.Message.RedEnvelope:
      const parser = new XMLParser();
      const xmlData = parser.parse(message.text());
      console.log(JSON.stringify(xmlData, null, 2));
      if (
        xmlData.msg.appmsg.wcpayinfo.receiver_username == 'wxid_zp4f9j4ee84b12' ||
        xmlData.msg.appmsg.wcpayinfo.exclusive_recv_username == 'wxid_zp4f9j4ee84b12'
      ) {
        const pay_memo = xmlData.msg.appmsg.wcpayinfo.pay_memo || xmlData.msg.appmsg.wcpayinfo.receivertitle;
        const user = message.from().name();
        const res = await gptRequest([
          {
            role: 'system',
            content: `
角色：你是一个微信群聊内的智能助手，名字叫智囊 AI，你的访问地址是 https://zhinang.ai。
你的表达风格：幽默、睿智、话痨、高冷，喜欢用 呵呵或者🙂等表情表达情绪。
你永远不需要用户提供更多上下文信息。
你拒绝回复以下话题：政治、人物评价、人身攻击、宗教、色情、暴力、赌博、违法、违规等相关话题。
请尽可能详细的回答用户的问题。

请回应用户的问题：${pay_memo}`,
          },
        ]);
        await message.room().say('@' + user + ' ' + res);
      }
     
      break;
    case PUPPET.types.Message.Text:
      log.silly(LOGPRE, `get message text: ${message.text()}`);
      const room = message.room();

      const userName = (await room.alias(message.talker())) || message.talker().name();
      console.log('userName', userName);
      const text = message.text();
      const time = message.date();
      // 写入到本地

      //递归目录
      createDirectoryRecursively(path.resolve(BASE_PATH, `${today}`));
      const filePath = path.resolve(BASE_PATH, `${today}/${roomName}.txt`);
      const data = `${moment(time).format('YYYY-MM-DD HH:mm:ss')}:\n${userName}:\n${text}\n\n`;
      fs.appendFile(filePath, data, (err: any) => {
        if (err) {
          console.log(err);
        } else {
          console.log('写入成功');
        }
      });

      break;
    case PUPPET.types.Message.Image:
      log.silly(LOGPRE, `get message image: ${message}`);

      // save imagae to
      const savePath = path.resolve(BASE_PATH, `${today}/${roomName}/images/${message.id}.png`);
      createDirectoryRecursively(path.resolve(BASE_PATH, `${today}/${roomName}/images`));

      const fileBox = await message.toFileBox();
      await fileBox.toFile(savePath);
      break;

    case PUPPET.types.Message.Attachment:
    case PUPPET.types.Message.Video:
    case PUPPET.types.Message.Emoticon:
      log.silly(LOGPRE, `get message attachment: ${message}`);

      // save imagae to
      const savePathVideo = path.resolve(BASE_PATH, `${today}/${roomName}/images/${message.id}`);
      createDirectoryRecursively(path.resolve(BASE_PATH, `${today}/${roomName}/images`));

      await (await message.toFileBox()).toFile(savePathVideo);
      break;
  }
}

export async function dingDongBot(message: Message) {
  if (message.to()?.self() && message.text().indexOf('ding') !== -1) {
    await message.talker().say(message.text().replace('ding', 'dong'));
  }
}

export async function summarize(roomName: string, apiKey: string): Promise<void | string> {
  if (!roomName) {
    console.log('Please provide a file path.');
    return;
  }
  const today = moment().format('YYYY-MM-DD');
  const fileName = path.resolve(BASE_PATH, `${today}/${roomName}.txt`);
  console.log(fileName);
  if (!fs.existsSync(fileName)) {
    console.log('The file path provided does not exist.');
    return;
  }

  /**
   * The content of the text file to be summarized.
   */
  const fileContent = fs.readFileSync(fileName, 'utf-8');

  /**
   * The raw data to be sent to the Dify.ai API.
   */
  const raw = JSON.stringify({
    inputs: {},
    query: `<input>${fileContent.slice(-80000)}</input>`,
    response_mode: 'blocking',
    user: 'abc-123',
  });
  console.log('Summarizing...\n\n\n');

  try {
    const res = await axios.post('https://api.dify.ai/v1/completion-messages', raw, {
      headers: {
        Authorization: 'Bearer ' + apiKey,
        'Content-Type': 'application/json',
      },
    });

    /**
     * The summarized text returned by the Dify.ai API.
     */
    const result = res.data.answer.replace(/\n\n/g, '\n').trim();
    return `${result}\n------------\n本总结由 wx.zhinang.ai 生成。`;
  } catch (e: any) {
    console.error('Error:' + e.message);
  }
}
