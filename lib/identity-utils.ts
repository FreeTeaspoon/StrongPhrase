import { faker } from '@faker-js/faker';
import { generateUsername, usernameTypes } from './username-generator';
import { generateAvatar } from './avatar-utils';
import { getPassphrase } from './passphrase-utils';

const gradientPairs = [
  ['from-blue-500 to-purple-500', 'bg-gradient-to-r'],
  ['from-green-400 to-cyan-500', 'bg-gradient-to-r'],
  ['from-pink-500 to-rose-500', 'bg-gradient-to-r'],
  ['from-amber-500 to-pink-500', 'bg-gradient-to-r'],
  ['from-violet-500 to-purple-500', 'bg-gradient-to-r'],
  ['from-cyan-500 to-blue-500', 'bg-gradient-to-r'],
  ['from-emerald-500 to-teal-500', 'bg-gradient-to-r'],
  ['from-fuchsia-500 to-pink-500', 'bg-gradient-to-r'],
  ['from-indigo-500 to-purple-500', 'bg-gradient-to-br'],
  ['from-orange-500 to-rose-500', 'bg-gradient-to-r'],
];

const getRandomElement = <T>(array: T[]): T => array[Math.floor(Math.random() * array.length)];

const generateName = (sex: string | null = null) => {
  if (!sex) {
    sex = faker.person.sex();
  }
  const firstName = faker.person.firstName(sex as "female" | "male");
  const lastName = faker.person.lastName(sex as "female" | "male");
  return {
    firstName,
    lastName,
    full: `${firstName} ${lastName}`,
    sex
  };
};

const generatePhoneNumber = () => {
  return faker.phone.number({ style: 'national' });
};

const generateAddress = () => {
  const street = faker.location.streetAddress();
  const city = faker.location.city();
  const state = faker.location.state({ abbreviated: true });
  const zip = faker.location.zipCode('#####');
  
  return {
    street,
    city,
    state,
    zip,
    full: `${street}, ${city}, ${state} ${zip}`
  };
};

// US address data from filtered source
let cachedAddresses: Array<{ addr: string; city: string; st: string; zip: string }> | null = null;

const getRealAddress = async () => {
  // Lazy load addresses from file
  if (!cachedAddresses) {
    try {
      const data = await import('@/data/us-addresses-filtered.min.json');
      cachedAddresses = data.default.addresses;
      
      if (!cachedAddresses || !Array.isArray(cachedAddresses) || cachedAddresses.length === 0) {
        console.error('Failed to load address data or empty address list');
        // Fallback to faker if no addresses loaded
        return generateAddress();
      }
    } catch (error) {
      console.error('Error loading real address data:', error);
      // Fallback to faker if error occurs
      return generateAddress();
    }
  }
  
  // Pick a random address from the dataset
  const randomAddress = getRandomElement(cachedAddresses!);
  
  return {
    street: randomAddress.addr,
    city: randomAddress.city,
    state: randomAddress.st,
    zip: randomAddress.zip,
    full: `${randomAddress.addr}, ${randomAddress.city}, ${randomAddress.st} ${randomAddress.zip}`
  };
};

const generateBirthday = () => {
  return faker.date.birthdate({ 
    min: 18, 
    max: 70, 
    mode: 'age' 
  }).toLocaleDateString('en-US', { 
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });
};

const generateGradient = () => {
  return getRandomElement(gradientPairs);
};

export const disposableEmailProviders: Record<string, {
  label: string;
  domains?: string[];
  getInboxUrl: (username: string, email?: string) => string;
  generateEmail: (username: string) => { email: string; username: string; domain: string };
}> = {
  reusable: {
    label: 'Reusable.email',
    getInboxUrl: (username) => `https://reusable.email/${username}`,
    generateEmail: (username) => {
      const domain = 'reusable.email';
      return {
        email: `${username}@${domain}`,
        username,
        domain
      };
    }
  },
  maildrop: {
    label: 'Maildrop.cc',
    getInboxUrl: (username) => `https://maildrop.cc/inbox/?mailbox=${username}`,
    generateEmail: (username) => {
      const domain = 'maildrop.cc';
      return {
        email: `${username}@${domain}`,
        username,
        domain
      };
    }
  },
  inboxkitten: {
    label: 'InboxKitten.com',
    domains: ['inboxkitten.com'],
    getInboxUrl: (username) => `https://inboxkitten.com/inbox/${username}/list`,
    generateEmail: (username) => {
      const domain = 'inboxkitten.com';
      return {
        email: `${username}@${domain}`,
        username,
        domain
      };
    }
  },
};

const generateDisposableEmail = (enabledEmailProviders: Record<string, boolean> | null = null) => {
  // Get available providers
  let availableProviders = Object.keys(disposableEmailProviders);
  
  // Filter by enabled providers if specified
  if (enabledEmailProviders && Object.keys(enabledEmailProviders).length > 0) {
    availableProviders = availableProviders.filter(key => enabledEmailProviders[key]);
    
    // Fallback to all providers if none are enabled
    if (availableProviders.length === 0) {
      availableProviders = Object.keys(disposableEmailProviders);
    }
  }
  
  // Pick a random provider from available ones
  const providerKey = getRandomElement(availableProviders);
  const provider = disposableEmailProviders[providerKey];
  
  // Generate username using random bit type; randomly use no separator, dash, or underscore
  const randomUsernameType = getRandomElement(usernameTypes);
  const { components } = generateUsername(randomUsernameType);
  const username = components.join(getRandomElement(['', '-', '_']));
  
  // Generate email according to provider's method
  const emailData = provider.generateEmail(username);
  
  // Get inbox URL
  const inboxUrl = provider.getInboxUrl(username, emailData.email);
  
  return {
    ...emailData,
    provider: providerKey,
    label: provider.label,
    inboxUrl
  };
};

export const generateIdentity = async (enabledProviders: Record<string, boolean> | null = null, sex: string | null = null, enabledEmailProviders: Record<string, boolean> | null = null, useRealAddresses = true) => {
  // Seed faker with a random value for each identity generation
  faker.seed(Math.random() * 10000000);

  const name = generateName(sex);
  const phone = generatePhoneNumber();
  const address = useRealAddresses ? await getRealAddress() : generateAddress();
  const avatar = generateAvatar(name, null, enabledProviders);
  const gradient = generateGradient();
  const birthday = generateBirthday();
  const disposable = generateDisposableEmail(enabledEmailProviders);
  const passphrase = getPassphrase(58);

  return {
    name,
    phone,
    address,
    avatar: {
      url: avatar.url,
      type: avatar.type,
      label: avatar.label
    },
    passphrase,
    gradient,
    birthday,
    username: disposable.username,
    disposableEmail: disposable,
    id: faker.string.uuid(),
    sex: name.sex,
  };
};

export const generateIdentities = async (count = 4, enabledProviders: Record<string, boolean> | null = null, sex: string | null = null, enabledEmailProviders: Record<string, boolean> | null = null, useRealAddresses = true) => {
  return Promise.all(Array(count).fill(null).map(() => generateIdentity(enabledProviders, sex, enabledEmailProviders, useRealAddresses)));
};
