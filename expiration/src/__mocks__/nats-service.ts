export const natsService = {
  client: {
    publish: jest
      .fn()
      .mockImplementation(
        (clusterId: string, clientId: string, callback: () => void) => {
          callback();
        }
      ),
  },
};
