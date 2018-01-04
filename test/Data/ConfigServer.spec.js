'use strict';

/* jshint ignore:start */
/* eslint-disable */
const mocha = require('mocha'),
    should = require('should');
/* eslint-enable */
/* jshint ignore:end */

const path = require('path');

const Config = require('../../src/Data/Config'),
    ConfigServer = require('../../src/Data/ConfigServer');


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


    it('should load a configuration file, if set', (done) => {

        const config = new ConfigServer(
            path.join(__dirname, '/resources/config.json'),
            () => {

                config.get('debug').should.be.true();
                config.get('verbose').should.be.true();
                done();

            }
        );

    });

});
