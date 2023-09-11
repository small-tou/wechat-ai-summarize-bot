import fs from 'fs';
import axios from 'axios';
import dotenv from 'dotenv';
import { exec } from 'child_process';
import { convert2img } from 'yutou_cn_mdimg';
import { tts } from './tts';
import { uniq } from 'lodash';
import moment from 'moment';

dotenv.config();

/**
 * The API key for accessing the Dify.ai API.
 */
const apiKey = process.env.DIFY_API_KEY;

/**
 * The file path of the text file to be summarized.
 */
const filePath = process.argv[2];

if (!filePath) {
  console.log('Please provide a file path.');
  process.exit(1);
}
if (!fs.existsSync(filePath)) {
  console.log('The file path provided does not exist.');
  process.exit(1);
}

/**
 * The content of the text file to be summarized.
 */
const fileContent = fs.readFileSync(filePath, 'utf-8');

/**
 * The raw data to be sent to the Dify.ai API.
 */
const raw = JSON.stringify({
  inputs: {},
  query: `<input>${fileContent.slice(-58000)}</input>`,
  response_mode: 'blocking',
  user: 'abc-123',
});

function getChatInfoForDate(date: string, chatName: string) {
  const filePath = `./data/${date}/${chatName}.txt`;
  if (!fs.existsSync(filePath)) {
    return false;
  } else {
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const chats = fileContent.split(/\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}:\n/).filter((item) => item);
    // 对话数量
    const chatCount = chats.length;
    // 参与人
    const chatMembers = uniq(chats.map((item) => {
      return item.split('\n')[0];
    }));

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
const run = async () => {
  console.log('Summarizing...\n');

  try {
    /**
     * The summarized text returned by the Dify.ai API.
     */
    const fileName = filePath.split('/').pop();
    const fileNameWithoutExt = fileName?.replace('.txt', '');
    const date = filePath.split('/').splice(-2, 1)[0];

    const chatInfo = getChatInfoForDate(date, fileNameWithoutExt);
    const chatInfoDayOnDay = getChatInfoDayOnDay(date, fileNameWithoutExt);

    const res = await axios.post('https://api.dify.ai/v1/completion-messages', raw, {
      headers: {
        Authorization: 'Bearer ' + apiKey,
        'Content-Type': 'application/json',
      },
    });

    const todayInfo  = (chatInfo ? `今日整体情况 \n👥参与人数：${chatInfo?.chatMembersCount}，📝对话数量：${chatInfo?.chatCount}，📝对话字数：${chatInfo?.chatLetters}\n` : '') +
      (chatInfoDayOnDay ? `较昨日对比 \n👥参与人数：${getDayOnDayDisplay(chatInfoDayOnDay?.chatMembersCount)}，📝对话数量：${getDayOnDayDisplay(chatInfoDayOnDay?.chatCount)}，📝对话字数：${getDayOnDayDisplay(chatInfoDayOnDay?.chatLetters)}\n\n` : '')

    const result =
      `### 【${fileNameWithoutExt}】的群聊总结 ${date}\n\n------------\n\n\`\`\`\n` +
      todayInfo +
      res.data.answer.replace(/\n\n/g, '\n').trim() +
      '\n```\n\n------------\n\n❤️本总结由开源项目智囊AI生成 wx.zhinang.ai';

    console.log(result);

    const summarizedFilePath = filePath.replace('.txt', '_summarized.txt');
    // save to file in folder
    fs.writeFileSync(summarizedFilePath, result);

    // 执行命令
    const convertRes = await convert2img({
      mdFile: summarizedFilePath,
      outputFilename: filePath.replace('.txt', '_summarized.png'),
      width: 450,
      cssTemplate: 'githubDark',
    });

    console.log(`Convert to image successfully!`);

    if (process.env.AZURE_TTS_APPKEY) {
      const resultForTTS =
        `${fileNameWithoutExt}的群聊总结 ${date}` +
        res.data.answer.replace(/\n\n/g, '\n').trim() +
        '❤️本总结由开源项目智囊AI生成 wx.zhinang.ai';

      console.log(`Start to convert to audio!`);
      await tts(summarizedFilePath, resultForTTS);
      console.log(`Convert to audio successfully!`);
    }
    console.log('Done!');

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
  }
};
run();
