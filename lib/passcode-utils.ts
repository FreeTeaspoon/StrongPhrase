import { filteredPasscodes } from './filtered-passcodes-six';

const calculateEntropy = (numDigits: number, filteredPasscodesLength: number) => {
  let totalPossiblePasscodes = 10 ** numDigits;
  
  if (numDigits === 6) {
    totalPossiblePasscodes -= filteredPasscodesLength;
  }

  return Math.log2(totalPossiblePasscodes);
};

export const getPasscodeAndEntropy = (numDigits: number) => {
  const passcode = generateSecurePasscode(numDigits) || '';
  const entropy = calculateEntropy(numDigits, filteredPasscodes.length) || 0;

  const result = {
    passcode,
    entropy,
  };

  return result;
};

export const generateSecurePasscode = (numDigits: number) => {
  if (!cryptoAvailable()) {
    return "Error: Your browser does not support secure cryptographic operations.";
  }

  if (numDigits <= 0) {
    return "Error: Number of digits must be greater than zero.";
  }

  let passcode;
  let needToContinue;
  if(numDigits === 6) {
    do {
      passcode = generateRandomPasscode(numDigits);
      needToContinue = filteredPasscodes.includes(passcode);
      if(needToContinue) {
        console.log('Skipping a filtered 6-digit passcode: ', passcode);
      }
    } while (needToContinue);
  } else {
    passcode = generateRandomPasscode(numDigits);
  }

  return passcode;
};

const generateRandomPasscode = (numDigits: number) => {
  let randomValues = new Uint8Array(numDigits);
  const cryptoObj = typeof window !== 'undefined' ? (window.crypto) : undefined;
  if (cryptoObj) {
    cryptoObj.getRandomValues(randomValues);
  }
  let passcode = "";

  for (let i = 0; i < numDigits; i++) {
    passcode += (randomValues[i] % 10).toString();
  }

  return passcode;
};

const cryptoAvailable = function() {
  var crypto = typeof window !== 'undefined' ? (window.crypto) : undefined;
  var typedArr = Uint16Array;
  return (typedArr && crypto && typeof crypto.getRandomValues == "function");
};
