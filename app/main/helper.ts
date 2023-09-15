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
  switch (message.type()) {
    case PUPPET.types.Message.Text:
      log.silly(LOGPRE, `get message text: ${message.text()}`);
      const room = message.room();
      const roomName = await room?.topic();
      const userName = message.talker().name();
      const text = message.text();
      const time = message.date();
      // 写入到本地
      const today = moment().format('YYYY-MM-DD');
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

    case PUPPET.types.Message.Attachment:
    case PUPPET.types.Message.Audio: {
      const attachFile = await message.toFileBox();

      const dataBuffer = await attachFile.toBuffer();

      log.info(LOGPRE, `get message audio or attach: ${dataBuffer.length}`);

      break;
    }

    case PUPPET.types.Message.Video: {
      const videoFile = await message.toFileBox();

      const videoData = await videoFile.toBuffer();

      log.info(LOGPRE, `get message video: ${videoData.length}`);

      break;
    }

    case PUPPET.types.Message.Emoticon: {
      const emotionFile = await message.toFileBox();

      const emotionJSON = emotionFile.toJSON();
      log.info(LOGPRE, `get message emotion json: ${JSON.stringify(emotionJSON)}`);

      const emotionBuffer: Buffer = await emotionFile.toBuffer();

      log.info(LOGPRE, `get message emotion: ${emotionBuffer.length}`);

      break;
    }

    case PUPPET.types.Message.Image: {
      const messageImage = await message.toImage();

      const thumbImage = await messageImage.thumbnail();
      const thumbImageData = await thumbImage.toBuffer();

      log.info(LOGPRE, `get message image, thumb: ${thumbImageData.length}`);

      const hdImage = await messageImage.hd();
      const hdImageData = await hdImage.toBuffer();

      log.info(LOGPRE, `get message image, hd: ${hdImageData.length}`);

      const artworkImage = await messageImage.artwork();
      const artworkImageData = await artworkImage.toBuffer();

      log.info(LOGPRE, `get message image, artwork: ${artworkImageData.length}`);

      break;
    }

    case PUPPET.types.Message.Url: {
      const urlLink = await message.toUrlLink();
      log.info(LOGPRE, `get message url: ${JSON.stringify(urlLink)}`);

      const urlThumbImage = await message.toFileBox();
      const urlThumbImageData = await urlThumbImage.toBuffer();

      log.info(LOGPRE, `get message url thumb: ${urlThumbImageData.length}`);

      break;
    }

    case PUPPET.types.Message.MiniProgram: {
      const miniProgram = await message.toMiniProgram();

      log.info(LOGPRE, `MiniProgramPayload: ${JSON.stringify(miniProgram)}`);

      break;
    }
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