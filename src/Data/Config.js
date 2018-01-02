'use strict';

const DataAbstract = require('./_Abstract.js');


/**
 * Manages a series of configuration settings.
 */
class Config extends DataAbstract {

    /**
     * Creates a configuration file and, optionally, loads a file into the config.
     *
     * @param {string} file the configuration file to load (optional)
     */
    constructor(file) {

        super();

        if (file) {

            this.loadSync(file);

        }

    }

}

module.exports = Config;
