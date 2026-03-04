import { timeToCrackAvg, convertTimeToReadableFormat } from './../passphraseUtils';
import { hardwareOptions } from '../HashRateSelector';
import FAQItem from './../FAQItem';
import MarkdownCustom from '../MarkdownCustom';
import PasscodeChecker from './PasscodeChecker';

const formatNumber = (number, precision=3) => {
  let rounded = Number(number.toPrecision(precision));
  return rounded.toLocaleString();
};

// Helper function to determine if a time is 4 years or greater
const isTimeFourYearsOrGreater = (timeInSeconds) => {
  const secondsInYear = 60 * 60 * 24 * 365;
  const years = timeInSeconds / secondsInYear;
  // 3.8 years should be considered 4 years (green), so we check if >= 3.8
  return years >= 3.8;
};


export const PasscodeCrackTable = ({ hashRate }) => {

  const generateTableData = () => {
    let data = [];
    for (let length = 4; length <= 15; length += 1) {
      const numberOfGuesses = 10 ** length;
      const entropy = Math.log2(numberOfGuesses)
      // const avgCost = avgCostToCrack(entropy, BASE_COST_PER_32);
      // const roundedCost = formatDollarToScale(avgCost, 2, false);
      const avgTime = timeToCrackAvg(entropy, hashRate);
      const maxTime = avgTime * 2;
      
      // Calculate crack times for each passcode rate
      const iosMaxTime = timeToCrackAvg(entropy, hardwareOptions.passcode["iOS maximum crack rate"]);
      const androidMaxTime = timeToCrackAvg(entropy, hardwareOptions.passcode["Android maximum crack rate"]);
      const cellebriteTime = timeToCrackAvg(entropy, hardwareOptions.passcode["iOS Cellebrite observed crack rate (2025, iPhone SE)"]);
      
      data.push({
        length,
        entropy: formatNumber(entropy, 2),
        // guesses: formatNumber(numberOfGuesses),
        avgtime: convertTimeToReadableFormat(avgTime),
        maxtime: convertTimeToReadableFormat(maxTime),
        iosMaxTime: convertTimeToReadableFormat(iosMaxTime),
        androidMaxTime: convertTimeToReadableFormat(androidMaxTime),
        cellebriteTime: convertTimeToReadableFormat(cellebriteTime),
        // cost: roundedCost.toLocaleString()
        iosMaxTimeGreen: isTimeFourYearsOrGreater(iosMaxTime),
        androidMaxTimeGreen: isTimeFourYearsOrGreater(androidMaxTime),
        cellebriteTimeGreen: isTimeFourYearsOrGreater(cellebriteTime),
      });
    }
    return data;
  };

  const tableData = generateTableData();

  return (
    <section className="overflow-x-auto">
      <div className="text-sm text-green-600 mb-2">
        <strong>Green = Average time to crack is 4 years or greater</strong>
      </div>
      <table className="table table-zebra w-auto">
        <thead>
          <tr>
            <th style={{ wordWrap: 'break-word', wordBreak: 'break-word', whiteSpace: 'normal', maxWidth: '200px' }}># of digits in passcode</th>
            <th style={{ wordWrap: 'break-word', wordBreak: 'break-word', whiteSpace: 'normal', maxWidth: '200px' }}>Bits of entropy</th>
            {/* <th>Pool of possible guesses</th> */}
            <th style={{ wordWrap: 'break-word', wordBreak: 'break-word', whiteSpace: 'normal', maxWidth: '200px' }}>iOS avg time to crack (12.5/sec) (<a href="https://support.apple.com/en-gb/guide/security/sec20230a10d/web#sec92064f801" target="_blank" rel="noopener noreferrer">source</a>)</th>
            <th style={{ wordWrap: 'break-word', wordBreak: 'break-word', whiteSpace: 'normal', maxWidth: '200px' }}>Android avg time to crack (40/sec) (<a href="https://source.android.com/docs/security/features/encryption/file-based#key-storage-and-protection" target="_blank" rel="noopener noreferrer">source</a>)</th>
            <th style={{ wordWrap: 'break-word', wordBreak: 'break-word', whiteSpace: 'normal', maxWidth: '200px' }}>iOS Cellebrite Observed avg time to crack (0.036/sec) (<a href="https://www.linkedin.com/feed/update/urn:li:activity:7286210249928105984/" target="_blank" rel="noopener noreferrer">source</a>)</th>
          </tr>
        </thead>
        <tbody>
          {tableData.map((row) => (
            <tr key={row.entropy}>
              <td className="font-bold">{row.length} digits</td>
              <td>{row.entropy} bits</td>
              {/* <td>{row.guesses}</td> */}
              <td><strong className={row.iosMaxTimeGreen ? 'text-green-600' : ''}>{row.iosMaxTime}</strong></td>
              <td><strong className={row.androidMaxTimeGreen ? 'text-green-600' : ''}>{row.androidMaxTime}</strong></td>
              <td><strong className={row.cellebriteTimeGreen ? 'text-green-600' : ''}>{row.cellebriteTime}</strong></td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}



const PasscodeFAQ = ({ hashRate }) => {
  return (
    <div className="faq-all">
      <section className="content faq-overall-container markdown-content" id="FAQ">
        <h1 className="section-header">Frequently Asked Questions</h1>

        <div className="faq-container">

          <FAQItem
            question="Which one should I pick?"
            id="which-one"
            answer={`
              * **8 digits** — **Best balance for most people**: stronger than the default 6, but still quick to type.

              * **10 digits** — Strongest option, but takes longer to enter each time.

              * **6 digits** — A random 6-digit code is much better than one you choose yourself. Humans are bad at picking random numbers and often use patterns, birthdays, or sequences that attackers try first.
            `}
          />

          <div className="faq-item" id="cracktime">
            <h2 className="faq-question">How long does it take to crack a passcode?</h2>
            <div className="faq-answer">
              <MarkdownCustom>
                See the table below. 
                
                This system forces password/passcode checking to be done on the device, which means it can't be scaled up to dozens or hundreds of computers simultaneously guessing.
              </MarkdownCustom>
              <PasscodeCrackTable hashRate={hashRate} />
            </div>
          </div>

          <FAQItem
            question="How do we know the guesses/second?"
            id="secure"
            answer={`
              The iOS documentation claims that each passcode attempt should take [at least 80 milliseconds](https://support.apple.com/en-gb/guide/security/sec20230a10d/web#sec92064f801), which equals **12.5 guesses/second**.

              The Android documentaiton says it targets [25 milliseconds per attempt](https://source.android.com/docs/security/features/encryption/file-based#key-storage-and-protection), which equals **40 guesses/second**.

              These rates assume that cracking tools can bypass the tools (Secure Enclave, etc.) that are used to protect the passcode. 
              
              In practice, the forensic tools that cops use (like [GrayKey and Cellebrite](https://sls.eff.org/technologies/forensic-extraction-tools)) are generally slower than the theoretical maximums listed in the iOS/Android documentation. A [2025 LinkedIn post from a cop](https://www.linkedin.com/feed/update/urn:li:activity:7286210249928105984/) incidates a crack rate of 2.2 attempts/minute (595,000 attampts over 192 days) or **0.036 guesses/second**.

              We use 12.5 guesses/second as the default crack rate in the drop-down above because it is a conservative middle-ground.

              You can adjust the crack rate using the dropdown menu at the top of this page.
            `}
          />

          <FAQItem
            question="What if the generator randomly gives me passcode that is easy to crack?"
            id="secure"
            answer={`
              For six-digit passcodes specifically, there are a number of commonly used passcodes. Birthdays are also very common.

              An attacker would likely try these common patterns first, and there is chance that the random passcode generator actually gives you one of these common passcodes. 

              To prevent this, we prevent the generator from giving you a 6-digit passcode that is either:
              * On a list of the top 10,000 commonly used[^rockyou] 6-digit codes: \`123456\` or \`555555\` or \`789456\`
              * Or fits a common birthday format[^bday] (MMDDYY, DDMMYY, YYMMDD).

              This helps the entropy of your passcode be more trustworthy. You can see the full list of about [94,000 filtered passcodes here](https://gitlab.com/strongphrase/strongphrase.net/blob/main/src/scripts/wordlists/filtered_passcodes_six.js).

              We only do this filtering for 6-digit passcodes. Removing 94k from 10^6 possible passcodes is a small fraction (9.4%) of the total, so you still have ~20 bits of entropy (19.93 bits normally, 19.79 bits after exclusions).

              iOS will attmpt to warn you if you're using a [certain set of easy to guess passcodes](https://this-pin-can-be-easily-guessed.github.io/), but it doesn't block you entirely from using them.

              [^rockyou]: Our list is derived from the [RockYou](https://en.wikipedia.org/wiki/RockYou) 2009 data breach that exposed 32 million passwords. These are sorted by how frequently they occurred in the leaked passwords. In our process, we filtered down to only 6-digit codes on that list. We then remove anything fitting our birthday formats (because we are going to re-add them separately). We then take the top 10,000.
              [^bday]: You can see this [heatmap for 4-digit pins](https://datagenetics.com/blog/september32012/index.html) for information on how birthdays and anniversaries are commonly used. 
            `}
          />

          <div className="faq-item" id="checker">
            <h2 className="faq-question">Check if your passcode is easy-to-crack</h2>
            <div className="faq-answer">
              <div className="mt-4 text-sm text-gray-600">
                <p>
                  This tool checks your passcode against our list of common patterns and easily guessable combinations. 
                  The list includes popular 6-digit codes from data breaches (like <code>123456</code>, <code>555555</code>) 
                  and common birthday formats (MMDDYY, DDMMYY, YYMMDD). 
                  You can view the complete list of about 94,000 filtered passcodes in our{' '}
                  <a href="https://gitlab.com/strongphrase/strongphrase.net/blob/main/src/scripts/wordlists/filtered_passcodes_six.js" 
                     className="text-blue-600 hover:text-blue-800 underline">
                    repository
                  </a>.
                </p>
              </div>
              <PasscodeChecker />
            </div>
          </div>

        </div>
      </section>
    </div>
  );
}

export default PasscodeFAQ;