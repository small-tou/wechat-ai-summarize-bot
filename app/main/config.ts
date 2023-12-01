import { app } from 'electron';
import path from 'path';
import fs from 'fs';

type ConfigKeys =
  | 'DIFY_API_KEY'
  | 'PADLOCAL_API_KEY'
  | 'AZURE_TTS_APPKEY'
  | 'AZURE_TTS_REGION'
  | 'CUT_LENGTH'
  | 'LAST_MESSAGE'
  | 'AUTO_ACCEPT_FRIEND'
  | 'AZURE_TTS_VOICE_NAME'
  | 'ENABLE_AUTO_REPLY'
  | 'AZURE_ENDPOINT'
  | 'AZURE_API_VERSION'
  | 'AZURE_API_KEY'
  | 'AZURE_MODEL_ID'
  | 'AZURE_REPLY_KEYWORDS'
  | 'AZURE_REPLY_LIMIT';

const CONFIG_FILE = path.join(app.getPath('userData'), './config.json');

if (!fs.existsSync(CONFIG_FILE)) {
  fs.writeFileSync(CONFIG_FILE, JSON.stringify({}));
}

export function getConfig(): Record<ConfigKeys, any> {
  const file = fs.readFileSync(CONFIG_FILE, 'utf-8').toString();
  const config = JSON.parse(file);
  if (!config.AZURE_REPLY_KEYWORDS) {
    config.AZURE_REPLY_KEYWORDS = '智囊 zhinang';
  }
  if (typeof config.ENABLE_AUTO_REPLY == undefined) {
    config.ENABLE_AUTO_REPLY = false;
  }
  if (!config.CUT_LENGTH) {
    config.CUT_LENGTH = 10000;
  }
  if (!config.AZURE_MODEL_ID) {
    config.AZURE_MODEL_ID = 'gpt-3.5-turbo';
  }
  if (!config.LAST_MESSAGE) {
    config.LAST_MESSAGE = '由免费、快捷、智能的 https://zhinang.ai 『智囊 AI』技术支持';
  }
  if (!config.AZURE_TTS_VOICE_NAME) {
    config.AZURE_TTS_VOICE_NAME = 'zh-CN-XiaoxiaoNeural';
  }
  if (!config.AZURE_REPLY_LIMIT) {
    config.AZURE_REPLY_LIMIT = 10;
  }
  return config;
}

export function setConfig(config: Record<ConfigKeys, any>) {
  const _config = getConfig();
  config = Object.assign(_config, config);
  fs.writeFileSync(CONFIG_FILE, JSON.stringify(config));
}

export function checkConfig() {
  const config = getConfig();
  const mustKeys = ['DIFY_API_KEY', 'PADLOCAL_API_KEY'];
  const missKeys = [];
  for (let key of mustKeys) {
    if (!config[key]) {
      missKeys.push(key);
    }
  }
  return missKeys;
}

export function checkConfigIsOk() {
  const missKeys = checkConfig();
  return missKeys.length === 0;
}
