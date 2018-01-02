'use strict';

/* jshint ignore:start */
/* eslint-disable */
const mocha = require('mocha'),
    should = require('should');
/* eslint-enable */
/* jshint ignore:end */

const path = require('path');

const ConfigServer = require('../../src/Data/ConfigServer'),
    Config = require('../../src/Data/Config');


describe('ConfigServer', () => {

    it('should be a Config type', () => {

        const config = new ConfigServer();

        config.should.be.an.instanceof(Config);

    });


    it('should have debugging defaults set', () => {

        const config = new ConfigServer();

        config.get('debug').should.be.false();
        config.get('verbose').should.be.false();

    });


    it('should load a configuration file if set', () => {

        const config = new ConfigServer(path.join(__dirname, '/resources/config.json'));

        config.get('debug').should.be.true();
        config.get('verbose').should.be.true();

    });

});
