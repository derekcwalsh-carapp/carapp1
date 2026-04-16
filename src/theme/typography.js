import tokens from './tokens';

export const heroSerif = {
  fontFamily: tokens.fonts.serifBold,
  fontSize: tokens.fontSize.hero,
  color: tokens.colors.text,
  lineHeight: tokens.fontSize.hero * 1.15,
};

export const displaySerif = {
  fontFamily: tokens.fonts.serifBold,
  fontSize: tokens.fontSize.display,
  color: tokens.colors.text,
  lineHeight: tokens.fontSize.display * 1.2,
};

export const titleSerif = {
  fontFamily: tokens.fonts.serifBold,
  fontSize: tokens.fontSize.xxl,
  color: tokens.colors.text,
  lineHeight: tokens.fontSize.xxl * 1.25,
};

export const titleSerifItalic = {
  fontFamily: tokens.fonts.serifItalic,
  fontSize: tokens.fontSize.xxl,
  color: tokens.colors.text,
  lineHeight: tokens.fontSize.xxl * 1.25,
};

export const bodySerif = {
  fontFamily: tokens.fonts.serif,
  fontSize: tokens.fontSize.md,
  color: tokens.colors.text,
  lineHeight: tokens.fontSize.md * 1.6,
};

export const bodySans = {
  fontFamily: tokens.fonts.sans,
  fontSize: tokens.fontSize.md,
  color: tokens.colors.text,
  lineHeight: tokens.fontSize.md * 1.5,
};

export const labelSans = {
  fontFamily: tokens.fonts.sansMedium,
  fontSize: tokens.fontSize.xs,
  color: tokens.colors.textMuted,
  letterSpacing: 1.5,
  textTransform: 'uppercase',
};

export const buttonSerif = {
  fontFamily: tokens.fonts.serifBold,
  fontSize: tokens.fontSize.md,
  color: tokens.colors.white,
  letterSpacing: 0.3,
};
