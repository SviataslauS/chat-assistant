/* eslint-disable @typescript-eslint/strict-boolean-expressions */
/* eslint-disable @typescript-eslint/no-dynamic-delete */
import { type Request, type Response } from 'express';
import openai from '../openai';
import ChatMessage from '../models/ChatMessage';
import { config } from '../config';
import logger from '../logger';
import axios from 'axios';

const SIDE_SERVER = 'server';
const AI_MODEL_NAME = 'text-davinci-002';
const AI_REQ_TIMEOUT = 40000; // 40sec
const CHAT_SERVICE_HOOK_URL = `${config.CHAT_SERVICE_API}/send`;

const aiControllersByUser: Record<string, AbortController> = {};
const timeoutIdsByUser: Record<string, NodeJS.Timeout> = {};

type ChatMessageCreateType = typeof ChatMessage.create;
type SaveClientMessageType = (message: string, userId: string) => Promise<ReturnType<ChatMessageCreateType>>;
const saveClientMessage: SaveClientMessageType = 
  async (message, userId) => await ChatMessage.create({ message, userId });

export async function handleMessage(req: Request, res: Response): Promise<void> {
    const { message, userId } = req.body as Record<string, string>;
    if (timeoutIdsByUser[userId]) {
      clearTimeout(timeoutIdsByUser[userId]);
      delete timeoutIdsByUser[userId];
    }

    if (aiControllersByUser[userId]) {
      aiControllersByUser[userId].abort();
      delete aiControllersByUser[userId];
    }

    try {
      await saveClientMessage(message, userId);
    } catch (error) {
      logger.error('Save client message error:', error.message);
    }

    const sendReqToAI = async (): Promise<void> => {
      const clientMessages = await ChatMessage.findAll({
        where: { userId },
        attributes: ['message'],
      });

      const combinedMessage = clientMessages.map((msg) => msg.message).join(' ');
      const controller = new AbortController();
      aiControllersByUser[userId] = controller;
      const aiResponse = await openai.completions.create({
        model: AI_MODEL_NAME,
        prompt: combinedMessage,
      }, { signal: controller.signal });

      const aiReply = aiResponse.choices[0]?.text;
      if(!aiReply){
        logger.info(`Empty AI response. Request body: ${JSON.stringify(req.body)}; combinedMessage: ${combinedMessage}`);
      }

      const data = {
        side: SIDE_SERVER,
        message: aiReply,
        userId,
      };
      try {
        await axios.post(CHAT_SERVICE_HOOK_URL, data);
      } catch (error) {
        logger.error('Chat service error:', (error as Error).message);
      }
    };
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    timeoutIdsByUser[userId] = setTimeout(sendReqToAI, AI_REQ_TIMEOUT);
    
    res.sendStatus(200);
}


