class ToolbarStorage {
  static KEYS = {
    AVATAR_PROVIDERS: 'toolbar_avatar_providers',
    GENDER_PREFERENCE: 'gender_preference',
    EMAIL_PROVIDERS: 'email_providers'
  };

  static getItem(key: string, defaultValue: unknown = null) {
    if (typeof window === 'undefined') return defaultValue;
    
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      return defaultValue;
    }
  }

  static setItem(key: string, value: unknown) {
    if (typeof window === 'undefined') return;

    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error('Error writing to localStorage:', error);
    }
  }

  // Avatar providers specific methods
  static getAvatarProviders(defaultProviders: unknown) {
    return this.getItem(this.KEYS.AVATAR_PROVIDERS, defaultProviders);
  }

  static setAvatarProviders(providers: unknown) {
    this.setItem(this.KEYS.AVATAR_PROVIDERS, providers);
  }

  // Gender preference specific methods
  static getGenderPreference(defaultValue: unknown = null) {
    return this.getItem(this.KEYS.GENDER_PREFERENCE, defaultValue);
  }

  static setGenderPreference(gender: string) {
    this.setItem(this.KEYS.GENDER_PREFERENCE, gender);
  }

  // Email providers specific methods
  static getEmailProviders(defaultProviders: unknown) {
    return this.getItem(this.KEYS.EMAIL_PROVIDERS, defaultProviders);
  }

  static setEmailProviders(providers: unknown) {
    this.setItem(this.KEYS.EMAIL_PROVIDERS, providers);
  }
}

export default ToolbarStorage;
