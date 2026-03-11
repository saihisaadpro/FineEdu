import { config } from '../../config.js';
import * as v1 from './v1.js';

const versions: Record<string, typeof v1> = { v1 };

export const activePrompts = versions[config.PROMPT_VERSION] ?? v1;
