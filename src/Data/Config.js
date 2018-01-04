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
     * @param {string} callback method to call after the configuration file has been loaded (optional)
     */
    constructor(file, callback) {

        super();

        if (file) {

            this.load(file, callback);

        }

    }

}

module.exports = Config;
