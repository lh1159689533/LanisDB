import { tokenTypes } from './tokenTypes';
import { Indentation } from './Indentation';
import { InlineBlock } from './InlineBlock';
import { Params } from './Params';
import { Tokenizer } from './Tokenizer';
import { FormatOptions, IToken } from '../types';

const trimSpacesEnd = (str: string) => str.replace(/[ \t]+$/u, '');

export class Formatter {
  cfg: FormatOptions;
  indentation: Indentation;
  inlineBlock: InlineBlock;
  params: Params;
  tokenizer: Tokenizer;
  tokenOverride?: (token: IToken, previousReservedWord?: IToken) => IToken;
  previousReservedWord: IToken | null;
  tokens: IToken[];
  index: number;
  firstToken: IToken | null;
  // 是否在括号中
  inBrackets: number;

  constructor(
    cfg: FormatOptions,
    tokenizer: Tokenizer,
    tokenOverride?: (token: IToken, previousReservedWord?: IToken) => IToken
  ) {
    this.cfg = cfg;
    this.indentation = new Indentation(this.cfg.indent!);
    this.inlineBlock = new InlineBlock();
    this.params = new Params(this.cfg.params);
    this.tokenizer = tokenizer;
    this.tokenOverride = tokenOverride;
    this.previousReservedWord = null;
    this.tokens = [];
    this.index = 0;
    this.firstToken = null;
    this.inBrackets = 0;
  }

  /**
   * Formats whitespace in a SQL string to make it easier to read.
   *
   * @param {String} query The SQL query string
   * @return {String} formatted query
   */
  format(query: string) {
    this.tokens = this.tokenizer.tokenize(query);
    const formattedQuery = this.getFormattedQueryFromTokens();

    return formattedQuery.trim();
  }

  getFormattedQueryFromTokens() {
    let formattedQuery = '';

    this.tokens.forEach((token, index) => {
      this.index = index;

      if (this.tokenOverride) token = this.tokenOverride(token, this.previousReservedWord!) || token;

      if (token.type === tokenTypes.WHITESPACE) {
        // ignore (we do our own whitespace formatting)
      } else if (token.type === tokenTypes.LINE_COMMENT) {
        formattedQuery = this.formatLineComment(token, formattedQuery);
      } else if (token.type === tokenTypes.BLOCK_COMMENT) {
        formattedQuery = this.formatBlockComment(token, formattedQuery);
      } else if (token.type === tokenTypes.RESERVED_TOP_LEVEL) {
        if (!this.firstToken) {
          this.firstToken = token;
        }
        formattedQuery = this.formatTopLevelReservedWord(token, formattedQuery);
        this.previousReservedWord = token;
      } else if (token.type === tokenTypes.RESERVED_TOP_LEVEL_NEWLINE) {
        formattedQuery = this.formatTopLevelReservedWordNewline(token, formattedQuery);
        this.previousReservedWord = token;
      } else if (token.type === tokenTypes.RESERVED_TOP_LEVEL_NEWLINE_AND_NO_INDENT) {
        formattedQuery = this.formatTopLevelReservedWordNewlineAndNoIndent(token, formattedQuery);
        this.previousReservedWord = token;
      } else if (token.type === tokenTypes.RESERVED_TOP_LEVEL_NO_INDENT) {
        if (!this.firstToken) {
          this.firstToken = token;
        }
        formattedQuery = this.formatTopLevelReservedWordNoIndent(token, formattedQuery);
        this.previousReservedWord = token;
      } else if (token.type === tokenTypes.RESERVED_NEWLINE) {
        formattedQuery = this.formatNewlineReservedWord(token, formattedQuery);
        this.previousReservedWord = token;
      } else if (token.type === tokenTypes.RESERVED) {
        formattedQuery = this.formatWithSpaces(token, formattedQuery);
        this.previousReservedWord = token;
      } else if (token.type === tokenTypes.OPEN_PAREN) {
        formattedQuery = this.formatOpeningParentheses(token, formattedQuery);
      } else if (token.type === tokenTypes.CLOSE_PAREN) {
        formattedQuery = this.formatClosingParentheses(token, formattedQuery);
      } else if (token.type === tokenTypes.PLACEHOLDER) {
        formattedQuery = this.formatPlaceholder(token, formattedQuery);
      } else if (token.value === ',') {
        formattedQuery = this.formatComma(token, formattedQuery);
      } else if (token.value === ':') {
        formattedQuery = this.formatWithSpaceAfter(token, formattedQuery);
      } else if (token.value === '.') {
        formattedQuery = this.formatWithoutSpaces(token, formattedQuery);
      } else if (token.value === ';') {
        formattedQuery = this.formatQuerySeparator(token, formattedQuery);
      } else {
        formattedQuery = this.formatWithSpaces(token, formattedQuery);
      }
    });
    return formattedQuery;
  }

