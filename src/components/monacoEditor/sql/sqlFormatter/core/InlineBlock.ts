// eslint-disable
import { tokenTypes } from './tokenTypes';

const INLINE_MAX_LENGTH = 120;

/**
 * Bookkeeper for inline blocks.
 *
 * Inline blocks are parenthesized expressions that are shorter than INLINE_MAX_LENGTH.
 * These blocks are formatted on a single line, unlike longer parenthesized
 * expressions where open-parenthesis causes newline and increase of indentation.
 */
export class InlineBlock {
  level: any;

  constructor() {
    this.level = 0;
  }

  /**
   * Begins inline block when lookahead through upcoming tokens determines
   * that the block would be smaller than INLINE_MAX_LENGTH.
   * @param  {Object[]} tokens Array of all tokens
   * @param  {Number} index Current token position
   */
  beginIfPossible(tokens: any, index: number) {
    if (this.level === 0 && this.isInlineBlock(tokens, index)) {
      this.level = 1;
    } else if (this.level > 0) {
      this.level += 1;
    } else {
      this.level = 0;
    }
  }

  /**
   * Finishes current inline block.
   * There might be several nested ones.
   */
  end() {
    this.level -= 1;
  }

  /**
   * True when inside an inline block
   * @return {Boolean}
   */
  isActive() {
    return this.level > 0;
  }

  // Check if this should be an inline parentheses block
  // Examples are "NOW()", "COUNT(*)", "int(10)", key(`some_column`), DECIMAL(7,2)
  isInlineBlock(tokens: any, index: number) {
    let length = 0;
    let level = 0;

    for (let i = index; i < tokens.length; i++) {
      const token = tokens[i];
      length += token.value.length;

      // Overran max length
      if (length > INLINE_MAX_LENGTH) {
        return false;
      }

      if (token.type === tokenTypes.OPEN_PAREN) {
        level += 1;
      } else if (token.type === tokenTypes.CLOSE_PAREN) {
        level -= 1;
        if (level === 0) {
          return true;
        }
      }

      if (this.isForbiddenToken(token)) {
        return false;
      }
    }
    return false;
  }

  // Reserved words that cause newlines, comments and semicolons
  // are not allowed inside inline parentheses block
  isForbiddenToken({ type, value }: any) {
    return (
      type === tokenTypes.RESERVED_TOP_LEVEL ||
      type === tokenTypes.RESERVED_TOP_LEVEL_NEWLINE ||
      type === tokenTypes.RESERVED_NEWLINE ||
      type === tokenTypes.COMMENT ||
      type === tokenTypes.BLOCK_COMMENT ||
      value === ';'
    );
  }
}
