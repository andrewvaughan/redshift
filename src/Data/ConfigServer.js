'use strict';

const Config = require('./Config.js');


/**
 * Manages server configuration for the Redshift server.
 */
class ConfigServer extends Config {

    /**
     * Creates a configuration file and, optionally, loads a file into the config.  Will set default parameters for
     * the Redshift server.
     *
     * @param {string} file the configuration file to load (optional)
     * @param {string} callback method to call after the configuration file has been loaded (optional)
     */
    constructor(file, callback) {

        super();

        // Server defaults
        this.set('debug', false);
        this.set('verbose', false);

        if (file) {

            this.load(file, callback);

        }

    }

}

module.exports = ConfigServer;
