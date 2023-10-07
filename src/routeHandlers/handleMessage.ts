import { Request, Response, NextFunction } from 'express';
import openai from '../openai';
import ChatMessage from '../models/ChatMessage';
import { config } from '../config';
import logger from '../logger';
import axios from 'axios';

const SIDE_SERVER = 'server';
const AI_MODEL_NAME = 'text-davinci-002';
const AI_REQ_TIMEOUT = 40000; // 40sec
const CHAT_SERVICE_HOOK_URL = `${config.CHAT_SERVICE_API}/send`;

const aiRequestsByUser = {};
const timeoutIdByUser = {};

const saveClientMessage = (message: string, userId: string) => 
    ChatMessage.create({ message, userId });

export async function handleMessage(req: Request, res: Response) {
    const { message, userId, id } = req.body;
    if (timeoutIdByUser[userId]) {
      removeTimeout(userId);
    }

    if (aiRequestsByUser[userId]) {
      // aiRequestsByUser[userId].abort();
      delete aiRequestsByUser[userId];
    }

    await saveClientMessage(message, userId);

    const sendReqToAI = async () => {
      const clientMessages = await ChatMessage.findAll({
        where: { userId },
        attributes: ['message'],
      });

      removeTimeout(userId);
      
      const combinedMessage = clientMessages.map((msg) => msg.message).join(' ');
      const openaiReq = openai.completions.create({
        model: AI_MODEL_NAME,
        prompt: combinedMessage,
      });
      aiRequestsByUser[userId] = openaiReq;

      const aiResponse = await openaiReq;
      const aiReply = aiResponse.choices[0]?.text;
      if(!aiReply){
        logger.info(`Empty AI response. Request body: ${JSON.stringify(req.body)}; combinedMessage: ${combinedMessage}`);
      }

      const data = {
        id,
        side: SIDE_SERVER,
        message: aiReply,
        userId,
      };
      axios.post(CHAT_SERVICE_HOOK_URL, data)

    };
    const timeoutId = setTimeout(sendReqToAI, AI_REQ_TIMEOUT);
    timeoutIdByUser[userId] = timeoutId;
    
    res.sendStatus(200);
}

function removeTimeout(userId: string): void {
  clearTimeout(timeoutIdByUser[userId]);
  delete timeoutIdByUser[userId];
}

