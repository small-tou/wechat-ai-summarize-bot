import * as sdk from 'microsoft-cognitiveservices-speech-sdk';
import fs from 'fs';
import dotenv from 'dotenv';

export async function tts(filePath) {
  return new Promise((resolve, reject) => {
    const filename = filePath.replace('.txt', '.mp3');
    const textFileName = filePath.replace('.txt', '.txt');
    const speechConfig = sdk.SpeechConfig.fromSubscription(
      process.env.AZURE_TTS_APPKEY!,
      process.env.AZURE_TTS_REGION!,
    );
    const audioConfig = sdk.AudioConfig.fromAudioFileOutput(filename);
    speechConfig.speechSynthesisVoiceName = 'zh-CN-XiaoshuangNeural';
    speechConfig.speechSynthesisOutputFormat = sdk.SpeechSynthesisOutputFormat.Audio16Khz32KBitRateMonoMp3;

    const synthesizer = new sdk.SpeechSynthesizer(speechConfig, audioConfig);


    synthesizer.SynthesisCanceled = function (s, e) {
      var cancellationDetails = sdk.CancellationDetails.fromResult(e.result);
      var str = '(cancel) Reason: ' + sdk.CancellationReason[cancellationDetails.reason];
      if (cancellationDetails.reason === sdk.CancellationReason.Error) {
        str += ': ' + e.result.errorDetails;
      }
      console.log(str);
    };

    const text = fs.readFileSync(textFileName, 'utf8');
    synthesizer.speakTextAsync(
      text.replace('### 【', '').replace('------------', '').replace('```', ''),
      function (result) {
        synthesizer.close();
        resolve(result);
      },
      function (err) {
        console.trace('err - ' + err);
        synthesizer.close();
        reject(err);
      },
    );
  });
}
 