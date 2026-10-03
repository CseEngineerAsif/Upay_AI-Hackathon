import { Language } from '../types';

export const BANGLA_DIGITS: { [key: string]: string } = {
  '0': '০',
  '1': '১',
  '2': '২',
  '3': '৩',
  '4': '৪',
  '5': '৫',
  '6': '৬',
  '7': '৭',
  '8': '৮',
  '9': '৯'
};

export function toBanglaNumber(input: number | string): string {
  const str = input.toString();
  return str.replace(/[0-9]/g, match => BANGLA_DIGITS[match] || match);
}

export function formatCurrency(amount: number, language: Language = 'bn'): string {
  const formatted = amount.toLocaleString('en-IN');
  if (language === 'bn') {
    return `৳${toBanglaNumber(formatted)}`;
  }
  return `৳${formatted}`;
}

export function formatDate(isoString: string, language: Language = 'bn'): string {
  try {
    const d = new Date(isoString);
    const monthsBn = [
      'জানু', 'ফেব্রু', 'মার্চ', 'এপ্রিল', 'মে', 'জুন',
      'জুলাই', 'আগস্ট', 'সেপ্টে', 'অক্টো', 'নভে', 'ডিসে'
    ];
    const monthsEn = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];

    const day = d.getDate();
    const month = d.getMonth();
    const hours = d.getHours();
    const minutes = d.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? (language === 'bn' ? 'দুপুর/রাত' : 'PM') : (language === 'bn' ? 'সকাল' : 'AM');
    const formattedHour = hours % 12 || 12;

    if (language === 'bn') {
      return `${toBanglaNumber(day)} ${monthsBn[month]}, ${toBanglaNumber(formattedHour)}:${toBanglaNumber(minutes)} ${ampm}`;
    }
    return `${day} ${monthsEn[month]}, ${formattedHour}:${minutes} ${ampm}`;
  } catch {
    return isoString;
  }
}
