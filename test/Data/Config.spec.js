'use strict';

/* jshint ignore:start */
/* eslint-disable */
const mocha = require('mocha'),
    should = require('should');
/* eslint-enable */
/* jshint ignore:end */

const path = require('path');

const Config = require('../../src/Data/Config'),
    DataAbstract = require('../../src/Data/_Abstract');


describe('Config', () => {

    it('should be a Data type', () => {

        const config = new Config();

        config.should.be.an.instanceof(DataAbstract);

    });


    it('should be empty if no file is provided', () => {

        const config = new Config();

        config.clone.should.be.empty();

    });


    it('should load a configuration file if set', () => {

        const config = new Config(path.join(__dirname, '/resources/config.json'));

        config.get('debug').should.be.true();
        config.get('verbose').should.be.true();

    });

});
