import { useState, useMemo } from 'react';
import { filteredPasscodes } from '../scripts/wordlists/filtered_passcodes_six';
import { convertTimeToReadableFormat } from './../passphraseUtils';
import { hardwareOptions } from '../HashRateSelector';


const PasscodeChecker = () => {
  const [userPasscode, setUserPasscode] = useState('');
  const [isValidInput, setIsValidInput] = useState(true);

  const handlePasscodeChange = (e) => {
    const value = e.target.value;
    setUserPasscode(value);
    setIsValidInput(/^\d{0,15}$/.test(value));
  };

  const analysis = useMemo(() => {
    if (!userPasscode || !isValidInput) {
      return null;
    }

    const numDigits = userPasscode.length;
    const isInFilteredList = numDigits === 6 && filteredPasscodes.includes(userPasscode);
    
    let attemptsNeeded;
    if (isInFilteredList) {
      // Find the position in the filtered list (1-indexed)
      const position = filteredPasscodes.indexOf(userPasscode) + 1;
      attemptsNeeded = position;
    } else {
      // Calculate entropy for non-filtered passcodes
      let totalPossiblePasscodes = 10 ** numDigits;
      if (numDigits === 6) {
        totalPossiblePasscodes -= filteredPasscodes.length;
      }
      const entropy = Math.log2(totalPossiblePasscodes);
      attemptsNeeded = Math.pow(2, entropy - 1); // Average case
    }

    // Calculate crack times for each attack scenario
    const crackTimes = Object.entries(hardwareOptions.passcode).map(([scenario, hashRate]) => {
      const timeInSeconds = attemptsNeeded / hashRate;
      // Return "less than a second" for passcodes with less than 6 digits
      const time = numDigits < 6 ? "less than a second" : convertTimeToReadableFormat(timeInSeconds);
      return {
        scenario,
        hashRate,
        time
      };
    });

    return {
      numDigits,
      isInFilteredList,
      attemptsNeeded,
      crackTimes
    };
  }, [userPasscode, isValidInput]);

  const isWeak = analysis?.isInFilteredList || (analysis?.numDigits < 6);

  return (
    <div className="max-w-xl mx-auto mt-4">
      <div className={`rounded-2xl shadow-sm border p-6 ${
        !analysis 
          ? 'bg-gray-50 border-gray-200'
          : isWeak 
            ? 'bg-red-50 border-red-200' 
            : 'bg-green-50 border-green-200'
      }`}>
                  <div className="mb-6">
            <div className="flex justify-center">
              <div className="w-md">
                <h3 htmlFor="passcode-input" className="text-left mb-2">Enter your current passcode</h3>
                <input
                  id="passcode-input"
                  type="text"
                  value={userPasscode}
                  onChange={handlePasscodeChange}
                  placeholder="123456"
                  className={`input input-bordered w-lg text-xl font-light tracking-wider ${
                    !isValidInput ? 'input-error' : ''
                  }`}
                  maxLength={15}
                />
                {!isValidInput && (
                  <p className="text-error text-xs mt-1">Digits only (0-9)</p>
                )}
              </div>
            </div>
          </div>

        {!analysis ? (
          <div className="text-left">
            <p className="text-gray-600 text-sm text-center leading-relaxed">
              Your passcode is never sent off your device. To be safer, use a passcode similar to yours instead of your real one.
            </p>
          </div>
        ) : (
          <div className="text-center">
            {isWeak ? (
              <>
                <div className="text-2xl font-semibold text-red-700 mb-2">
                  ❌ Your passcode is very easy-to-crack
                </div>
                <div className="text-sm text-red-700 mb-4">
                  It would take the cops between <strong>{analysis.crackTimes[0].time}</strong> and <strong>{analysis.crackTimes[1].time}</strong> to crack this passcode.
                </div>
              </>
            ) : (
              <>
                <div className="text-2xl font-semibold text-green-700 mb-2">
                  ✅ Your passcode is not on our easy-to-crack list
                </div>
                <div className="text-sm text-green-700 mb-4">
                  It would take the cops between <strong>{analysis.crackTimes[0].time}</strong> and <strong>{analysis.crackTimes[2].time}</strong> to crack this passcode.
                </div>
              </>
            )}
            
            <div className="text-xs text-gray-600">
              <table className="w-full">
                <tbody>
                  <tr>
                    <td>iOS avg time to crack (12.5/sec):</td>
                    <td className="font-semibold">{analysis.crackTimes[0].time}</td>
                  </tr>
                  <tr>
                    <td>Android avg time to crack (40/sec):</td>
                    <td className="font-semibold">{analysis.crackTimes[1].time}</td>
                  </tr>
                  <tr>
                    <td>iOS Cellebrite Observed avg time to crack (0.036/sec):</td>
                    <td className="font-semibold">{analysis.crackTimes[2].time}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PasscodeChecker; 