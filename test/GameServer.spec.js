'use strict';

/* eslint no-magic-numbers: 0 */

/* jshint ignore:start */
/* eslint-disable */
const mocha = require('mocha'),
    should = require('should');
/* eslint-enable */
/* jshint ignore:end */

const ConfigServer = require('../src/Data/ConfigServer'),
    GameServer = require('../src/GameServer');


describe('GameServer', () => {

    it('should return zero after running', () => {

        const server = new GameServer();

        server.run().should.equal(0);

    });


    it('should create a ConfigServer if none is provided', () => {

        const server = new GameServer();

        server.config.should.be.instanceof(ConfigServer);

    });


    it('should use a provided ConfigServer', () => {

        const config = new ConfigServer();

        const server = new GameServer(config);

        server.config.should.equal(config);

    });

});
