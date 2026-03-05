export const pick = (locale, en, zh) => (locale === 'zh' ? zh : en);

export const normalizeLocale = (value) => (value === 'zh' ? 'zh' : 'en');

export const localeTag = (locale) => (locale === 'zh' ? 'zh-CN' : 'en-US');

export const formatLocaleDateTime = (locale, value, options = {}) =>
    new Date(value).toLocaleString(localeTag(locale), options);

export const formatLocaleTime = (locale, value, options = {}) =>
    new Date(value).toLocaleTimeString(localeTag(locale), options);