  formatLineComment(token: any, query: any) {
    return this.addNewline(token, `${query}${token.value}`);
  }

  formatBlockComment(token: any, query: any) {
    return this.addNewline(token, this.addNewline(token, query) + this.indentComment(token.value));
  }

  indentComment(comment: any) {
    return comment.replace(/\n[ \t]*/gu, `\n${this.indentation.getIndent()} `);
  }

  formatTopLevelReservedWordNoIndent(token: any, query: any) {
    this.indentation.decreaseTopLevel();
    this.indentation.decreaseTopLevel();
    this.indentation.decreaseSpaceLevel();

    query = this.addNewline(token, query);

    const tokenValue = this.equalizeWhitespace(this.formatReservedWord(token.value));
    const indent = this.indentation.indent.length;

    if (tokenValue.length >= indent * 2 || this.firstToken?.value === token.value) {
      query += `${tokenValue} `;
    } else {
      query += tokenValue.padEnd(indent * 2, ' ');
    }

    return query;
  }

  formatTopLevelReservedWordNewlineAndNoIndent(token: any, query: any) {
    this.indentation.decreaseTopLevel();
    this.indentation.decreaseTopLevel();
    this.indentation.decreaseSpaceLevel();
    query = this.addNewline(token, query) + this.equalizeWhitespace(this.formatReservedWord(token.value));
    return this.addNewline(token, query);
  }

  formatTopLevelReservedWord(token: any, query: any) {
    this.indentation.decreaseTopLevel();
    this.indentation.decreaseTopLevel();
    this.indentation.decreaseSpaceLevel();

    query = this.addNewline(token, query);
    /**
     * 增加2个缩进保持对齐
     * select  name,
     *         age,
     * create table不需要
     * CREATE TABLE users (
     *     id INT PRIMARY KEY,
     *     name VARCHAR(255) NOT NULL,
     */
    this.indentation.increaseTopLevel();
    this.indentation.increaseTopLevel();

    const tokenValue = this.equalizeWhitespace(this.formatReservedWord(token.value));
    const indent = this.indentation.indent.length;

    if (tokenValue.length >= indent * 2) {
      query += `${tokenValue} `;

      const indentTotal = this.indentation.getIndent().length;
      if (tokenValue.length >= indentTotal) {
        /**
         * 当语句的长度大于2个缩进时，超出的部分用空格替代保持对齐
         * ORDER BY users.name,
         *          row_num
         */
        this.indentation.increaseSpaceLevel(tokenValue.length + 1 - indentTotal);
      }
    } else {
      query += tokenValue.padEnd(indent * 2, ' ');
    }

    return query;
  }

  formatTopLevelReservedWordNewline(token: any, query: any) {
    this.indentation.decreaseTopLevel();

    query = this.addNewline(token, query);

    this.indentation.increaseTopLevel();

    query += this.equalizeWhitespace(this.formatReservedWord(token.value));

    return this.addNewline(token, query);
  }

  formatNewlineReservedWord(token: any, query: any) {
    return `${this.addNewline(token, query)}${this.equalizeWhitespace(this.formatReservedWord(token.value))} `;
  }

  // Replace any sequence of whitespace characters with single space
  equalizeWhitespace(string: any) {
    return string.replace(/\s+/gu, ' ');
  }

  // Opening parentheses increase the block indent level and start a new line
  formatOpeningParentheses(token: any, query: any) {
    // Take out the preceding space unless there was whitespace there in the original query
    // or another opening parens or line comment
    const preserveWhitespaceFor = [tokenTypes.WHITESPACE, tokenTypes.OPEN_PAREN, tokenTypes.LINE_COMMENT];
    if (!preserveWhitespaceFor.includes(this.previousToken()?.type)) {
      query = trimSpacesEnd(query);
    }
    query += this.cfg.uppercase ? token.value.toUpperCase() : token.value;

    if (token.value.toLowerCase() === 'case') {
      query += ' ';
      if (this.inBrackets === 0) {
        this.indentation.increaseBlockLevel();
        return this.addNewline(token, query);
      }
      return query;
    }

    this.inlineBlock.beginIfPossible(this.tokens, this.index);

    if (!this.inlineBlock.isActive()) {
      this.indentation.increaseBlockLevel();
      query = this.addNewline(token, query);
    }

    if (token.value.toLowerCase() !== 'case') {
      this.inBrackets += 1;
    }

    return query;
  }

