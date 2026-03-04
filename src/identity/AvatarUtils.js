import { faker } from '@faker-js/faker';

// Deterministic random number generator based on string seed
const seededRandom = (seed) => {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    const char = seed.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  const x = Math.sin(hash) * 10000;
  return x - Math.floor(x);
};

// Deterministic array element selector
const getSeededElement = (array, seed) => {
  const index = Math.floor(seededRandom(seed) * array.length);
  return array[index];
};

export const avatarProviders = {
  randomuser: {
    label: 'Real Photo',
    probability: 9,
    generate: (name) => {
      // Use seededRandom to determine which API to use
      const useXsgames = seededRandom(name.full + 'api') > 0.5;
      
      if (useXsgames) {
        const index = Math.floor(seededRandom(name.full) * 78);
        return name.sex === 'female'
          ? `https://xsgames.co/randomusers/assets/avatars/female/${index}.jpg`
          : `https://xsgames.co/randomusers/assets/avatars/male/${index}.jpg`;
      } else {
        const index = Math.floor(seededRandom(name.full) * 100);
        return name.sex === 'female' 
          ? `https://randomuser.me/api/portraits/women/${index}.jpg`
          : `https://randomuser.me/api/portraits/men/${index}.jpg`;
      }
    }
  },

  // Draws from a set of 100 female and 100 male photos (AI-generated)
  // https://cdn.jsdelivr.net/gh/faker-js/assets-person-portrait/female/512/99.jpg (but 100.jpg doens't exist)
  realistic: {
    label: 'AI Generated Photo',
    probability: 4,
    generate: (name) => {
      faker.seed(name.full.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0));
      return faker.image.personPortrait({
        sex: name.sex,
        size: 512
      });
    }
  },

  notionists: {
    label: 'Notionist Avatar',
    probability: 4,
    generate: (name) => {
      const baseUrl = "https://api.dicebear.com/9.x/notionists/svg";
      const commonParams = "backgroundColor=b6e3f4,c0aede,d1d4f9,ffdfbf";
      
      const hair_male = "hat,variant01,variant03,variant05,variant06,variant07,variant12,variant13,variant15,variant16,variant18,variant19,variant20,variant21,variant22,variant24,variant26,variant27,variant32,variant35,variant38,variant44,variant54,variant55,variant56,variant58,variant60";
      const hair_female = "variant02,variant08,variant10,variant11,variant23,variant28,variant29,variant30,variant36,variant37,variant39,variant41,variant45,variant46,variant47,variant57";
      const hair_nonbinary = "hat,variant03,variant04,variant05,variant07,variant08,variant09,variant10,variant11,variant13,variant15,variant17,variant18,variant19,variant20,variant21,variant24,variant25,variant27,variant29,variant30,variant31,variant32,variant33,variant34,variant35,variant37,variant40,variant43,variant44,variant48,variant49,variant56,variant59,variant60";

      const lips = "variant03,variant04,variant06,variant08,variant14,variant17,variant22,variant23";

      if (name.sex === 'male') {
        return `${baseUrl}?seed=${encodeURIComponent(name.full)}&${commonParams}`
          + "&brows=variant04,variant07,variant08,variant09"
          + "&eyes=variant01,variant02,variant03,variant04,variant05"
          + "&nose=variant01,variant02,variant03,variant04,variant05,variant06,variant07"
          + `&lips=${lips}`
          + `&hair=${hair_male}`
          + "&beard=variant01,variant02,variant03,variant04,variant05,variant06,variant07,variant08,variant09,variant10,variant11,variant12"
          + "&beardProbability=10"
          + "&glasses=variant06,variant11"
          + "&glassesProbability=10";
      } else if (name.sex === 'nonbinary') {
        return `${baseUrl}?seed=${encodeURIComponent(name.full)}&${commonParams}`
          + "&brows=variant04,variant07,variant08,variant09"
          + "&eyes=variant01,variant02,variant03,variant04,variant05"
          + "&nose=variant01,variant02,variant03,variant04,variant05,variant06,variant07,variant08"
          + `&lips=${lips}`
          + `&hair=${hair_nonbinary}`
          + "&beard=variant01,variant02,variant03,variant04,variant05,variant06,variant07,variant08"
          + "&beardProbability=5"
          + "&glasses=variant06,variant11"
          + "&glassesProbability=15";
      } else {
        return `${baseUrl}?seed=${encodeURIComponent(name.full)}&${commonParams}`
          + "&brows=variant04,variant07,variant08,variant09"
          + "&eyes=variant01,variant02,variant03,variant04,variant05"
          + "&nose=variant01,variant02,variant03,variant04,variant05,variant06,variant07,variant08,variant09,variant10"
          + `&lips=${lips}`
          + `&hair=${hair_female}`
          + "&beardProbability=0"
          + "&glasses=variant06,variant11"
          + "&glassesProbability=10";
      }
    }
  },

  avataaars: {
    label: 'Cartoon Avatar #1',
    probability: 4,
    generate: (name) => {
      const topTypes = name.sex === 'female' 
        ? ['LongHairBob', 'LongHairCurly', 'LongHairStraight', 'LongHairBun', 'LongHairFrida']
        : ['ShortHairShortFlat', 'ShortHairShortWaved', 'ShortHairTheCaesar'];
      // Added "blank" a bunch of times to keep probability lower
      const accessoriesTypes = ['Blank', 'Blank', 'Blank', 'Blank', 'Blank', 'Blank', 'Blank', 'Blank', 'Kurt', 'Prescription01', 'Round', 'Sunglasses'];
      const hairColors = ['Auburn', 'Black', 'Blonde', 'Brown', 'BrownDark', 'Red'];
      const facialHairTypes = name.sex === 'male' 
        ? ['Blank', 'BeardMedium', 'BeardLight', 'BeardMajestic', 'MoustacheFancy'] 
        : ['Blank'];
      const clotheTypes = ['BlazerShirt', 'BlazerSweater', 'CollarSweater', 'Hoodie', 'ShirtCrewNeck'];
      const eyeTypes = ['Default', 'Happy', 'Wink', 'Side'];
      const eyebrowTypes = ['Default', 'DefaultNatural', 'RaisedExcited'];
      const mouthTypes = ['Default', 'Smile', 'Twinkle', 'Serious'];
      const skinColors = ['Light', 'Pale', 'Brown', 'DarkBrown', 'Black'];

      // Use name as seed for each feature
      return 'https://avataaars.io/?' + [
        `avatarStyle=Transparent`,
        `topType=${getSeededElement(topTypes, name.full + '1')}`,
        `accessoriesType=${getSeededElement(accessoriesTypes, name.full + '2')}`,
        `hairColor=${getSeededElement(hairColors, name.full + '3')}`,
        `facialHairType=${getSeededElement(facialHairTypes, name.full + '4')}`,
        `clotheType=${getSeededElement(clotheTypes, name.full + '5')}`,
        `eyeType=${getSeededElement(eyeTypes, name.full + '6')}`,
        `eyebrowType=${getSeededElement(eyebrowTypes, name.full + '7')}`,
        `mouthType=${getSeededElement(mouthTypes, name.full + '8')}`,
        `skinColor=${getSeededElement(skinColors, name.full + '9')}`
      ].join('&');
    }
  },

  personas: {
    label: 'Cartoon Avatar #2',
    probability: 2,
    generate: (name) => {
      const baseUrl = "https://api.dicebear.com/9.x/personas/svg";
      const commonParams = "backgroundColor=b6e3f4,c0aede,d1d4f9,ffdfbf";
      
      if (name.sex === 'male') {
        return `${baseUrl}?seed=${encodeURIComponent(name.full)}&${commonParams}`
          + "&eyes=glasses,happy,open,sunglasses,wink"
          + "&mouth=bigSmile,smile,smirk"
          + "&nose=mediumRound,smallRound"
          + "&hair=buzzcut,fade,shortCombover,cap"
          + "&hairColor=6c4545,362c47,f27d65"
          + "&facialHair=beardMustache,goatee,pyramid,shadow,soulPatch,walrus"
          + "&facialHairProbability=50"
          + "&skinColor=623d36,92594b,b16a5b,d78774,e5a07e,e7a391,eeb4a4"
          + "&clothingColor=6dbb58,54d7c7,456dff,7555ca,e24553,f3b63a";
      } else {
        return `${baseUrl}?seed=${encodeURIComponent(name.full)}&${commonParams}`
          + "&eyes=glasses,happy,open,sunglasses,wink"
          + "&mouth=bigSmile,smile,smirk"
          + "&nose=mediumRound,smallRound"
          + "&hair=bobBangs,bobCut,bunUndercut,curly,curlyBun,extraLong,long,pigtails,straightBun"
          + "&hairColor=6c4545,362c47,e15c66,e16381,f27d65,f29c65"
          + "&facialHairProbability=0"
          + "&skinColor=623d36,92594b,b16a5b,d78774,e5a07e,e7a391,eeb4a4"
          + "&clothingColor=6dbb58,54d7c7,456dff,7555ca,e24553,f3b63a";
      }
    }
  },

  avataaarsNeutral: {
    label: 'Simple Face',
    probability: 2,
    generate: (name) => `https://api.dicebear.com/9.x/avataaars-neutral/svg?seed=${encodeURIComponent(name.full)}&eyes=default,happy,wink&eyebrows=default,defaultNatural,raisedExcited,raisedExcitedNatural&mouth=default,smile,twinkle&backgroundColor=b6e3f4,c0aede,d1d4f9,ffdfbf`
  },

  uiAvatars: {
    label: 'Initials',
    probability: 2,
    generate: (name) => {
      const colors = [
        { bg: '6366f1', fg: 'ffffff' }, // indigo
        { bg: '3b82f6', fg: 'ffffff' }, // blue
        { bg: '06b6d4', fg: 'ffffff' }, // cyan
        { bg: '10b981', fg: 'ffffff' }, // emerald
        { bg: 'f59e0b', fg: 'ffffff' }, // amber
        { bg: 'ef4444', fg: 'ffffff' }, // red
        { bg: 'd946ef', fg: 'ffffff' }, // fuchsia
      ];
      const randomColor = getSeededElement(colors, name.full);
      return `https://ui-avatars.com/api/`
        + `?name=${encodeURIComponent(name.full)}`
        + `&background=${randomColor.bg}`
        + `&color=${randomColor.fg}`
        + `&size=512`
        + `&bold=true`
        + `&format=png`
        + `&rounded=true`;
    }
  },

  shapes: {
    label: 'Abstract Shapes',
    probability: 2,
    generate: (name) => `https://api.dicebear.com/7.x/shapes/svg?seed=${encodeURIComponent(name.full)}&backgroundColor=ffffff`
  },

  identicon: {
    label: 'Geometric Pattern',
    probability: 2,
    generate: (name) => `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(name.full)}&backgroundColor=ffffff`
  },
};

export const generateAvatar = (name, specificProvider = null, enabledProviders = null) => {
  // If a specific provider is requested, use it
  if (specificProvider && avatarProviders[specificProvider]) {
    const provider = avatarProviders[specificProvider];
    return {
      url: provider.generate(name),
      type: specificProvider,
      label: provider.label
    };
  }

  // Filter providers based on enabledProviders if provided
  const availableProviders = enabledProviders
    ? Object.entries(avatarProviders)
        .filter(([key]) => enabledProviders[key])
        .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {})
    : avatarProviders;

  // Calculate total weight of available providers
  const totalWeight = Object.values(availableProviders)
    .reduce((sum, provider) => sum + (provider.probability || 0), 0);
  
  // Pick a random number between 0 and total weight
  let random = Math.random() * totalWeight;
  
  // Find the selected provider based on weights
  for (const [providerName, provider] of Object.entries(availableProviders)) {
    random -= (provider.probability || 0);
    if (random <= 0) {
      return {
        url: provider.generate(name),
        type: providerName,
        label: provider.label
      };
    }
  }

  // Fallback to realistic if something goes wrong
  const fallback = avatarProviders.realistic;
  return {
    url: fallback.generate(name),
    type: 'realistic',
    label: fallback.label
  };
}; 