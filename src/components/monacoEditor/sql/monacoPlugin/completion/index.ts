import * as reader from './reader';
import { createParser } from 'syntax-parser';
import { IStatements } from './types';
import { sqlTokenizer } from './lexer';
import { root } from './parser';

export { reader };
export * from './types';

export const sqlParser = createParser<IStatements>(root, sqlTokenizer, {
  cursorTokenExcludes: (token) => {
    return token?.value === '.' || token?.value === ':';
  },
});
