export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const OTP_REGEX = /^\d{6}$/;
export const PHONE_REGEX = /^[+]?[0-9\s\-()]{7,20}$/;
export const DOMAIN_REGEX = /^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

export const isValidEmail = (value = '') => EMAIL_REGEX.test(value.trim());
export const isStrongPassword = (value = '') => value.trim().length >= 8;
export const isValidOtp = (value = '') => OTP_REGEX.test(String(value).trim());
export const isValidPhone = (value = '') => PHONE_REGEX.test(value.trim());

export const isValidWebsite = (value = '') => {
  const website = value.trim();
  if (!website) return true;
  if (website.startsWith('http://') || website.startsWith('https://')) {
    try {
       
      new URL(website);
      return true;
    } catch {
      return false;
    }
  }

  return DOMAIN_REGEX.test(website);
};
