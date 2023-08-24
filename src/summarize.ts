import fs from 'fs';
import axios from 'axios';
import dotenv from 'dotenv';
import { exec } from 'child_process';
import { convert2img } from 'yutou_cn_mdimg';

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
  query: `<input>${fileContent.slice(-80000)}</input>`,
  response_mode: 'blocking',
  user: 'abc-123',
});

/**
 * Sends a request to the Dify.ai API to summarize the text file.
 */
const run = async () => {
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
    const fileName = filePath.split('/').pop();
    const date = filePath.split('/').splice(-2, 1)[0];
    const result =
      `【${fileName.replace('.txt', '')}】的群聊总结 ${date}\n\n------------\n\n\`\`\`\n` +
      res.data.answer.replace(/\n\n/g, '\n').trim() +
      '\n```\n\n------------\n\n❤️本总结由 wx.zhinang.ai 生成。';

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
