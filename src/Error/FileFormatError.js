'use strict';

/**
 * Error thrown when a file format is incorrect.
 */
class FileFormatError extends Error {

    constructor(message) {

        super(message);

        this.name = 'FileFormatError';

    }

}

module.exports = FileFormatError;
