import fs from 'fs';
import axios from 'axios';
import dotenv from 'dotenv';

import { tts } from './tts';
import { uniq } from 'lodash';
import moment from 'moment';
import EventEmitter from 'eventemitter3';
import path from 'path';
import { BASE_PATH } from './util';
import { getConfig } from './config';
import mdimg from './mdimg/lib/mdimg.mjs';

const convert2img = mdimg.convert2img;
dotenv.config();

/**
 * The API key for accessing the Dify.ai API.
 */

function getChatInfoForDate(date: string, chatName: string) {
  const filePath = path.join(BASE_PATH, date, chatName + '.txt');
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

function getChatInfoDayOnDay(date: string, chatName: string) {
  const todayInfo = getChatInfoForDate(date, chatName);
  let yesterday = moment(date).subtract(1, 'days').format('YYYY-MM-DD');
  let yesterdayInfo = getChatInfoForDate(yesterday, chatName);
  let loopCount = 0;
  while (!yesterdayInfo && loopCount < 10) {
    yesterday = moment(yesterday).subtract(1, 'days').format('YYYY-MM-DD');
    console.log(yesterday);
    yesterdayInfo = getChatInfoForDate(yesterday, chatName);
    loopCount++;
  }
  if (!todayInfo || !yesterdayInfo) {
    return false;
  }
  return {
    chatCount: todayInfo.chatCount - yesterdayInfo.chatCount,
    chatMembersCount: todayInfo.chatMembersCount - yesterdayInfo.chatMembersCount,
    chatLetters: todayInfo.chatLetters - yesterdayInfo.chatLetters,
  };
}

function getDayOnDayDisplay(num: number) {
  if (num > 0) {
    return `↑${num}`;
  } else if (num < 0) {
    return `↓${Math.abs(num)}`;
  } else {
    return `→${num}`;
  }
}

/**
 * Sends a request to the Dify.ai API to summarize the text file.
 */
export const summarize = (filePath: string) => {
  console.log('prepare summarize:', filePath);

  const event = new EventEmitter<{
    update: (info: string) => void;
    end: () => void;
  }>();

  async function _summarize() {
    try {
      console.log('Summarizing...\n');
      const apiKey = getConfig().DIFY_API_KEY;
      /**
       * The file path of the text file to be summarized.
       */

      if (!filePath) {
        console.log('Please provide a file path.');
        throw new Error('Please provide a file path.');
      }
      if (!fs.existsSync(filePath)) {
        console.log('The file path provided does not exist.');
        throw new Error('The file path provided does not exist.');
      }

      /**
       * The content of the text file to be summarized.
       */
      const fileContent = fs.readFileSync(filePath, 'utf-8');

      console.log('getConfig()', getConfig());
      /**
       * The raw data to be sent to the Dify.ai API.
       */
      const raw = JSON.stringify({
        inputs: {
          input_content: `${fileContent.slice(getConfig().CUT_LENGTH ? -1 * Number(getConfig().CUT_LENGTH) : 10000)}`,
        },
        response_mode: 'blocking',
        user: 'abc-123',
      });
      /**
       * The summarized text returned by the Dify.ai API.
       */
      const fileName = filePath.split('/').pop();
      const fileNameWithoutExt = fileName?.replace('.txt', '');
      const date = filePath.split('/').splice(-2, 1)[0];

      const chatInfo = getChatInfoForDate(date, fileNameWithoutExt);
      const chatInfoDayOnDay = getChatInfoDayOnDay(date, fileNameWithoutExt);

      event.emit('update', `开始文本总结`);

      console.log('Sending request to Dify.ai API...\n', raw);
      const res = await axios.post('https://api.dify.ai/v1/completion-messages', raw, {
        headers: {
          Authorization: 'Bearer ' + apiKey,
          'Content-Type': 'application/json',
        },
      });

      const todayInfo =
        (chatInfo
          ? `今日整体情况 \n👥参与人数：${chatInfo?.chatMembersCount}，📝对话数量：${chatInfo?.chatCount}，📝对话字数：${chatInfo?.chatLetters}\n`
          : '') +
        (chatInfoDayOnDay
          ? `较昨日对比 \n👥参与人数：${getDayOnDayDisplay(
              chatInfoDayOnDay?.chatMembersCount
            )}，📝对话数量：${getDayOnDayDisplay(chatInfoDayOnDay?.chatCount)}，📝对话字数：${getDayOnDayDisplay(
              chatInfoDayOnDay?.chatLetters
            )}\n\n`
          : '');

      const result =
        `### 【${fileNameWithoutExt}】的群聊总结 ${date}\n\n------------\n\n\`\`\`\n` +
        todayInfo +
        res.data.answer.replace(/\n\n/g, '\n').trim() +
        '\n```\n\n------------\n\n❤️本总结由开源项目智囊AI生成 wx.zhinang.ai';

      event.emit('update', `已完成文本总结`);

      event.emit('update', `开始生成总结图片`);
      const summarizedFilePath = filePath.replace('.txt', ' 的今日群聊总结.txt');
      // save to file in folder
      fs.writeFileSync(summarizedFilePath, result);

      //@ts-ignore
      const convertRes = await convert2img({
        mdFile: summarizedFilePath,
        outputFilename: filePath.replace('.txt', ' 的今日群聊总结.png'),
        width: 450,
        cssTemplate: 'githubDark',
      });

      console.log(`Convert to image successfully!`);
      event.emit('update', `图片生成成功`);

      if (process.env.AZURE_TTS_APPKEY) {
        event.emit('update', `开始生成总结语音`);
        const resultForTTS =
          `${fileNameWithoutExt}的群聊总结 ${date}` +
          res.data.answer.replace(/\n\n/g, '\n').trim() +
          '❤️本总结由开源项目智囊AI生成 wx.zhinang.ai';

        console.log(`Start to convert to audio!`);
        await tts(summarizedFilePath, resultForTTS);
        console.log(`Convert to audio successfully!`);
        event.emit('update', `音频生成成功`);
      }
      console.log('Done!');
      event.emit('update', `总结结束`);
      event.emit('end');
      // const cmdStr = `npx carbon-now-cli '${filePath.replace('.txt', '_summarized.txt')}'`;
      // exec(cmdStr, (err, stdout, stderr) => {
      //   if (err) {
      //     console.log(err);
      //   }
      //   console.log(stdout);
      //   console.log(stderr);
      // });
    } catch (e: any) {
      console.error('Error:' + e.message);
      event.emit('update', `总结失败：${e.message}`);
    }
  }

  setTimeout(() => {
    _summarize();
  }, 1000);
  return event;
};
