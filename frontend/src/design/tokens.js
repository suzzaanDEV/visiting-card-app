import { themeColors } from './theme';
import { spacing } from './spacing';
import { typography } from './typography';
import { shadows } from './shadows';
import { variants, transitions } from './animations';

export const tokens = {
  colors: themeColors,
  spacing,
  typography,
  shadows,
  animations: {
    variants,
    transitions
  }
};

export default tokens;
export { themeColors, spacing, typography, shadows, variants, transitions };
