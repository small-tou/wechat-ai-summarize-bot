import { app } from 'electron';
import path from 'path';
import fs from 'fs';


type ConfigKeys = 'DIFY_API_KEY'|'PADLOCAL_API_KEY'|'AZURE_TTS_APPKEY'|'AZURE_TTS_REGION';

const CONFIG_FILE = path.join(app.getPath('userData'),'./config.json');

if(!fs.existsSync(CONFIG_FILE)){
  fs.writeFileSync(CONFIG_FILE,JSON.stringify({}));
}
export function getConfig():Record<ConfigKeys, any>{

   const file =  fs.readFileSync(CONFIG_FILE,'utf-8').toString();
    return JSON.parse(file);
}

export function setConfig(config:Record<ConfigKeys, any>){
  const _config = getConfig();
  config = Object.assign(_config,config);
  fs.writeFileSync(CONFIG_FILE,JSON.stringify(config));
}

export function checkConfig(){
  const config = getConfig();
  const mustKeys = ['DIFY_API_KEY','PADLOCAL_API_KEY'];
  const missKeys = [];
  for(let key of mustKeys){
    if(!config[key]){
      missKeys.push(key);
    }
  }
  return missKeys;
}

export function checkConfigIsOk(){
  const missKeys = checkConfig();
  return missKeys.length === 0;
}