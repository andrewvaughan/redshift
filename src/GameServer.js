'use strict';

const ConfigServer = require('./Data/ConfigServer');


/**
 * Manages configuration for the Redshift server.
 */
class GameServer {

    /**
     * Creates a GameServer.
     *
     * @param {ConfigServer} config ConfigServer object for the server to use, optional
     */
    constructor(config) {

        // Create a server config if one is not provided
        if (!config) {

            config = new ConfigServer();

        }

        this.config = config;

    }


    /**
     * Starts the game server.
     *
     * @returns {integer} exit status code
     */
    run() {

        return 0;   // eslint-disable-line no-magic-numbers

    }

}

module.exports = GameServer;
