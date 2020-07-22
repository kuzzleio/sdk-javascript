'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.KuzzleError = void 0;
/**
 * Standard Kuzzle error.
 *
 * @see https://docs.kuzzle.io/core/2/api/essentials/error-handling/
 */
class KuzzleError extends Error {
    constructor(apiError) {
        super(apiError.message);
        this.status = apiError.status;
        this.stack = apiError.stack;
        this.id = apiError.id;
        this.code = apiError.code;
        // PartialError
        if (this.status === 206) {
            this.errors = apiError.errors;
            this.count = apiError.count;
        }
    }
}
exports.KuzzleError = KuzzleError;
module.exports = { KuzzleError };
//# sourceMappingURL=KuzzleError.js.map