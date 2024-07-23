// eslint-disable
import { tokenTypes } from './tokenTypes';
import { IToken } from '../types';

// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_expressions#escaping
const escapeRegExp = (str: string) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export class Tokenizer {
  WHITESPACE_REGEX: RegExp;
  NUMBER_REGEX: RegExp;
  OPERATOR_REGEX: RegExp;
  BLOCK_COMMENT_REGEX: RegExp;
  LINE_COMMENT_REGEX: RegExp;
  RESERVED_TOP_LEVEL_REGEX: RegExp | null;
  RESERVED_TOP_LEVEL_NEWLINE_REGEX: RegExp | null;
  RESERVED_TOP_LEVEL_NO_INDENT_REGEX: RegExp | null;
  RESERVED_TOP_LEVEL_NEWLINE_AND_NO_INDENT_REGEX: RegExp | null;
  RESERVED_NEWLINE_REGEX: RegExp | null;
  RESERVED_PLAIN_REGEX: RegExp | null;
  WORD_REGEX: RegExp | null;
  STRING_REGEX: RegExp | null;
  OPEN_PAREN_REGEX: RegExp | null;
  CLOSE_PAREN_REGEX: RegExp | null;
  INDEXED_PLACEHOLDER_REGEX: boolean | RegExp;
  IDENT_NAMED_PLACEHOLDER_REGEX: boolean | RegExp;
  STRING_NAMED_PLACEHOLDER_REGEX: boolean | RegExp;
  /**
   * @param {Object} cfg
   *  @param {String[]} cfg.reservedWords Reserved words in SQL
   *  @param {String[]} cfg.reservedTopLevelWords Words that are set to new line separately
   *  @param {String[]} cfg.reservedNewlineWords Words that are set to newline
   *  @param {String[]} cfg.reservedTopLevelWordsNoIndent Words that are top level but have no indentation
   *  @param {String[]} cfg.stringTypes String types to enable: "", '', ``, [], N''
   *  @param {String[]} cfg.openParens Opening parentheses to enable, like (, [
   *  @param {String[]} cfg.closeParens Closing parentheses to enable, like ), ]
   *  @param {String[]} cfg.indexedPlaceholderTypes Prefixes for indexed placeholders, like ?
   *  @param {String[]} cfg.namedPlaceholderTypes Prefixes for named placeholders, like @ and :
   *  @param {String[]} cfg.lineCommentTypes Line comments to enable, like # and --
   *  @param {String[]} cfg.specialWordChars Special chars that can be found inside of words, like @ and #
   */
  constructor(cfg: any) {
    this.WHITESPACE_REGEX = /^(\s+)/u;
    this.NUMBER_REGEX = /^((-\s*)?[0-9]+(\.[0-9]+)?|0x[0-9a-fA-F]+|0b[01]+)\b/u;
    this.OPERATOR_REGEX = /^(!=|<>|==|<=|>=|!<|!>|\|\||::|->>|->|~~\*|~~|!~~\*|!~~|~\*|!~\*|!~|:=|.)/u;

    this.BLOCK_COMMENT_REGEX = /^(\/\*[^]*?(?:\*\/|$))/u;
    this.LINE_COMMENT_REGEX = this.createLineCommentRegex(cfg.lineCommentTypes);

    this.RESERVED_TOP_LEVEL_REGEX = this.createReservedWordRegex(cfg.reservedTopLevelWords);
    this.RESERVED_TOP_LEVEL_NEWLINE_REGEX = this.createReservedWordRegex(cfg.reservedTopLevelWordsNewline);
    this.RESERVED_TOP_LEVEL_NO_INDENT_REGEX = this.createReservedWordRegex(cfg.reservedTopLevelWordsNoIndent);
    this.RESERVED_TOP_LEVEL_NEWLINE_AND_NO_INDENT_REGEX = this.createReservedWordRegex(
      cfg.reservedTopLevelWordsNewlineAndNoIndent
    );
    this.RESERVED_NEWLINE_REGEX = this.createReservedWordRegex(cfg.reservedNewlineWords);
    this.RESERVED_PLAIN_REGEX = this.createReservedWordRegex(cfg.reservedWords);

    this.WORD_REGEX = this.createWordRegex(cfg.specialWordChars);
    this.STRING_REGEX = this.createStringRegex(cfg.stringTypes);

    this.OPEN_PAREN_REGEX = this.createParenRegex(cfg.openParens);
    this.CLOSE_PAREN_REGEX = this.createParenRegex(cfg.closeParens);

    this.INDEXED_PLACEHOLDER_REGEX = this.createPlaceholderRegex(cfg.indexedPlaceholderTypes, '[0-9]*');
    this.IDENT_NAMED_PLACEHOLDER_REGEX = this.createPlaceholderRegex(cfg.namedPlaceholderTypes, '[a-zA-Z0-9._$]+');
    this.STRING_NAMED_PLACEHOLDER_REGEX = this.createPlaceholderRegex(
      cfg.namedPlaceholderTypes,
      this.createStringPattern(cfg.stringTypes)
    );
  }

  createLineCommentRegex(lineCommentTypes: any[]) {
    return new RegExp(`^((?:${lineCommentTypes.map((c) => escapeRegExp(c)).join('|')}).*?(?:\r\n|\r|\n|$))`, 'u');
  }

  createReservedWordRegex(reservedWords: any[]) {
    if (!reservedWords?.length) return null;
    const reservedWordsPattern = reservedWords.join('|').replace(/ /gu, '\\s+');
    return new RegExp(`^(${reservedWordsPattern})\\b`, 'iu');
  }

  createWordRegex(specialChars = []) {
    return new RegExp(
      `^([\\p{Alphabetic}\\p{Mark}\\p{Decimal_Number}\\p{Connector_Punctuation}\\p{Join_Control}${specialChars.join(
        ''
      )}]+)`,
      'u'
    );
  }

  createStringRegex(stringTypes: any) {
    return new RegExp(`^(${this.createStringPattern(stringTypes)})`, 'u');
  }

  // This enables the following string patterns:
  // 1. backtick quoted string using `` to escape
  // 2. square bracket quoted string (SQL Server) using ]] to escape
  // 3. double quoted string using "" or \" to escape
  // 4. single quoted string using '' or \' to escape
  // 5. national character quoted string using N'' or N\' to escape
  createStringPattern(stringTypes: string[]) {
    const patterns: any = {
      '``': '((`[^`]*($|`))+)',
      '[]': '((\\[[^\\]]*($|\\]))(\\][^\\]]*($|\\]))*)',
      '""': '(("[^"\\\\]*(?:\\\\.[^"\\\\]*)*("|$))+)',
      // eslint-disable-next-line
      "''": "(('[^'\\\\]*(?:\\\\.[^'\\\\]*)*('|$))+)",
      // eslint-disable-next-line
      "N''": "((N'[^N'\\\\]*(?:\\\\.[^N'\\\\]*)*('|$))+)",
      '${}': '(^\\$\\{[^\\}]*($|\\}))',
    };

    return stringTypes.map((t) => patterns[t]).join('|');
  }

  createParenRegex(parens: any[]) {
    return new RegExp(`^(${parens.map((p) => this.escapeParen(p)).join('|')})`, 'iu');
  }

  escapeParen(paren: any) {
    if (paren.length === 1) {
      // A single punctuation character
      return escapeRegExp(paren);
    }
    // longer word
    return `\\b${paren}\\b`;
  }

  createPlaceholderRegex(types: any, pattern: any) {
    if (types == null) {
      return false;
    }
    const typesRegex = types.map(escapeRegExp).join('|');

    return new RegExp(`^((?:${typesRegex})(?:${pattern}))`, 'u');
  }

  /**
   * Takes a SQL string and breaks it into tokens.
   * Each token is an object with type and value.
   *
   * @param {String} input The SQL string
   * @return {Object[]} tokens An array of tokens.
   *  @return {String} token.type
   *  @return {String} token.value
   */
  tokenize(input: string): IToken[] {
    if (!input) return [];

    const tokens = [];
    let token;

    // Keep processing the string until it is empty
    while (input.length) {
      // Get the next token and the token type
      token = this.getNextToken(input, token);
      // Advance the string
      input = input.substring(token.value.length);

      tokens.push(token);
    }
    return tokens;
  }

  getNextToken(input: string, previousToken?: IToken): IToken {
    return (
      this.getWhitespaceToken(input) ||
      this.getCommentToken(input) ||
      this.getStringToken(input) ||
      this.getOpenParenToken(input) ||
      this.getCloseParenToken(input) ||
      this.getPlaceholderToken(input) ||
      this.getNumberToken(input) ||
      this.getReservedWordToken(input, previousToken) ||
      this.getWordToken(input) ||
      this.getOperatorToken(input)
    );
  }

  getWhitespaceToken(input: string): IToken | null {
    return this.getTokenOnFirstMatch({
      input,
      type: tokenTypes.WHITESPACE,
      regex: this.WHITESPACE_REGEX,
    });
  }

  getCommentToken(input: string): IToken | null {
    return this.getLineCommentToken(input) || this.getBlockCommentToken(input);
  }

  getLineCommentToken(input: string): IToken | null {
    return this.getTokenOnFirstMatch({
      input,
      type: tokenTypes.LINE_COMMENT,
      regex: this.LINE_COMMENT_REGEX,
    });
  }

  getBlockCommentToken(input: string): IToken | null {
    return this.getTokenOnFirstMatch({
      input,
      type: tokenTypes.BLOCK_COMMENT,
      regex: this.BLOCK_COMMENT_REGEX,
    });
  }

  getStringToken(input: string): IToken | null {
    return this.getTokenOnFirstMatch({
      input,
      type: tokenTypes.STRING,
      regex: this.STRING_REGEX,
    });
  }

  getOpenParenToken(input: string): IToken | null {
    return this.getTokenOnFirstMatch({
      input,
      type: tokenTypes.OPEN_PAREN,
      regex: this.OPEN_PAREN_REGEX,
    });
  }

  getCloseParenToken(input: string): IToken | null {
    return this.getTokenOnFirstMatch({
      input,
      type: tokenTypes.CLOSE_PAREN,
      regex: this.CLOSE_PAREN_REGEX,
    });
  }

  getPlaceholderToken(input: string): IToken {
    return (
      this.getIdentNamedPlaceholderToken(input) ||
      this.getStringNamedPlaceholderToken(input) ||
      this.getIndexedPlaceholderToken(input)
    );
  }

  getIdentNamedPlaceholderToken(input: string): IToken {
    return this.getPlaceholderTokenWithKey({
      input,
      regex: this.IDENT_NAMED_PLACEHOLDER_REGEX,
      parseKey: (v: any) => v.slice(1),
    });
  }

  getStringNamedPlaceholderToken(input: string): IToken {
    return this.getPlaceholderTokenWithKey({
      input,
      regex: this.STRING_NAMED_PLACEHOLDER_REGEX,
      parseKey: (v: any) => this.getEscapedPlaceholderKey({ key: v.slice(2, -1), quoteChar: v.slice(-1) }),
    });
  }

  getIndexedPlaceholderToken(input: string): IToken {
    return this.getPlaceholderTokenWithKey({
      input,
      regex: this.INDEXED_PLACEHOLDER_REGEX,
      parseKey: (v: any) => v.slice(1),
    });
  }

  getPlaceholderTokenWithKey({ input, regex, parseKey }: any) {
    const token: any = this.getTokenOnFirstMatch({ input, regex, type: tokenTypes.PLACEHOLDER });
    if (token) {
      token.key = parseKey(token.value);
    }
    return token;
  }

  getEscapedPlaceholderKey({ key, quoteChar }: any) {
    return key.replace(new RegExp(escapeRegExp(`\\${quoteChar}`), 'gu'), quoteChar);
  }

  // Decimal, binary, or hex numbers
  getNumberToken(input: string): IToken | null {
    return this.getTokenOnFirstMatch({
      input,
      type: tokenTypes.NUMBER,
      regex: this.NUMBER_REGEX,
    });
  }

  // Punctuation and symbols
  getOperatorToken(input: string): IToken | null {
    return this.getTokenOnFirstMatch({
      input,
      type: tokenTypes.OPERATOR,
      regex: this.OPERATOR_REGEX,
    });
  }

  getReservedWordToken(input: string, previousToken?: IToken): IToken | null {
    // A reserved word cannot be preceded by a "."
    // this makes it so in "my_table.from", "from" is not considered a reserved word
    if (previousToken?.value === '.') {
      return null;
    }
    return (
      this.getTopLevelReservedToken(input) ||
      this.getTopLevelReservedTokenNewline(input) ||
      this.getNewlineReservedToken(input) ||
      this.getTopLevelReservedTokenNoIndent(input) ||
      this.getTopLevelReservedTokenNewlineAndNoIndent(input) ||
      this.getPlainReservedToken(input)
    );
  }

  getTopLevelReservedToken(input: string): IToken | null {
    return this.getTokenOnFirstMatch({
      input,
      type: tokenTypes.RESERVED_TOP_LEVEL,
      regex: this.RESERVED_TOP_LEVEL_REGEX,
    });
  }

  getTopLevelReservedTokenNewline(input: string): IToken | null {
    return this.getTokenOnFirstMatch({
      input,
      type: tokenTypes.RESERVED_TOP_LEVEL_NEWLINE,
      regex: this.RESERVED_TOP_LEVEL_NEWLINE_REGEX,
    });
  }

  getNewlineReservedToken(input: string): IToken | null {
    return this.getTokenOnFirstMatch({
      input,
      type: tokenTypes.RESERVED_NEWLINE,
      regex: this.RESERVED_NEWLINE_REGEX,
    });
  }

  getTopLevelReservedTokenNoIndent(input: string): IToken | null {
    return this.getTokenOnFirstMatch({
      input,
      type: tokenTypes.RESERVED_TOP_LEVEL_NO_INDENT,
      regex: this.RESERVED_TOP_LEVEL_NO_INDENT_REGEX,
    });
  }

  getTopLevelReservedTokenNewlineAndNoIndent(input: string): IToken | null {
    return this.getTokenOnFirstMatch({
      input,
      type: tokenTypes.RESERVED_TOP_LEVEL_NEWLINE_AND_NO_INDENT,
      regex: this.RESERVED_TOP_LEVEL_NEWLINE_AND_NO_INDENT_REGEX,
    });
  }

  getPlainReservedToken(input: string): IToken | null {
    return this.getTokenOnFirstMatch({
      input,
      type: tokenTypes.RESERVED,
      regex: this.RESERVED_PLAIN_REGEX,
    });
  }

  getWordToken(input: string): IToken | null {
    return this.getTokenOnFirstMatch({
      input,
      type: tokenTypes.WORD,
      regex: this.WORD_REGEX,
    });
  }

  getTokenOnFirstMatch({ input, type, regex }: any): IToken | null {
    const matches = input.match(regex);

    if (matches) {
      return { type, value: matches[1] };
    }
    return null;
  }
}
