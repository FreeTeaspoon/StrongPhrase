# Wordlists Directory

This directory contains wordlists for different passphrase systems. Each wordlist should be a plain text file with one word per line.

## File Naming Convention

- Use lowercase letters
- Use hyphens to separate words
- Include a descriptive name of the system
- Example: `eff-long.txt`, `diceware.txt`, etc.

## File Format

Each wordlist file should:

1. Be a plain text file
2. Have one word per line
3. Use UTF-8 encoding
4. Not include any header or metadata
5. Not include any empty lines or comments

## Example

```
word1
word2
word3
...
```

## Adding New Wordlists

1. Create a new .txt file following the naming convention
2. Add the words, one per line
3. Update the wordlist configuration in `src/more-passphrases/wordlistConfig.js`
4. Test the wordlist using the MorePassphrases page
