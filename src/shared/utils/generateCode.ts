import { randomInt } from 'node:crypto';

const generateCode = (): string => {
  const code = randomInt(0, 1000000);
  return code.toString().padStart(6, '0');
};

export { generateCode };
