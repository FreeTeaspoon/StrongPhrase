import FAQItem from './../FAQItem';

const IdentityFAQ = () => {
  return (
    <div className="faq-all">
      <section className="content faq-overall-container markdown-content" id="FAQ">
        <h1 className="section-header">Frequently Asked Questions</h1>

        <div className="faq-container">
          
          <FAQItem
            question="Why would I use a randomly generated identity?"
            id="why-use"
            answer={`
              Using randomly generated identity elements helps prevent doxxing and keeps your accounts separate:

              * **Different Usernames and Display Names**: Makes it harder for someone to find you online and connect your different accounts. If you use "JaySmith" everywhere, anyone could Google that username and connect your Twitter, Facebook, Reddit, Spotify, GoodReads, Pinterest, etc., developing a clear picture of your habits, interests, location, and more.

              * **Disposable Email Addresses**: Perfect for services you never want to hear from again but need for email verification. 
              
              * **Random Addresses**: Useful whenever you're asked for an address, especially when using unique credit cards for each purchase through services like [Privacy.com](https://privacy.com), which allow you to enter any name and address for purchases.

              * **Passphrases**: Create strong, memorable passwords that are unique for each service, reducing the risk of credential stuffing attacks if one service is compromised.

              * **Avatar Images**: Using different profile pictures across services makes visual correlation of your accounts more difficult.
            `}
          />


          <FAQItem
            question="Is it safe to use a disposable email service?"
            id="disposable-email-safety"
            answer={`
              Disposable email services provide a temporary inbox where you can receive emails. The inbox is public and emails are automatically deleted after 1-3 days depending on the provider.

              **WARNING**: Do not use these for sensitive accounts as anyone could trigger a password reset and access your account. For private anonymous email aliases, consider [DuckDuckGo Email](https://duckduckgo.com/email), [Addy.io](https://addy.io), or [SimpleLogin](https://simplelogin.io).
            `}
          />


          <FAQItem
            question="How can I save my generated identity?"
            id="save-identity"
            answer={`
              Use the two buttons in the gradient area above the first/last name to copy and save your identity.

              * **Copy All**: Copies the entire identity to your clipboard, which you can then paste and save in your password manager, notes app, or any other secure location.

              * **1Password Export**: If you use 1Password, simply click the 1Password icon to export the entire identity directly into a 1Password login. This creates a new entry in your password manager with all identity details neatly organized.
            `}
          />

          <FAQItem
            question="Where does all this random identity data come from?"
            id="data-sources"
            answer={`
              Each piece of identity information comes from different sources:

              * **Names, Phone Numbers, Birthdays**: Generated using [Faker.js](https://fakerjs.dev/), which provides a large dataset of realistic names. First and last names are randomly paired for diverse combinations.

              * **Usernames**: Created from our [Username Generator](#/username), which uses the same adjective/noun word lists that are used for the passphrase generator. For usernames, there are 1,024 adjectives + 1,024 nouns + 32 numbers available.

              * **Passphrases**: Generated using our [Passphrase Generator](#/passphrase) with the same security principles and word selection methodology.

              * **Addresses**: Real, geocodable addresses from a curated set of 2,095 locations sourced from [OpenAddresses.io](https://openaddresses.io/). Useful for forms requiring address verification.

              * **Disposable Emails**: Created based on the username and hosted on:
                - [Reusable.email](https://reusable.email) - Well designed and easy to use.
                - Optional: [Maildrop.cc](https://maildrop.cc) and [Inbox Kitten](https://inboxkitten.com)

              * **Avatar Images**: Multiple sources including:
                - "Real Photos" - 178 real photographs
                - "AI-Generated" - 200 AI-generated realistic portraits
                - "Avatar Generators" - Various avatar generators with thousands of possible combinations

              You can customize which avatar types and email providers to use via the dropdowns in the toolbar.
            `}
          />
        </div>
      </section>
    </div>
  );
}

export default IdentityFAQ; 