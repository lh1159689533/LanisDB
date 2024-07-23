import { tokenTypes } from './tokenTypes';

const INDENT_TYPE_TOP_LEVEL = 'top-level';
const INDENT_TYPE_BLOCK_LEVEL = 'block-level';
const INDENT_TYPE_SPACE_LEVEL = 'space-level';

/**
 * Manages indentation levels.
 *
 * There are two types of indentation levels:
 *
 * - BLOCK_LEVEL : increased by open-parenthesis
 * - TOP_LEVEL : increased by RESERVED_TOP_LEVEL words
 */
export class Indentation {
  indent: string;
  space: string;
  indentTypes: string[];
  indentSpaceTypes: string[];

  /**
   * @param {String} indent Indent value, default is "  " (2 spaces)
   */
  constructor(indent: string) {
    this.indent = indent || '  ';
    this.space = ' ';
    this.indentTypes = [];
    this.indentSpaceTypes = [];
  }

  /**
   * Returns current indentation string.
   * @return {String}
   */
  getIndent(tokenType = '') {
    if ([tokenTypes.RESERVED_TOP_LEVEL, tokenTypes.RESERVED_TOP_LEVEL_NO_INDENT].includes(tokenType)) {
      return this.indent.repeat(this.indentTypes.length);
    }
    return this.indent.repeat(this.indentTypes.length) + this.space.repeat(this.indentSpaceTypes.length);
  }

  /**
   * Increases indentation by one top-level indent.
   */
  increaseTopLevel() {
    this.indentTypes.push(INDENT_TYPE_TOP_LEVEL);
  }

  /**
   * Increases indentation by one block-level indent.
   */
  increaseBlockLevel() {
    this.indentTypes.push(INDENT_TYPE_BLOCK_LEVEL);
  }

  increaseSpaceLevel(count = 1) {
    this.indentSpaceTypes.push(...new Array(count).fill(INDENT_TYPE_SPACE_LEVEL));
  }

  decreaseSpaceLevel() {
    // if (this.indentSpaceTypes.at(-1) === INDENT_TYPE_SPACE_LEVEL) {
    //   this.indentSpaceTypes.pop();
    // }
    this.indentSpaceTypes = [];
  }

  /**
   * Decreases indentation by one top-level indent.
   * Does nothing when the previous indent is not top-level.
   */
  decreaseTopLevel() {
    if (this.indentTypes.at(-1) === INDENT_TYPE_TOP_LEVEL) {
      this.indentTypes.pop();
    }
  }

  /**
   * Decreases indentation by one block-level indent.
   * If there are top-level indents within the block-level indent,
   * throws away these as well.
   */
  decreaseBlockLevel() {
    while (this.indentTypes.length > 0) {
      const type = this.indentTypes.pop();
      if (type !== INDENT_TYPE_TOP_LEVEL) {
        break;
      }
    }
  }

  resetIndentation() {
    this.indentTypes = [];
    this.indentSpaceTypes = [];
  }
}
