// __mocks__/express-validator.js

const chainableFn = () => {
  const fn = jest.fn().mockReturnThis();
  fn.isLength = jest.fn().mockReturnThis();
  fn.isEmail = jest.fn().mockReturnThis();
  fn.isIn = jest.fn().mockReturnThis();
  fn.withMessage = jest.fn().mockReturnThis();
  fn.notEmpty = jest.fn().mockReturnThis();
  fn.optional = jest.fn().mockReturnThis();
  return fn;
};

module.exports = {
  body: chainableFn(),
  validationResult: jest.fn(),
};
