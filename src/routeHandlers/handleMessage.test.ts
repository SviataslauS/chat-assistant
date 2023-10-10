/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable @typescript-eslint/ban-ts-comment */
import MockAdapter from 'axios-mock-adapter';
import axios from 'axios';
import { handleMessage } from './handleMessage';
import ChatMessage from '../models/ChatMessage';
import envConfig from '../envConfig';
import logger from '../logger';
import openai from '../openai';

const axiosMock = new MockAdapter(axios);

jest.mock('../models/ChatMessage', () => ({
  findAll: jest.fn(),
  create: jest.fn(),
}));

type ReturnJestFnType = ReturnType<typeof jest.fn>
jest.mock('../logger', () => {
  return {
    __esModule: true,
    default: {
      error: jest.fn(),
      info: jest.fn(),
    },
  };
});

jest.mock('../openai', () => {
  return {
    __esModule: true,
    default: {
      completions: jest.fn(),
    },
  };
});
function getOpenaiCompletions (): ReturnJestFnType {
  return openai.completions as unknown as ReturnJestFnType;
}
const openaiMock = getOpenaiCompletions();

describe('handleMessage', () => {
  afterEach(() => {
    axiosMock.reset();
    jest.clearAllMocks();
  });

  it('should handle a valid request and send a response to the chat service', async () => {
    axiosMock.onPost(`${envConfig.CHAT_SERVICE_API}/send`).reply(200);
    // @ts-expect-error
    ChatMessage.findAll.mockResolvedValue([]);
    // @ts-expect-error
    ChatMessage.create.mockResolvedValue({});

    const req = {
      body: {
        message: 'Test message',
        userId: '123',
      },
    };

    const res = {
      sendStatus: jest.fn(),
    };

    // @ts-expect-error
    await handleMessage(req, res);

    expect(res.sendStatus).toHaveBeenCalledWith(200);
    expect(ChatMessage.findAll).toHaveBeenCalledWith({
      where: { userId: '123' },
      attributes: ['message'],
    });
    expect(axiosMock.history.post.length).toBe(1);
    expect(axiosMock.history.post[0].data).toEqual({
      side: 'server',
      message: expect.any(String),
      userId: '123',
    });
  });
  it('should handle a valid request and send a message to the chat service', async () => {
    axiosMock.onPost(`${envConfig.CHAT_SERVICE_API}/send`).reply(200);

    const req = {
      body: {
        message: 'Test message',
        userId: '123',
      },
    };

    const res = {
      sendStatus: jest.fn(),
    };

    const createSpy = jest.spyOn(ChatMessage, 'create').mockResolvedValueOnce({});

    // @ts-expect-error:
    await handleMessage(req, res);

    expect(res.sendStatus).toHaveBeenCalledWith(200);
    expect(createSpy).toHaveBeenCalledWith({
      message: 'Test message',
      userId: '123',
    });
    expect(logger.error).not.toHaveBeenCalled();
  });

  it('should handle an error when saving the client message', async () => {
    const req = {
      body: {
        message: 'Test message',
        userId: '123',
      },
    };

    const res = {
      sendStatus: jest.fn(),
    };

    const createSpy = jest
      .spyOn(ChatMessage, 'create')
      .mockRejectedValueOnce(new Error('DB Error'));

    // @ts-expect-error:
    await handleMessage(req, res);

    expect(res.sendStatus).toHaveBeenCalledWith(200);
    expect(createSpy).toHaveBeenCalledWith({
      message: 'Test message',
      userId: '123',
    });
    expect(logger.error).toHaveBeenCalledWith('Save client message error:', 'DB Error');
  });

  it('should handle a valid request but receive an empty AI response', async () => {
    axiosMock.onPost(`${envConfig.CHAT_SERVICE_API}/send`).reply(200);

    const req = {
      body: {
        message: 'Test message',
        userId: '123',
      },
    } as unknown as Response;;

    const res = {
      sendStatus: jest.fn(),
    };

    const createSpy = jest.spyOn(ChatMessage, 'create').mockResolvedValueOnce({});
    openaiMock.mockResolvedValueOnce({ choices: [] } as unknown as never);

    try {
      // @ts-expect-error:
      await handleMessage(req, res);
    } catch (error) {
      
    }

    expect(res.sendStatus).toHaveBeenCalledWith(200);
    expect(createSpy).toHaveBeenCalledWith({
      message: 'Test message',
      userId: '123',
    });
    // expect(logger.info).toHaveBeenCalledWith(
    //   expect.stringContaining('Empty AI response. Request body:'),
    // );
    expect(openaiMock).toHaveBeenCalled();
  });

  it('should handle a request and send an AI response to the chat service', async () => {
    axiosMock.onPost(`${envConfig.CHAT_SERVICE_API}/send`).reply(200);

    const req = {
      body: {
        message: 'Test message',
        userId: '123',
      },
    };

    const res = {
      sendStatus: jest.fn(),
    };

    const createSpy = jest.spyOn(ChatMessage, 'create').mockResolvedValueOnce({});
    const openaiMock = jest
      .spyOn(require('../openai'), 'completions')
      .mockResolvedValueOnce({ choices: [{ text: 'AI reply' }] });

    // @ts-expect-error:
    await handleMessage(req, res);

    expect(res.sendStatus).toHaveBeenCalledWith(200);
    expect(createSpy).toHaveBeenCalledWith({
      message: 'Test message',
      userId: '123',
    });
    expect(logger.info).not.toHaveBeenCalledWith(
      expect.stringContaining('Empty AI response. Request body:'),
    );
    expect(openaiMock).toHaveBeenCalledWith(
      {
        model: 'text-davinci-002',
        prompt: 'Test message',
      },
      expect.anything(),
    );
  });

  it('should handle an error when sending a request to the chat service', async () => {
    axiosMock.onPost(`${envConfig.CHAT_SERVICE_API}/send`).reply(500);
    const createSpy = jest.spyOn(ChatMessage, 'create').mockResolvedValueOnce({});
    const openaiMock = jest
      .spyOn(require('../openai'), 'completions')
      .mockResolvedValueOnce({ choices: [{ text: 'AI reply' }] });

    const req = {
      body: {
        message: 'Test message',
        userId: '123',
      },
    } as unknown as Request;

    const res = {
      sendStatus: jest.fn(),
    };
  
    // @ts-expect-error:
    await handleMessage(req, res);

    expect(res.sendStatus).toHaveBeenCalledWith(200);
    expect(createSpy).toHaveBeenCalledWith({
      message: 'Test message',
      userId: '123',
    });
    expect(logger.error).toHaveBeenCalledWith('Chat service error:', expect.any(String));
    expect(openaiMock).toHaveBeenCalledWith(
      {
        model: 'text-davinci-002',
        prompt: 'Test message',
      },
      expect.anything(),
    );
  });

});
