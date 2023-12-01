import axios from 'axios';
import { getConfig } from './config';

export const requestLLama = async (prompt: string) => {
  /**
   * curl -X 'POST' \
   *   'http://localhost:3001/v1/chat/completions' \
   *   -H 'accept: application/json' \
   *   -H 'Content-Type: application/json' \
   *   -d '{
   *   "messages": [
   *     {
   *       "content": "You are a helpful assistant.",
   *       "role": "system"
   *     },
   *     {
   *       "content": "What is the capital of France?",
   *       "role": "user"
   *     }
   *   ]
   * }'
   */
  const raw = JSON.stringify({
    prompt: prompt,
    max_tokens: 4000,
    temperature: 0.7,
  });

  const res = await axios.post('http://localhost:8003/completion', raw, {
    headers: {
      accept: 'application/json',
      'Content-Type': 'application/json',
    },
  });

  console.log(res);

  return res.data.content as string;
};

export async function gptRequest(messages: { role: string; content: string }[]) {
  const config = getConfig();
  const res = await axios.post(
    // 'http://ce',
    `${config.AZURE_ENDPOINT}/chat/completions?api-version=${config.AZURE_API_VERSION}`,
    {
      model: config.AZURE_MODEL_ID,
      messages: messages,
      temperature: 0,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0,
    },
    {
      headers: {
        'api-key': config.AZURE_API_KEY,
      },
      timeout: 100000,
    }
  );
  return res.data.choices[0].message.content;
}
