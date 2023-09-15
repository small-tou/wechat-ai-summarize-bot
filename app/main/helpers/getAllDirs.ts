import path from 'path';
import fs from 'fs';
import { uniq } from 'lodash';
import { BASE_PATH, getData } from '../util';

function getChatInfoForDate(date: string, chatName: string) {
  const filePath = path.join(BASE_PATH, `${date}/${chatName}.txt`);
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

export const getAllDirs = () => {
  // 获取 ../data 目录下的所有文件夹
  const dir = path.join(BASE_PATH);
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
            ...getData(_path, file.replace('.txt', '')),
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

  return dirs;
};
