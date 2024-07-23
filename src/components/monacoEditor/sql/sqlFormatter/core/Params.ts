/**
 * Handles placeholder replacement with given params.
 */
export class Params {
  params: any;
  index: any;

  /**
   * @param {Object} params
   */
  constructor(params: any) {
    this.params = params;
    this.index = 0;
  }

  /**
   * Returns param value that matches given placeholder with param key.
   * @param {Object} token
   *   @param {String} token.key Placeholder key
   *   @param {String} token.value Placeholder value
   * @return {String} param or token.value when params are missing
   */
  get({ key, value }: any) {
    if (!this.params) {
      return value;
    }
    if (key) {
      return this.params[key];
    }
    const param = this.params[this.index];
    this.index += 1;
    return param;
  }
}
