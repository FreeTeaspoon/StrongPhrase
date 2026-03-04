import { getPassphrase } from './passphrase-utils';

const usernameGrammars: Record<number, string> = {
  20: "adj-animal:0| |animal:0| |number:5",
  // 2 concrete words + number
  24: "adj:9| |noun-concrete:9| |number:6",
  // 2 animate words + number
  28: "adj-animate:9| |noun-animate:9| |number:6",
  // // 3 concrete words + number
  // 30: "adj:8| |noun-concrete:8| |verb-s:8| |number:6",
  // // 3 animate words + number
  // 32: "adj-animate:9| |noun-animate:9| |verb-s:9| |number:6",
  // // 3 animate words (double adjective) + number
  // 40: "adj-animate:8| |adj:8| |noun-animate:8| |number:6",
};

export const usernameTypes = Object.keys(usernameGrammars).map(Number);

export const generateUsername = (bits = 20) => {
  // Ensure we use a valid bit length
  const validBits = Object.keys(usernameGrammars).map(Number);
  const closestBits = validBits.reduce((prev, curr) => 
    Math.abs(curr - bits) < Math.abs(prev - bits) ? curr : prev
  );
  
  const rawPassphrase = getPassphrase(closestBits, usernameGrammars, false);
  const components = rawPassphrase
    .split(' ')
    .map(word => word.replace(/[^A-Za-z0-9]/g, ''))
    .map(word => word.toLowerCase());
  
  return {
    username: components.join(''),
    components
  };
};

export const generateUsernames = (count = 5, bits = 20) => {
  return Array(count).fill(null).map(() => generateUsername(bits));
};
