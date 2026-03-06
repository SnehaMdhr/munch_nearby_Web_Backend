const sendMailMock = jest.fn().mockResolvedValue(true);

export const createTransport = jest.fn(() => ({
  sendMail: sendMailMock,
}));

export default {
  createTransport,
};
