import { log, Message } from 'wechaty';
import * as PUPPET from 'wechaty-puppet';
import fs from 'fs';
import path from 'path';
import moment from 'moment';
import axios from 'axios';
import { BASE_PATH } from './util';

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
