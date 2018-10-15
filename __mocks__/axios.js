var axios = {
  get: jest.fn(() => Promise.resolve({ data: {} })),
  create: jest.fn(function () {return this;} )
};

module.exports = axios;
