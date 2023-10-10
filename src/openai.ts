import OpenAI from 'openai';
import envConfig from './envConfig';

const openai = new OpenAI({ apiKey: envConfig.OPENAI_API_KEY });

export default openai;
