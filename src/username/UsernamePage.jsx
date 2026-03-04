import { useState, useCallback, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { generateUsername } from './username-generator';
import CopyableItem from '../components/CopyableItem';
import PageToolbar from '../components/PageToolbar';

const UsernameDisplay = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [usernames, setUsernames] = useState({});
  const [copiedBits, setCopiedBits] = useState(null);
  const [includeNumbers, setIncludeNumbers] = useState(searchParams.get('numbers') === 'true');
  const [capitalize, setCapitalize] = useState(searchParams.get('capitalize') !== 'false');
  const [useSeparators, setUseSeparators] = useState(searchParams.get('separators') === 'true');
  const sepParam = searchParams.get('sep') || 'dash';
  const [separatorType, setSeparatorType] = useState(sepParam === 'underscore' ? 'underscore' : sepParam === 'random' ? 'random' : 'dash');
  const [separatorRandomByKey, setSeparatorRandomByKey] = useState({});
  const [randomizePerItem, setRandomizePerItem] = useState(searchParams.get('randomize') === 'true');
  const [itemOptions, setItemOptions] = useState({});
  const [generationCount, setGenerationCount] = useState(0);

  const entropyLevels = {
    'animal': 20,
    'concrete': 24,
    'animate': 28,
  };

  const sectionLabels = {
    'animal': 'Animal Usernames',
    'other': 'Other Usernames',
  };

  const counts = {
    'animal': 8,
    'concrete': 4,
    'animate': 4,
  };

  const numberColor = 'text-green-700';

  const updateUrlParams = useCallback((params) => {
    const newParams = new URLSearchParams(searchParams);
    Object.entries(params).forEach(([key, value]) => {
      if (value === null) {
        newParams.delete(key);
      } else {
        newParams.set(key, value);
      }
    });
    setSearchParams(newParams);
  }, [searchParams, setSearchParams]);

  const generateUsernames = useCallback(() => {
    const usernameData = {};
    
    // Generate animal usernames
    for (let i = 0; i < counts.animal; i++) {
      const suffix = i === 0 ? '' : ` ${i + 1}`;
      usernameData[`animal${suffix}`] = { 
        ...generateUsername(entropyLevels.animal), 
        entropy: entropyLevels.animal, 
        type: 'animal',
        section: 'animal'
      };
    }
    
    // Generate concrete and animate usernames
    for (let i = 0; i < counts.concrete; i++) {
      const suffix = i === 0 ? '' : ` ${i + 1}`;
      usernameData[`concrete${suffix}`] = { 
        ...generateUsername(entropyLevels.concrete), 
        entropy: entropyLevels.concrete, 
        type: 'concrete',
        section: 'other'
      };
    }
    
    for (let i = 0; i < counts.animate; i++) {
      const suffix = i === 0 ? '' : ` ${i + 1}`;
      usernameData[`animate${suffix}`] = { 
        ...generateUsername(entropyLevels.animate), 
        entropy: entropyLevels.animate, 
        type: 'animate',
        section: 'other'
      };
    }

    const options = {};
    const sepRandom = {};
    const randomSepChoices = ['', '-', '_'];
    Object.keys(usernameData).forEach(key => {
      options[key] = {
        separatorChar: randomSepChoices[Math.floor(Math.random() * 3)],
        capitalize: Math.random() < 0.5,
        includeNumbers: Math.random() < 0.5,
      };
      sepRandom[key] = randomSepChoices[Math.floor(Math.random() * 3)];
    });
    setItemOptions(options);
    setSeparatorRandomByKey(sepRandom);
    setCopiedBits(null);
    setUsernames(usernameData);
    setGenerationCount(c => c + 1);
  }, [counts.animal, counts.concrete, counts.animate, entropyLevels.animal, entropyLevels.concrete, entropyLevels.animate]);

  const copyToClipboard = useCallback((text, type) => {
    navigator.clipboard.writeText(text);
    setCopiedBits(null);
    setTimeout(() => {
      setCopiedBits(type);
    }, 10);
  }, []);

  useEffect(() => {
    generateUsernames();
  }, [generateUsernames]);

  const getEffectiveOptions = useCallback((itemKey) => {
    if (randomizePerItem && itemOptions[itemKey]) {
      const o = itemOptions[itemKey];
      return {
        includeNumbers: o.includeNumbers,
        capitalize: o.capitalize,
        useSeparators: o.separatorChar !== '',
        separatorChar: o.separatorChar || '-',
      };
    }
    if (useSeparators && separatorType === 'random' && separatorRandomByKey[itemKey] !== undefined) {
      const sep = separatorRandomByKey[itemKey];
      return {
        includeNumbers,
        capitalize,
        useSeparators: sep !== '',
        separatorChar: sep || '-',
      };
    }
    const separatorChar = separatorType === 'underscore' ? '_' : '-';
    return { includeNumbers, capitalize, useSeparators, separatorChar };
  }, [randomizePerItem, itemOptions, includeNumbers, capitalize, useSeparators, separatorType, separatorRandomByKey]);

  const getDisplayComponents = useCallback((components, optIncludeNumbers) => {
    const includeNum = optIncludeNumbers !== undefined ? optIncludeNumbers : includeNumbers;
    return includeNum ? components : components.slice(0, -1);
  }, [includeNumbers]);

  const formatComponent = useCallback((component, _index, _totalComponents, optCapitalize) => {
    const cap = optCapitalize !== undefined ? optCapitalize : capitalize;
    if (cap) {
      const firstChar = component.charAt(0);
      if (firstChar === firstChar.toLowerCase()) {
        return firstChar.toUpperCase() + component.slice(1);
      }
    }
    return component;
  }, [capitalize]);

  const getSeparator = useCallback((optUseSeparators, optSeparatorChar) => {
    const useSep = optUseSeparators !== undefined ? optUseSeparators : useSeparators;
    const sepChar = optSeparatorChar !== undefined ? optSeparatorChar : (separatorType === 'underscore' ? '_' : '-');
    return useSep ? sepChar : '';
  }, [useSeparators, separatorType]);

  const getDisplayUsername = useCallback((components, itemKey) => {
    const opt = getEffectiveOptions(itemKey);
    const sep = getSeparator(opt.useSeparators, opt.separatorChar);
    return getDisplayComponents(components, opt.includeNumbers)
      .map((component, index, array) => formatComponent(component, index, array.length, opt.capitalize))
      .join(sep);
  }, [getEffectiveOptions, getDisplayComponents, formatComponent, getSeparator]);

  const getComponentColor = useCallback((component, index, totalComponents, optIncludeNumbers) => {
    const wordColors = ['text-blue-600', 'text-red-600', 'text-purple-600'];
    const includeNum = optIncludeNumbers !== undefined ? optIncludeNumbers : includeNumbers;
    if (includeNum && index === totalComponents - 1) {
      return numberColor;
    }
    return wordColors[index % wordColors.length];
  }, [includeNumbers, numberColor]);

  const renderUsernameContent = useCallback((components, itemKey) => {
    const opt = getEffectiveOptions(itemKey);
    const displayComponents = getDisplayComponents(components, opt.includeNumbers);
    const sep = getSeparator(opt.useSeparators, opt.separatorChar);
    return displayComponents.map((component, index) => (
      <span key={index}>
        <span className={getComponentColor(component, index, displayComponents.length, opt.includeNumbers)}>
          {formatComponent(component, index, displayComponents.length, opt.capitalize)}
        </span>
        {sep && index < displayComponents.length - 1 && <span className="text-gray-400">{sep}</span>}
      </span>
    ));
  }, [getEffectiveOptions, getDisplayComponents, getComponentColor, formatComponent, getSeparator]);

  const handleIncludeNumbersChange = (e) => {
    const value = e.target.checked;
    setIncludeNumbers(value);
    updateUrlParams({ numbers: value === false ? null : 'true' });
  };

  const handleCapitalizeChange = (e) => {
    const value = e.target.checked;
    setCapitalize(value);
    updateUrlParams({ capitalize: value === true ? null : 'false' });
  };

  const handleUseSeparatorsChange = (e) => {
    const value = e.target.checked;
    setUseSeparators(value);
    updateUrlParams({ separators: value ? 'true' : null });
  };

  const handleSeparatorTypeChange = (e) => {
    const value = e.target.value;
    setSeparatorType(value);
    updateUrlParams({ sep: value === 'dash' ? null : value });
  };

  const handleRandomizePerItemChange = (e) => {
    const value = e.target.checked;
    setRandomizePerItem(value);
    updateUrlParams({ randomize: value ? 'true' : null });
  };

  // Group usernames by their section
  const groupedUsernames = Object.entries(usernames).reduce((acc, [key, data]) => {
    const { section } = data;
    if (!acc[section]) acc[section] = [];
    acc[section].push([key, data]);
    return acc;
  }, {});

  return (
    <section className="content h-full">
      <PageToolbar
        onGenerate={generateUsernames}
        generateButtonText="More"
        isSticky={true}
        className="items-center"
      >
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={randomizePerItem}
              onChange={handleRandomizePerItemChange}
              className="form-checkbox"
            />
            <span className="text-gray-700">Randomize</span>
          </label>

          <label className={`flex items-center gap-2 ${randomizePerItem ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}>
            <input
              type="checkbox"
              checked={includeNumbers}
              onChange={handleIncludeNumbersChange}
              disabled={randomizePerItem}
              className="form-checkbox"
            />
            <span className="text-gray-700">Numbers</span>
          </label>

          <label className={`flex items-center gap-2 ${randomizePerItem ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}>
            <input
              type="checkbox"
              checked={capitalize}
              onChange={handleCapitalizeChange}
              disabled={randomizePerItem}
              className="form-checkbox"
            />
            <span className="text-gray-700">Capitalize</span>
          </label>

          <label className={`flex items-center gap-2 ${randomizePerItem ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}>
            <input
              type="checkbox"
              checked={useSeparators}
              onChange={handleUseSeparatorsChange}
              disabled={randomizePerItem}
              className="form-checkbox"
            />
            <span className="text-gray-700">Separators</span>
          </label>
          {useSeparators && (
            <select
              value={separatorType}
              onChange={handleSeparatorTypeChange}
              disabled={randomizePerItem}
              className="text-sm border rounded px-2 py-1 text-gray-700 disabled:opacity-60 disabled:cursor-not-allowed"
              aria-label="Separator type"
            >
              <option value="dash">Dash</option>
              <option value="underscore">Underscore</option>
              <option value="random">Random</option>
            </select>
          )}
        </div>
      </PageToolbar>

      <div className="pt-4 space-y-8">
        {Object.keys(sectionLabels).map(section => (
          <div key={section} className="mb-6">
            <h3 className="text-lg font-medium text-gray-800 mb-3">{sectionLabels[section]}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {groupedUsernames[section]?.map(([key, { components, entropy }]) => {
                const opt = getEffectiveOptions(key);
                return (
                  <CopyableItem
                    key={key}
                    content={getDisplayUsername(components, key)}
                    label={key}
                    infoBits={entropy}
                    copyToClipboard={copyToClipboard}
                    copiedId={copiedBits}
                    itemId={key}
                    generationCount={generationCount}
                    renderContentOnly={false}
                    showLabel={false}
                    noMarginBottom={true}
                    hideCopyTextBelowLg={true}
                    className="max-w-md"
                  >
                    <div className={`flex flex-wrap ${opt.useSeparators ? '' : 'gap-1'}`}>
                      {renderUsernameContent(components, key)}
                    </div>
                  </CopyableItem>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

const UsernamePage = () => (
  <div className="container p-4">
    <h2 className="page-title">Random Username Generator</h2>
    <UsernameDisplay />
  </div>
);

export default UsernamePage; 