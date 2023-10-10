/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { handleMessage } from './handleMessage';
import ChatMessage from '../models/ChatMessage';
import logger from '../logger';

const axiosMock = new MockAdapter(axios);

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
const mockedLoggerInfo = logger.info as jest.MockedFunction<typeof logger.info>;

describe('handleMessage', () => {
  beforeEach(() => {
    axiosMock.reset();
    mockedChatMessageCreate.mockReset();
    mockedChatMessageFindAll.mockReset();
    mockedLoggerError.mockReset();
    mockedLoggerInfo.mockReset();
  });

  it('should handle a valid request', async () => {
    axiosMock.onPost('https://server.com/send').reply(200);

    mockedChatMessageCreate.mockResolvedValue(null);
    mockedChatMessageFindAll.mockResolvedValue([]);

    const req = {
      body: {
        message: 'Test message',
        userId: '123',
      },
    };

    const res = {
      sendStatus: jest.fn(),
    };

    await handleMessage(req as any, res as any);

    expect(res.sendStatus).toHaveBeenCalledWith(200);
    expect(mockedChatMessageCreate).toHaveBeenCalledWith({
      message: 'Test message',
      userId: '123',
    });
    expect(mockedChatMessageFindAll).toHaveBeenCalledWith({
      where: { userId: '123' },
      attributes: ['message'],
    });
  });

  it('should handle an error when sending a request to the chat service', async () => {
    axiosMock.onPost('https://server.com/send').reply(500);

    mockedChatMessageCreate.mockResolvedValue(null);
    mockedChatMessageFindAll.mockResolvedValue([]);

    const req = {
      body: {
        message: 'Test message',
        userId: '123',
      },
    };

    const res = {
      sendStatus: jest.fn(),
    };

    await handleMessage(req as any, res as any);

    expect(res.sendStatus).toHaveBeenCalledWith(200);
    expect(mockedChatMessageCreate).toHaveBeenCalledWith({
      message: 'Test message',
      userId: '123',
    });
    expect(mockedChatMessageFindAll).toHaveBeenCalledWith({
      where: { userId: '123' },
      attributes: ['message'],
    });
    expect(mockedLoggerError).toHaveBeenCalledWith(expect.any(String));
  });

  it('should handle a valid request and execute setTimeout', async () => {
    axiosMock.onPost('https://server.com/send').reply(200);

    mockedChatMessageCreate.mockResolvedValue(null);
    mockedChatMessageFindAll.mockResolvedValue([]);

    const req = {
      body: {
        message: 'Test message',
        userId: '123',
      },
    };

    const res = {
      sendStatus: jest.fn(),
    };

    const originalSetTimeout = setTimeout;
    (global as any).setTimeout = jest.fn((callback: () => void) => callback);

    await handleMessage(req as any, res as any);

    expect(res.sendStatus).toHaveBeenCalledWith(200);
    expect(mockedChatMessageCreate).toHaveBeenCalledWith({
      message: 'Test message',
      userId: '123',
    });
    expect(mockedChatMessageFindAll).toHaveBeenCalledWith({
      where: { userId: '123' },
      attributes: ['message'],
    });

    (global as any).setTimeout = originalSetTimeout;
  });
});
