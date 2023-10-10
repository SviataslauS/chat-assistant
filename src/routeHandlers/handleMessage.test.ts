/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { handleMessage } from './handleMessage';
import ChatMessage from '../models/ChatMessage';
import logger from '../logger';
import envConfig from '../envConfig';
import openai from '../openai';
const { CHAT_SERVICE_API } = envConfig;

const axiosMock = new MockAdapter(axios);

jest.mock('../openai', () => {
  return {
    __esModule: true,
    default: {
      completions: {
        create: jest.fn(),
      },
    },
  };
});

jest.mock('../models/ChatMessage', () => ({
  create: jest.fn(),
  findAll: jest.fn(),
}));

jest.mock('../logger', () => ({
  error: jest.fn(),
  info: jest.fn(),
}));

const mockedChatMessageCreate = ChatMessage.create as jest.MockedFunction<typeof ChatMessage.create>;
const mockedChatMessageFindAll = ChatMessage.findAll as jest.MockedFunction<typeof ChatMessage.findAll>;
const mockedLoggerError = logger.error as jest.MockedFunction<typeof logger.error>;
// const mockedLoggerError = logger.error as jest.MockedFunction<typeof logger.error>;
// const mockedLoggerInfo = logger.info as jest.MockedFunction<typeof logger.info>;
const mockedOpenaiCompletionsCreate = 
  openai.completions.create as jest.MockedFunction<typeof openai.completions.create>;

const sleep = async (ms: number) : Promise<void> => { await new Promise(resolve => setTimeout(resolve, ms)); };
const originalSetTimeout = setTimeout;

describe('handleMessage', () => {
  afterAll(() => {
  });

  beforeEach(() => {
    axiosMock.onPost(`${CHAT_SERVICE_API}/send`).reply(200);
    mockedOpenaiCompletionsCreate.mockResolvedValue({ choices: [{ text: 'AI reply' }] } as any);
    mockedChatMessageCreate.mockResolvedValue(null);
    mockedChatMessageFindAll.mockResolvedValue([{ message: "test message"} as any]);
  });

  afterEach(() => {
    axiosMock.reset();
    jest.resetAllMocks();
    (global as any).setTimeout = originalSetTimeout;
  });

  it('should handlevalid request calling dependencies synchronously', async () => {
    const setTimeoutMock = jest.fn((callback: () => void) => callback);
    (global as any).setTimeout = setTimeoutMock;
    (openai.completions.create as any).mockResolvedValue({ choices: [] } as any);
    const req = {
      body: {
        message: 'Test message',
        userId: '123',
      },
    } as any;
    const res = {
      sendStatus: jest.fn(),
    } as any;
    
    await handleMessage(req, res);

    expect(mockedChatMessageCreate).toHaveBeenCalledWith({
      message: 'Test message',
      userId: '123',
    });
    expect(setTimeoutMock).toHaveBeenCalled();
    expect(res.sendStatus).toHaveBeenCalledWith(200);
  });

  it('should find all chat messages after timeout', async () => {
    const req = {
      body: {
        message: 'Test message',
        userId: '123',
      },
    } as any;
    const res = {
      sendStatus: jest.fn(),
    } as any;

    jest.useFakeTimers();

    await handleMessage(req, res);

    jest.advanceTimersByTime(40000);
    jest.useRealTimers();

    expect(mockedChatMessageFindAll).toHaveBeenCalledWith({
      where: { userId: '123' },
      attributes: ['message'],
    });
  });

  it('should call openai after timeout', async () => {
    const req = {
      body: {
        message: 'Test message',
        userId: '123',
      },
    } as any;
    const res = {
      sendStatus: jest.fn(),
    } as any;

    jest.useFakeTimers();
  
    await handleMessage(req, res);
    
    jest.advanceTimersByTime(40000);
    jest.useRealTimers();
    
    await sleep(1);

    expect(mockedChatMessageFindAll).toHaveBeenCalledWith({
      where: { userId: '123' },
      attributes: ['message'],
    });
    
    expect(mockedOpenaiCompletionsCreate).toHaveBeenCalledWith({
        "model": "text-davinci-002",
        "prompt": "test message",
      },
      expect.objectContaining({ signal: expect.any(Object) })
    );
  });

  it('should send openai result to chat service', async () => {
    const openaiResultMessage = 'AI reply';
    mockedOpenaiCompletionsCreate.mockResolvedValue({ choices: [{ text: openaiResultMessage }] } as any);
    mockedChatMessageCreate.mockResolvedValue(null);
    mockedChatMessageFindAll.mockResolvedValue([{ message: "test message"} as any]);
    const req = {
      body: {
        message: 'Test message',
        userId: '123',
      },
    } as any;
    const res = {
      sendStatus: jest.fn(),
    } as any;

    jest.useFakeTimers();
  
    await handleMessage(req, res);
    
    jest.advanceTimersByTime(40000);
    jest.useRealTimers();
    await sleep(1);

    expect(axiosMock.history.post.length).toBe(1);
    expect(axiosMock.history.post[0].url).toBe(`${CHAT_SERVICE_API}/send`);
    const expectedData = "{\"side\":\"server\",\"message\":\"AI reply\",\"userId\":\"123\"}";
    expect(axiosMock.history.post[0].data).toBe(expectedData);
  });

  it('should handle error when storing chat message', async () => {
    mockedChatMessageCreate.mockRejectedValue({ message: "db is down" });
    const req = {
      body: {
        message: 'Test message',
        userId: '123',
      },
    } as any;
    const res = {
      sendStatus: jest.fn(),
    } as any;

    jest.useFakeTimers();
  
    await handleMessage(req, res);
    
    jest.advanceTimersByTime(40000);
    jest.useRealTimers();
    await sleep(1);

    expect(mockedLoggerError)
      .toHaveBeenCalledWith("Save client message error:", "db is down");
  });

  it('should handle error when sending request to chat service', async () => {
    axiosMock.onPost(`${CHAT_SERVICE_API}/send`).reply(500);
    const req = {
      body: {
        message: 'Test message',
        userId: '123',
      },
    } as any;
    const res = {
      sendStatus: jest.fn(),
    } as any;

    jest.useFakeTimers();
  
    await handleMessage(req, res);
    
    jest.advanceTimersByTime(40000);
    jest.useRealTimers();
    await sleep(1);

    expect(mockedLoggerError)
      .toHaveBeenCalledWith("Chat service error:", "Request failed with status code 500");
  });

});
