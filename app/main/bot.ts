import { log, WechatyBuilder } from 'wechaty';
import { PuppetPadlocal } from 'wechaty-puppet-padlocal';
import { getMessagePayload, LOGPRE } from './helper';
import dotenv from 'dotenv';

dotenv.config();

const apiKey = process.env.DIFY_API_KEY;

const puppet = new PuppetPadlocal({
  token: process.env.PADLOCAL_API_KEY,
});


const bot = WechatyBuilder.build({
  name: 'PadLocalDemo',
  puppet,
});
bot
  .on('message', async (message) => {
    log.info(LOGPRE, `on message: ${message.toString()}`);

    await getMessagePayload(message);

    // await dingDongBot(message);
  });


export default bot;