  // Closing parentheses decrease the block indent level
  formatClosingParentheses(token: any, query: any) {
    if (token.value.toLowerCase() !== 'end') {
      this.inBrackets -= 1;
    }
    token.value = this.cfg.uppercase ? token.value.toUpperCase() : token.value;

    if (token.value.toLowerCase() === 'end') {
      if (this.inBrackets === 0) {
        this.indentation.decreaseBlockLevel();
        return this.formatWithSpaces(token, this.addNewline(token, query));
      }
      token.value = ` ${token.value}`;
      return this.formatWithSpaceAfter(token, query);
    }
    if (this.inlineBlock.isActive()) {
      this.inlineBlock.end();
      return this.formatWithSpaceAfter(token, query);
    }
    this.indentation.decreaseBlockLevel();
    return this.formatWithSpaces(token, this.addNewline(token, query));
  }

  formatPlaceholder(token: any, query: any) {
    return `${query}${this.params.get(token)} `;
  }

  // Commas start a new line (unless within inline parentheses or SQL "LIMIT" clause)
  // formatComma(token, query) {
  //   query = `${trimSpacesEnd(query)}${token.value} `;

  //   if (this.inlineBlock.isActive()) {
  //     return query;
  //   } else if (/^LIMIT$/iu.test(this.previousReservedWord.value)) {
  //     return query;
  //   } else {
  //     return this.addNewline(token, query);
  //   }
  // }
  formatComma(token: any, query: any) {
    if (trimSpacesEnd(query)[trimSpacesEnd(query).length - 1] === '\n') {
      let count = 0;
      let inComment = false;
      for (let i = this.index - 1; i > 0; i--) {
        if (![tokenTypes.WHITESPACE, tokenTypes.LINE_COMMENT].includes(this.tokens[i].type)) {
          break;
        }
        if (this.tokens[i].type === tokenTypes.LINE_COMMENT) {
          count += this.tokens[i].value.length;
          inComment = true;
        }
        if (inComment && this.tokens[i].type === tokenTypes.WHITESPACE) {
          count += this.tokens[i].value.length;
        }
      }
      const start = trimSpacesEnd(query).length - count;
      const end = start + 1;
      let newQuery = '';
      newQuery = query.slice(0, start);
      newQuery += `${token.value} `;
      newQuery += query.slice(end);
      return newQuery;
    }

    query = `${trimSpacesEnd(query)}${token.value} `;

    if (this.inlineBlock.isActive()) {
      return query;
    }
    if (this.previousReservedWord?.value && /^LIMIT$/iu.test(this.previousReservedWord.value)) {
      return query;
    }
    let index = this.index + 1;
    let nextToken = this.tokens[index];
    while (nextToken.type === tokenTypes.WHITESPACE) {
      index += 1;
      nextToken = this.tokens[index];
    }
    if (nextToken.type === tokenTypes.LINE_COMMENT) {
      return query;
    }
    return this.addNewline(token, query);
  }

  formatWithSpaceAfter(token: any, query: any) {
    return `${trimSpacesEnd(query)}${token.value} `;
  }

  formatWithoutSpaces(token: any, query: any) {
    return trimSpacesEnd(query) + token.value;
  }

  formatWithSpaces(token: any, query: any) {
    const value = token.type === 'reserved' ? this.formatReservedWord(token.value) : token.value;
    return `${query}${value} `;
  }

  formatReservedWord(value: any) {
    return this.cfg.uppercase ? value.toUpperCase() : value;
  }

  formatQuerySeparator(token: any, query: any) {
    this.firstToken = null;
    this.indentation.resetIndentation();
    return trimSpacesEnd(query) + token.value + '\n'.repeat(this.cfg.linesBetweenQueries || 1);
  }

  addNewline(token: any, query: any) {
    query = trimSpacesEnd(query);
    if (!query.endsWith('\n')) query += '\n';
    return query + this.indentation.getIndent(token.type);
  }

  previousToken(offset = 1) {
    return this.tokens[this.index - offset];
  }
}
