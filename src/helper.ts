import { log, Message } from 'wechaty';
import * as PUPPET from 'wechaty-puppet';
import fs from 'fs';
import path from 'path';
import moment from 'moment';

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
      createDirectoryRecursively(path.resolve(__dirname, `../data/${today}`));
      const filePath = path.resolve(__dirname, `../data/${today}/${roomName}.txt`);
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
