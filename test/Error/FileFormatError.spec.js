'use strict';

/* jshint ignore:start */
/* eslint-disable */
const mocha = require('mocha'),
    should = require('should');
/* eslint-enable */
/* jshint ignore:end */

const FileFormatError = require('../../src/Error/FileFormatError');


describe('FileFormatError', () => {

    it('should be an instance of Error', () => {

        const err = new FileFormatError();

        err.should.be.an.instanceof(Error);

    });

    it('should override the default name', () => {

        const err = new FileFormatError();

        err.name.should.equal('FileFormatError');

    });

    it('should store a provided message', () => {

        const err = new FileFormatError('foobar');

        err.message.should.equal('foobar');

    });

});
