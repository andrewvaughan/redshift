'use strict';

/* eslint no-sync: 0 */

/* jshint ignore:start */
/* eslint-disable */
const mocha = require('mocha'),
    should = require('should');
/* eslint-enable */
/* jshint ignore:end */

const fs = require('fs'),
    path = require('path'),
    tmp = require('tmp'),
    xml = require('xml2js'),
    yaml = require('js-yaml');

const DataAbstract = require('../../src/Data/_Abstract'),
    FileFormatError = require('../../src/Error/FileFormatError');


/* Test Helpers *****************************************************************************************************/

const testEmpty = (dataStore) => {

    dataStore.length.should.equal(0);       /* eslint no-magic-numbers: 0 */
    JSON.stringify(dataStore.clone).should.equal(JSON.stringify({}));

};

const testObject = (dataStore, obj) => {

    dataStore.length.should.equal(Object.keys(obj).length);
    JSON.stringify(dataStore.clone).should.equal(JSON.stringify(obj));

};


/* ******************************************************************************************************************/

describe('Data object', () => {

    let fileObject = {};

    beforeEach(() => {

        fileObject = {
            foo     : 'bar',
            complex : {
                alpha   : 1,
                bravo   : false,
                charlie : [
                    1,
                    2,
                    3
                ],
                delta : {
                    alpha : 1,
                    bravo : 2
                }
            }
        };

    });


    /* Constructor **************************************************************************************************/

    describe('constructor', () => {

        it('should work without starting object', () => {

            const dataStore = new DataAbstract();

            testEmpty(dataStore);

        });

        it('should apply a starting object', () => {

            const data = {
                foo   : 'bar',
                abc   : 123,
                truth : false
            };

            const dataStore = new DataAbstract(data);

            testObject(dataStore, data);

        });

        it('should store starting objects by reference', () => {

            const data = {
                foo   : 'bar',
                abc   : 123,
                truth : false
            };

            const dataStore = new DataAbstract(data);

            testObject(dataStore, data);

            dataStore.get('foo').should.equal('bar');
            should.not.exist(dataStore.get('pepperoni'));

            data.foo = 'pepperoni';
            data.pepperoni = 'pineapple';

            testObject(dataStore, data);

            dataStore.get('foo').should.equal('pepperoni');
            dataStore.get('pepperoni').should.equal('pineapple');

        });

    });


    /* Getters ******************************************************************************************************/

    describe('getters', () => {

        it('should return data with explicit call', () => {

            const dataStore = new DataAbstract({

                foo : 'bar'

            });

            dataStore.get('foo').should.equal('bar');

        });

        it('should return undefined if missing key on with explicit call', () => {

            const dataStore = new DataAbstract();

            should.not.exist(dataStore.get('foo'));

        });

        it('should return a fallback for a bad key with explicit call', () => {

            const dataStore = new DataAbstract();

            dataStore.get('foo', 'default').should.equal('default');

        });

    });


    /* Setters ******************************************************************************************************/

    describe('setters', () => {

        it('should set a key properly with explicit call', () => {

            const dataStore = new DataAbstract();

            should.not.exist(dataStore.get('foo'));

            dataStore.set('foo', 'bar');
            dataStore.get('foo').should.equal('bar');

        });

        it('should override a key value with explicit call', () => {

            const dataStore = new DataAbstract();

            should.not.exist(dataStore.foo);

            dataStore.set('foo', 'bar');
            dataStore.get('foo').should.equal('bar');

            dataStore.set('foo', 123);
            dataStore.get('foo').should.equal(123);

        });

    });


    /* Clear ********************************************************************************************************/

    describe('clear', () => {

        it('should clear an empty data set successfully', () => {

            const dataStore = new DataAbstract();

            testEmpty(dataStore);

            dataStore.clear();
            dataStore.length.should.equal(0);

        });

        it('should clear a complex data set successfully', () => {

            const dataStore = new DataAbstract();

            dataStore.length.should.equal(0);

            dataStore.set('foo', 'bar');
            dataStore.length.should.equal(1);

            dataStore.clear();
            dataStore.length.should.equal(0);

        });

    });


    /* Length *******************************************************************************************************/

    describe('length', () => {

        it('should properly return the data size', () => {

            const dataStore = new DataAbstract();

            dataStore.length.should.equal(0);

            dataStore.set('foo', 'bar');
            dataStore.length.should.equal(1);

            dataStore.set('abc', 123);
            dataStore.length.should.equal(2);

            dataStore.set('truths', false);
            dataStore.length.should.equal(3);

            dataStore.set('obj', {});
            dataStore.length.should.equal(4);

            dataStore.get('obj').foo = 'bar';
            dataStore.length.should.equal(4);

            dataStore.get('obj').abc = '123';
            dataStore.length.should.equal(4);

        });

    });


    /* Clone ********************************************************************************************************/

    describe('clone', () => {

        it('should exactly match the given configuration', () => {

            const obj = {
                alpha   : 'b',
                bravo   : 2,
                charlie : false
            };

            const dataStore = new DataAbstract(obj);

            const clone = dataStore.clone;

            JSON.stringify(obj).should.equal(JSON.stringify(clone));

        });

        it('should create a new object', () => {

            const obj = {
                alpha   : 'b',
                bravo   : 2,
                charlie : false
            };

            const dataStore = new DataAbstract(obj);

            const clone = dataStore.clone;

            obj.alpha = 'foo';

            dataStore.clone.alpha.should.equal('foo');
            clone.alpha.should.equal('b');

        });

    });


    /* Asynchronous *************************************************************************************************/

    describe('asynchronous', () => {

        describe('JSON file loading', () => {

            it('should throw an error if the file is missing', (done) => {

                const dataStore = new DataAbstract();
                const file = '/tmp/this/is/a/bad/asdfasdf/bad.file.json';

                dataStore.loadJSON(file, (err) => {

                    if (err) {

                        if (String(err).includes('ENOENT')) {

                            done();

                            return;

                        }

                        done(err);

                        return;

                    }

                    done(new Error(`Expected error for bad file: ${file}`));

                });

            });

            it('should throw an error if the file cannot be read', (done) => {

                const dataStore = new DataAbstract();

                const file = tmp.fileSync({
                    mode              : 45,
                    postfix           : '.json',
                    discardDescriptor : true
                });

                dataStore.loadJSON(file.name, (err) => {

                    if (err) {

                        if (String(err).includes('EACCES')) {

                            done();

                            return;

                        }

                        done(err);

                        return;

                    }

                    done(new Error(`Expected error for inaccessible file: ${file.name}`));

                });

            });

            it('should throw an error if given an invalid format', (done) => {

                const dataStore = new DataAbstract();
                const file = path.join(__dirname, '/resources/badformat.json');

                dataStore.loadJSON(file, (err, data) => {

                    if (err) {

                        if (String(err).includes('SyntaxError')) {

                            data.should.be.empty();

                            done();

                            return;

                        }

                        done(err);

                        return;

                    }

                    done(new Error(`Expected invalid format: ${file}`));

                });

            });

            it('should load a blank file', (done) => {

                const dataStore = new DataAbstract();
                const file = path.join(__dirname, '/resources/blank');

                testEmpty(dataStore);

                dataStore.loadJSON(file, (err, data) => {

                    if (err) {

                        done(err);

                        return;

                    }

                    data.should.be.empty();

                    testEmpty(dataStore);

                    done();

                });

            });

            it('should load into a blank object', (done) => {

                const dataStore = new DataAbstract();

                testEmpty(dataStore);

                dataStore.loadJSON(path.join(__dirname, '/resources/data.json'), (err, data) => {

                    if (err) {

                        done(err);

                        return;

                    }

                    data.should.not.be.empty();
                    dataStore.get('foo').should.equal('bar');

                    testObject(dataStore, data);

                    done();

                });

            });

            it('should override existing data', (done) => {

                const dataStore = new DataAbstract(fileObject);

                testObject(dataStore, fileObject);

                dataStore.get('foo').should.equal('bar');

                dataStore.loadJSON(path.join(__dirname, '/resources/data.override.json'), (err, data) => {

                    if (err) {

                        done(err);

                        return;

                    }

                    data.should.not.be.empty();
                    dataStore.get('foo').should.equal(123);

                    testObject(dataStore, data);

                    done();

                });

            });

            it('should load multiple files with appended data', (done) => {


                const dataStore = new DataAbstract();

                testEmpty(dataStore);

                dataStore.loadJSON(path.join(__dirname, '/resources/data.json'), (err, data) => {

                    if (err) {

                        done(err);

                        return;

                    }

                    data.should.not.be.empty();
                    data.foo.should.equal('bar');

                    testObject(dataStore, data);

                    dataStore.loadJSON(path.join(__dirname, '/resources/data.append.json'), (suberr, subdata) => {

                        if (suberr) {

                            done(suberr);

                            return;

                        }

                        dataStore.get('foo').should.equal('bar');
                        dataStore.get('complex').alpha.should.equal(1);
                        dataStore.get('complex').bravo.should.equal(false);
                        dataStore.get('complex').charlie[1].should.equal(2);

                        testObject(dataStore, subdata);

                        done();

                    });

                });

            });

            it('should load multiple files with overridden data', (done) => {

                const dataStore = new DataAbstract();

                testEmpty(dataStore);

                dataStore.loadJSON(path.join(__dirname, '/resources/data.json'), (err, data) => {

                    if (err) {

                        done(err);

                        return;

                    }

                    data.should.not.be.empty();
                    data.foo.should.equal('bar');

                    testObject(dataStore, data);

                    dataStore.loadJSON(path.join(__dirname, '/resources/data.override.json'), (suberr, subdata) => {

                        if (suberr) {

                            done(suberr);

                            return;

                        }

                        subdata.foo.should.equal(123);

                        testObject(dataStore, subdata);

                        done();

                    });

                });

            });

        });

        describe('JSON file saving', () => {

            it('should throw an error if the file cannot be reached', (done) => {

                const dataStore = new DataAbstract();
                const file = '/tmp/this/is/a/bad/asdfasdf/bad.file.json';

                dataStore.saveJSON(file, (err) => {

                    if (err) {

                        if (String(err).includes('ENOENT')) {

                            done();

                            return;

                        }

                        done(err);

                        return;

                    }

                    done(new Error(`Missing error for bad file: ${file}`));

                });

            });

            it('should throw an error if the file cannot be overwritten', (done) => {

                const dataStore = new DataAbstract();

                const file = tmp.fileSync({
                    mode              : 45,
                    postfix           : '.json',
                    discardDescriptor : true
                });

                dataStore.saveJSON(file.name, (err) => {

                    if (err) {

                        if (String(err).includes('EACCES')) {

                            done();

                            return;

                        }

                        done(err);

                        return;

                    }

                    done(new Error(`Expected error for inaccessible file: ${file.name}`));

                });

            });

            it('should save an empty data set', (done) => {

                const dataStore = new DataAbstract();

                const file = tmp.fileSync({
                    postfix           : '.json',
                    discardDescriptor : true
                });

                testEmpty(dataStore);

                dataStore.saveJSON(file.name, (err) => {

                    if (err) {

                        done(err);

                        return;

                    }

                    const fileData = fs.readFileSync(file.name, 'utf8');
                    const obj = JSON.parse(fileData);

                    testObject(dataStore, obj);
                    done();

                });

            });

            it('should save a complex data set', (done) => {

                const dataStore = new DataAbstract(fileObject);

                const file = tmp.fileSync({
                    postfix           : '.json',
                    discardDescriptor : true
                });

                testObject(dataStore, fileObject);

                dataStore.saveJSON(file.name, (suberr) => {

                    if (suberr) {

                        done(suberr);

                        return;

                    }

                    const fileData = fs.readFileSync(file.name, 'utf8');
                    const obj = JSON.parse(fileData);

                    testObject(dataStore, obj);
                    done();

                });

            });

        });

        describe('YAML file loading', () => {

            it('should throw an error if the file is missing', (done) => {

                const dataStore = new DataAbstract();
                const file = '/tmp/this/is/a/bad/asdfasdf/bad.path.yaml';

                dataStore.loadYAML(file, (err) => {

                    if (err) {

                        if (String(err).includes('ENOENT')) {

                            done();

                            return;

                        }

                        done(err);

                        return;

                    }

                    done(new Error(`Expected error for bad file: ${file}`));

                });

            });

            it('should throw an error if the file cannot be read', (done) => {

                const dataStore = new DataAbstract();

                const file = tmp.fileSync({
                    mode              : 45,
                    postfix           : '.yaml',
                    discardDescriptor : true
                });

                dataStore.loadYAML(file.name, (err) => {

                    if (err) {

                        if (String(err).includes('EACCES')) {

                            done();

                            return;

                        }

                        done(err);

                        return;

                    }

                    done(new Error(`Expected error for inaccessible file: ${file.name}`));

                });

            });

            it('should throw an error if given an invalid format', (done) => {

                const dataStore = new DataAbstract();
                const file = path.join(__dirname, '/resources/badformat.yml');

                dataStore.loadYAML(file, (err) => {

                    if (err) {

                        if (String(err).includes('YAMLException')) {

                            done();

                            return;

                        }

                        done(err);

                        return;

                    }

                    done(new Error(`Expected error for invalid format: ${file}`));

                });

            });

            it('should load a blank file', (done) => {

                const dataStore = new DataAbstract();
                const file = path.join(__dirname, '/resources/blank');

                testEmpty(dataStore);

                dataStore.loadYAML(file, (err, data) => {

                    if (err) {

                        done(err);

                        return;

                    }

                    data.should.be.empty();

                    testEmpty(dataStore);

                    done();

                });

            });

            it('should load into a blank object', (done) => {

                const dataStore = new DataAbstract();
                const file = path.join(__dirname, '/resources/data.yml');

                testEmpty(dataStore);

                dataStore.loadYAML(file, (err, data) => {

                    if (err) {

                        done(err);

                        return;

                    }

                    data.should.not.be.empty();
                    dataStore.get('foo').should.equal('bar');

                    testObject(dataStore, data);

                    done();

                });

            });

            it('should override existing data', (done) => {

                const dataStore = new DataAbstract(fileObject);
                const file = path.join(__dirname, '/resources/data.override.yml');

                testObject(dataStore, fileObject);

                dataStore.get('foo').should.equal('bar');

                dataStore.loadYAML(file, (err, data) => {

                    if (err) {

                        done(err);

                        return;

                    }

                    data.should.not.be.empty();
                    dataStore.get('foo').should.equal(123);

                    testObject(dataStore, data);

                    done();

                });

            });

            it('should load multiple files with appended data', (done) => {

                const dataStore = new DataAbstract();

                testEmpty(dataStore);

                dataStore.loadYAML(path.join(__dirname, '/resources/data.yml'), (err, data) => {

                    if (err) {

                        done(err);

                        return;

                    }

                    data.should.not.be.empty();
                    data.foo.should.equal('bar');

                    testObject(dataStore, data);

                    dataStore.loadYAML(path.join(__dirname, '/resources/data.append.yml'), (suberr, subdata) => {

                        if (suberr) {

                            done(suberr);

                            return;

                        }

                        dataStore.get('foo').should.equal('bar');
                        dataStore.get('complex').alpha.should.equal(1);
                        dataStore.get('complex').bravo.should.equal(false);
                        dataStore.get('complex').charlie[1].should.equal(2);

                        testObject(dataStore, subdata);

                        done();

                    });

                });

            });

            it('should load multiple files with overridden data', (done) => {

                const dataStore = new DataAbstract();

                testEmpty(dataStore);

                dataStore.loadYAML(path.join(__dirname, '/resources/data.yml'), (err, data) => {

                    if (err) {

                        done(err);

                        return;

                    }

                    data.should.not.be.empty();
                    data.foo.should.equal('bar');

                    testObject(dataStore, data);

                    dataStore.loadYAML(path.join(__dirname, '/resources/data.override.yml'), (suberr, subdata) => {

                        if (suberr) {

                            done(suberr);

                            return;

                        }

                        data.foo.should.equal(123);

                        testObject(dataStore, subdata);

                        done();

                    });

                });

            });

        });

        describe('YAML file saving', () => {

            it('should throw an error if the file cannot be reached', (done) => {

                const dataStore = new DataAbstract();
                const file = '/not/a/good/asdfasdf/bad.path.yml';

                dataStore.saveYAML(file, (err) => {

                    if (err) {

                        if (String(err).includes('ENOENT')) {

                            done();

                            return;

                        }

                        done(err);

                        return;

                    }

                    done(new Error(`Expected error for bad file: ${file}`));

                });

            });

            it('should throw an error if the file cannot be overwritten', (done) => {

                const dataStore = new DataAbstract();

                const file = tmp.fileSync({
                    mode              : 45,
                    postfix           : '.yml',
                    discardDescriptor : true
                });

                dataStore.saveYAML(file.name, (err) => {

                    if (err) {

                        if (String(err).includes('EACCES')) {

                            done();

                            return;

                        }

                        done(err);

                        return;

                    }

                    done(new Error(`Expected error for inaccessible file: ${file.name}`));

                });

            });

            it('should save an empty data set', (done) => {

                const dataStore = new DataAbstract();

                const file = tmp.fileSync({
                    postfix           : '.yml',
                    discardDescriptor : true
                });

                testEmpty(dataStore);

                dataStore.saveYAML(file.name, (err) => {

                    if (err) {

                        done(err);

                        return;

                    }

                    const fileData = fs.readFileSync(file.name, 'utf8');

                    fileData.trim().should.equal('{}');

                    testEmpty(dataStore);
                    done();

                });

            });

            it('should save a complex data set', (done) => {

                const dataStore = new DataAbstract(fileObject);

                const file = tmp.fileSync({
                    postfix           : '.yml',
                    discardDescriptor : true
                });

                testObject(dataStore, fileObject);

                dataStore.saveYAML(file.name, (err) => {

                    if (err) {

                        done(err);

                        return;

                    }

                    const fileData = fs.readFileSync(file.name, 'utf8');

                    const obj = yaml.safeLoad(fileData);

                    testObject(dataStore, obj);
                    done();

                });

            });

        });

        describe('XML file loading', () => {

            it('should throw an error if the file is missing', (done) => {

                const dataStore = new DataAbstract();
                const file = '/this/is/a/bad/file/asdfasdf/bad.path.xml';

                dataStore.loadXML(file, (err) => {

                    if (err) {

                        if (String(err).includes('ENOENT')) {

                            done();

                            return;

                        }

                        done(err);

                        return;

                    }

                    done(new Error(`Expected error for bad file: ${file}`));

                });

            });

            it('should throw an error if the file cannot be read', (done) => {

                const dataStore = new DataAbstract();

                const file = tmp.fileSync({
                    mode              : 45,
                    postfix           : '.xml',
                    discardDescriptor : true
                });

                dataStore.loadXML(file.name, (err) => {

                    if (err) {

                        if (String(err).includes('EACCES')) {

                            done();

                            return;

                        }

                        done(err);

                        return;

                    }

                    done(new Error(`Expected error for inaccessible file: ${file.name}`));

                });

            });

            it('should throw an error if given an invalid format', (done) => {

                const dataStore = new DataAbstract();
                const file = path.join(__dirname, '/resources/badformat.xml');

                dataStore.loadXML(file, (err) => {

                    if (err) {

                        if (String(err).includes('Error: Non-whitespace before first tag.')) {

                            done();

                            return;

                        }

                        done(err);

                        return;

                    }

                    done(new Error(`Expected error for invalid format: ${file}`));

                });

            });

            it('should load a blank file', (done) => {

                const dataStore = new DataAbstract();
                const file = path.join(__dirname, '/resources/blank');

                testEmpty(dataStore);

                dataStore.loadXML(file, (err, data) => {

                    if (err) {

                        done(err);

                        return;

                    }

                    data.should.be.empty();

                    testEmpty(dataStore);

                    done();

                });

            });

            it('should load into a blank object', (done) => {

                const dataStore = new DataAbstract();
                const file = path.join(__dirname, '/resources/data.xml');

                testEmpty(dataStore);

                dataStore.loadXML(file, (err, data) => {

                    if (err) {

                        done(err);

                        return;

                    }

                    data.should.not.be.empty();
                    dataStore.get('foo').should.equal('bar');

                    testObject(dataStore, data);

                    done();

                });

            });

            it('should override existing data', (done) => {

                const dataStore = new DataAbstract(fileObject);
                const file = path.join(__dirname, '/resources/data.override.xml');

                testObject(dataStore, fileObject);

                dataStore.get('foo').should.equal('bar');

                dataStore.loadXML(file, (err, data) => {

                    if (err) {

                        done(err);

                        return;

                    }

                    data.should.not.be.empty();
                    dataStore.get('foo').should.equal(123);

                    testObject(dataStore, data);

                    done();

                });

            });

            it('should load multiple files with appended data', (done) => {

                const dataStore = new DataAbstract();

                testEmpty(dataStore);

                dataStore.loadXML(path.join(__dirname, '/resources/data.xml'), (err, data) => {

                    if (err) {

                        done(err);

                        return;

                    }

                    data.should.not.be.empty();
                    data.foo.should.equal('bar');

                    testObject(dataStore, data);

                    dataStore.loadXML(path.join(__dirname, '/resources/data.append.xml'), (suberr, subdata) => {

                        if (suberr) {

                            done(suberr);

                            return;

                        }

                        dataStore.get('foo').should.equal('bar');
                        dataStore.get('complex').alpha.should.equal(1);
                        dataStore.get('complex').bravo.should.equal(false);
                        dataStore.get('complex').charlie[1].should.equal(2);

                        testObject(dataStore, subdata);

                        done();

                    });

                });

            });

            it('should load multiple files with overridden data', (done) => {

                const dataStore = new DataAbstract();

                testEmpty(dataStore);

                dataStore.loadXML(path.join(__dirname, '/resources/data.xml'), (err, data) => {

                    if (err) {

                        done(err);

                        return;

                    }

                    data.should.not.be.empty();
                    data.foo.should.equal('bar');

                    testObject(dataStore, data);

                    dataStore.loadXML(path.join(__dirname, '/resources/data.override.xml'), (suberr, subdata) => {

                        if (suberr) {

                            done(suberr);

                            return;

                        }

                        data.foo.should.equal(123);

                        testObject(dataStore, subdata);

                        done();

                    });

                });

            });

        });

        describe('XML file saving', () => {

            it('should throw an error if the file cannot be reached', (done) => {

                const dataStore = new DataAbstract();
                const file = '/this/is/a/bad/file/aklsdfj/bad.path.xml';

                dataStore.saveXML(file, (err) => {

                    if (err) {

                        if (String(err).includes('ENOENT')) {

                            done();

                            return;

                        }

                        done(err);

                        return;

                    }

                    done(new Error(`Expected error for bad file: ${file}`));

                });

            });

            it('should throw an error if the file cannot be overwritten', (done) => {

                const dataStore = new DataAbstract();

                const file = tmp.fileSync({
                    mode              : 45,
                    postfix           : '.xml',
                    discardDescriptor : true
                });

                dataStore.saveXML(file.name, (err) => {

                    if (err) {

                        if (String(err).includes('EACCES')) {

                            done();

                            return;

                        }

                        done(err);

                        return;

                    }

                    done(new Error(`Expected error for inaccessible file: ${file.name}`));

                });

            });

            it('should save an empty data set', (done) => {

                const dataStore = new DataAbstract();

                const file = tmp.fileSync({
                    postfix           : '.xml',
                    discardDescriptor : true
                });

                testEmpty(dataStore);

                dataStore.saveXML(file.name, (err) => {

                    if (err) {

                        done(err);

                        return;

                    }

                    const fileData = fs.readFileSync(file.name, 'utf8');

                    fileData.trim().should.containEql('<root/>');

                    testEmpty(dataStore);
                    done();

                });

            });

            it('should save a complex data set', (done) => {

                const dataStore = new DataAbstract(fileObject);

                const file = tmp.fileSync({
                    postfix           : '.xml',
                    discardDescriptor : true
                });

                testObject(dataStore, fileObject);

                dataStore.saveXML(file.name, (err) => {

                    if (err) {

                        done(err);

                        return;

                    }

                    const fileData = fs.readFileSync(file.name, 'utf8');

                    const parser = new xml.Parser({
                        trim            : true,
                        explicitArray   : false,
                        explicitRoot    : false,
                        valueProcessors : [
                            xml.processors.parseNumbers,
                            xml.processors.parseBooleans
                        ]
                    });

                    parser.parseString(fileData, (perr, pobj) => {

                        if (perr) {

                            done(perr);

                            return;

                        }

                        testObject(dataStore, pobj);
                        done();

                    });

                });

            });

        });

        describe('smart file loading', () => {

            it('should load a JSON file correctly', (done) => {

                const dataStore = new DataAbstract();

                dataStore.load(path.join(__dirname, '/resources/data.json'), (err, data) => {

                    if (err) {

                        done(err);

                        return;

                    }

                    data.should.not.be.empty();
                    dataStore.get('foo').should.equal('bar');

                    dataStore.load(path.join(__dirname, '/resources/data.append.json'), (suberr, subdata) => {

                        if (suberr) {

                            done(suberr);

                            return;

                        }

                        subdata.should.not.be.empty();
                        dataStore.get('foo').should.equal('bar');
                        dataStore.get('complex').alpha.should.equal(1);
                        dataStore.get('complex').bravo.should.equal(false);
                        dataStore.get('complex').charlie[1].should.equal(2);

                        testObject(dataStore, fileObject);

                        done();

                    });

                });

            });

            it('should load a YAML file correctly', (done) => {

                const dataStore = new DataAbstract();

                dataStore.load(path.join(__dirname, '/resources/data.yml'), (err, data) => {

                    if (err) {

                        done(err);

                        return;

                    }

                    data.should.not.be.empty();
                    dataStore.get('foo').should.equal('bar');

                    dataStore.load(path.join(__dirname, '/resources/data.append.yml'), (suberr, subdata) => {

                        if (suberr) {

                            done(suberr);

                            return;

                        }

                        subdata.should.not.be.empty();
                        dataStore.get('foo').should.equal('bar');
                        dataStore.get('complex').alpha.should.equal(1);
                        dataStore.get('complex').bravo.should.equal(false);
                        dataStore.get('complex').charlie[1].should.equal(2);

                        testObject(dataStore, fileObject);

                        done();

                    });

                });

            });

            it('should load an XML file correctly', (done) => {

                const dataStore = new DataAbstract();

                dataStore.load(path.join(__dirname, '/resources/data.xml'), (err, data) => {

                    if (err) {

                        done(err);

                        return;

                    }

                    data.should.not.be.empty();
                    dataStore.get('foo').should.equal('bar');

                    dataStore.load(path.join(__dirname, '/resources/data.append.xml'), (suberr, subdata) => {

                        if (suberr) {

                            done(suberr);

                            return;

                        }

                        subdata.should.not.be.empty();
                        dataStore.get('foo').should.equal('bar');
                        dataStore.get('complex').alpha.should.equal(1);
                        dataStore.get('complex').bravo.should.equal(false);
                        dataStore.get('complex').charlie[1].should.equal(2);

                        testObject(dataStore, fileObject);

                        done();

                    });

                });

            });

            it('should throw an error if an invalid format is provided', (done) => {

                const dataStore = new DataAbstract();

                dataStore.load(path.join(__dirname, '/resources/data.foobar'), (err) => {

                    err.should.be.an.instanceof(FileFormatError);
                    err.message.should.equal('Invalid extension: foobar');
                    err.should.not.be.empty();
                    done();

                });

            });

            it('should throw an error if an no extension is provided', (done) => {

                const dataStore = new DataAbstract();

                dataStore.load(path.join(__dirname, '/resources/blank'), (err) => {

                    err.should.be.an.instanceof(FileFormatError);
                    err.message.should.equal('No file extension provided');
                    err.should.not.be.empty();
                    done();

                });

            });

        });

        describe('smart file saving', () => {

            it('should save a JSON file correctly', (done) => {

                const dataStore = new DataAbstract(fileObject);

                const file = tmp.fileSync({
                    postfix           : '.json',
                    discardDescriptor : true
                });

                dataStore.save(file.name, (err) => {

                    if (err) {

                        done(err);

                        return;

                    }

                    const fileData = fs.readFileSync(file.name, 'utf8');
                    const obj = JSON.parse(fileData);

                    testObject(dataStore, obj);
                    done();

                });

            });

            it('should save a YAML file correctly', (done) => {

                const dataStore = new DataAbstract(fileObject);

                const file = tmp.fileSync({
                    postfix           : '.yml',
                    discardDescriptor : true
                });

                dataStore.save(file.name, (err) => {

                    if (err) {

                        done(err);

                        return;

                    }

                    const fileData = fs.readFileSync(file.name, 'utf8');
                    const obj = yaml.safeLoad(fileData);

                    testObject(dataStore, obj);
                    done();

                });

            });

            it('should save an XML file correctly', (done) => {

                const dataStore = new DataAbstract(fileObject);

                const file = tmp.fileSync({
                    postfix           : '.xml',
                    discardDescriptor : true
                });

                dataStore.save(file.name, (err) => {

                    if (err) {

                        done(err);

                        return;

                    }

                    const fileData = fs.readFileSync(file.name, 'utf8');

                    const parser = new xml.Parser({
                        trim            : true,
                        explicitArray   : false,
                        explicitRoot    : false,
                        valueProcessors : [
                            xml.processors.parseNumbers,
                            xml.processors.parseBooleans
                        ]
                    });

                    parser.parseString(fileData, (perr, pobj) => {

                        if (perr) {

                            done(perr);

                            return;

                        }

                        testObject(dataStore, pobj);
                        done();

                    });

                });

            });

            it('should throw an error if an invalid format is provided', (done) => {

                const dataStore = new DataAbstract();

                dataStore.save(path.join(__dirname, '/resources/data.foobar'), (err) => {

                    err.should.be.an.instanceof(FileFormatError);
                    err.message.should.equal('Invalid extension: foobar');
                    err.should.not.be.empty();
                    done();

                });

            });

            it('should throw an error if an no extension is provided', (done) => {

                const dataStore = new DataAbstract();

                dataStore.save(path.join(__dirname, '/resources/badextension'), (err) => {

                    err.should.be.an.instanceof(FileFormatError);
                    err.message.should.equal('No file extension provided');
                    err.should.not.be.empty();
                    done();

                });

            });

        });

    });


    /* Synchronous **************************************************************************************************/

    describe('synchronous', () => {

        describe('JSON file loading', () => {

            it('should throw an error if the file is missing', () => {

                const dataStore = new DataAbstract();
                const file = '/tmp/badpath/bad.path.json';

                (() => {

                    dataStore.loadJSONSync(file);

                }).should.throw(`ENOENT: no such file or directory, open '${file}'`);

            });

            it('should throw an error if the file cannot be read', () => {

                const dataStore = new DataAbstract();
                const file = tmp.fileSync({
                    mode              : 45,
                    postfix           : '.json',
                    discardDescriptor : true
                });

                (() => {

                    dataStore.loadJSONSync(file.name);

                }).should.throw(`EACCES: permission denied, open '${file.name}'`);

            });

            it('should throw an error if given an invalid format', () => {

                const dataStore = new DataAbstract();
                const file = path.join(__dirname, '/resources/badformat.json');

                (() => {

                    dataStore.loadJSONSync(file);

                }).should.throw('Unexpected end of JSON input');

            });

            it('should load a blank file', () => {

                const dataStore = new DataAbstract();

                dataStore.loadJSONSync(path.join(__dirname, '/resources/blank'));

                testEmpty(dataStore);

            });

            it('should load into a blank object', () => {

                const dataStore = new DataAbstract();
                const file = path.join(__dirname, '/resources/data.json');

                dataStore.loadJSONSync(file);

                const fileData = fs.readFileSync(file, 'utf8');
                const obj = JSON.parse(fileData);

                testObject(dataStore, obj);
                dataStore.get('foo').should.equal('bar');

            });

            it('should override existing data', () => {

                const data = {
                    foo    : 'apples',
                    abc    : 123,
                    truths : false
                };

                const dataStore = new DataAbstract(data);

                testObject(dataStore, data);
                dataStore.get('foo').should.equal('apples');

                dataStore.loadJSONSync(path.join(__dirname, '/resources/data.json'));

                testObject(dataStore, data);
                dataStore.get('foo').should.equal('bar');

            });

            it('should load multiple files with appended data', () => {

                const obj = {};
                const dataStore = new DataAbstract(obj);

                testEmpty(dataStore);

                dataStore.loadJSONSync(path.join(__dirname, '/resources/data.json'));

                testObject(dataStore, obj);
                dataStore.get('foo').should.equal('bar');

                dataStore.loadJSONSync(path.join(__dirname, '/resources/data.append.json'));

                testObject(dataStore, fileObject);
                dataStore.get('foo').should.equal('bar');
                dataStore.get('complex').alpha.should.equal(1);
                dataStore.get('complex').bravo.should.equal(false);
                dataStore.get('complex').charlie[1].should.equal(2);

            });

            it('should load multiple files with overridden data', () => {

                const obj = {};
                const dataStore = new DataAbstract(obj);

                testEmpty(dataStore);

                dataStore.loadJSONSync(path.join(__dirname, '/resources/data.json'));

                testObject(dataStore, obj);
                dataStore.get('foo').should.equal('bar');

                dataStore.loadJSONSync(path.join(__dirname, '/resources/data.override.json'));

                testObject(dataStore, obj);
                dataStore.get('foo').should.equal(123);

            });

        });

        describe('JSON file saving', () => {

            it('should throw an error if the file cannot be reached', () => {

                const dataStore = new DataAbstract();
                const file = '/tmp/this/is/a/bad/asdfasdf/bad.file.json';

                (() => {

                    dataStore.saveJSONSync(file);

                }).should.throw(`ENOENT: no such file or directory, open '${file}'`);

            });

            it('should throw an error if the file cannot be overwritten', () => {

                const dataStore = new DataAbstract();

                const file = tmp.fileSync({
                    mode              : 45,
                    postfix           : '.json',
                    discardDescriptor : true
                });

                (() => {

                    dataStore.saveJSONSync(file.name);

                }).should.throw(`EACCES: permission denied, open '${file.name}'`);

            });

            it('should save an empty data set', () => {

                const dataStore = new DataAbstract();

                testEmpty(dataStore);

                const file = tmp.fileSync({
                    postfix           : '.json',
                    discardDescriptor : true
                });

                dataStore.saveJSONSync(file.name);

                const fileData = fs.readFileSync(file.name, 'utf8');
                const obj = JSON.parse(fileData);

                testObject(dataStore, obj);

            });

            it('should save a complex data set', () => {

                const dataStore = new DataAbstract(fileObject);

                testObject(dataStore, fileObject);

                const file = tmp.fileSync({
                    postfix           : '.json',
                    discardDescriptor : true
                });

                dataStore.saveJSONSync(file.name);

                const fileData = fs.readFileSync(file.name, 'utf8');
                const obj = JSON.parse(fileData);

                testObject(dataStore, obj);

            });

        });

        describe('YAML file loading', () => {

            it('should throw an error if the file is missing', () => {

                const dataStore = new DataAbstract();
                const file = '/not/a/good/path/asdfasdf/bad.path.yml';

                (() => {

                    dataStore.loadYAMLSync(file);

                }).should.throw(`ENOENT: no such file or directory, open '${file}'`);

            });

            it('should throw an error if the file cannot be read', () => {

                const dataStore = new DataAbstract();
                const file = tmp.fileSync({
                    mode              : 45,
                    postfix           : '.yml',
                    discardDescriptor : true
                });

                (() => {

                    dataStore.loadYAMLSync(file.name);

                }).should.throw(`EACCES: permission denied, open '${file.name}'`);

            });

            it('should throw an error if given an invalid format', () => {

                const dataStore = new DataAbstract();
                const file = path.join(__dirname, '/resources/badformat.yml');

                (() => {

                    dataStore.loadYAMLSync(file);

                }).should.throw('directive name must not be less than one character in length at line 1, column 2:\n    % badyaml\n     ^');  // eslint-disable-line max-len

            });

            it('should load a blank file', () => {

                const dataStore = new DataAbstract();

                dataStore.loadYAMLSync(path.join(__dirname, '/resources/blank'));

                testEmpty(dataStore);

            });

            it('should load into a blank object', () => {

                const dataStore = new DataAbstract();
                const file = path.join(__dirname, '/resources/data.json');

                dataStore.loadYAMLSync(file);

                const fileData = fs.readFileSync(file, 'utf8');
                const obj = JSON.parse(fileData);

                testObject(dataStore, obj);
                dataStore.get('foo').should.equal('bar');

            });

            it('should override existing data', () => {

                const data = {
                    foo    : 'apples',
                    abc    : 123,
                    truths : false
                };

                const dataStore = new DataAbstract(data);

                testObject(dataStore, data);
                dataStore.get('foo').should.equal('apples');

                dataStore.loadYAMLSync(path.join(__dirname, '/resources/data.yml'));

                testObject(dataStore, data);
                dataStore.get('foo').should.equal('bar');

            });

            it('should load multiple files with appended data', () => {

                const obj = {};
                const dataStore = new DataAbstract(obj);

                testEmpty(dataStore);

                dataStore.loadYAMLSync(path.join(__dirname, '/resources/data.yml'));

                testObject(dataStore, obj);
                dataStore.get('foo').should.equal('bar');

                dataStore.loadYAMLSync(path.join(__dirname, '/resources/data.append.yml'));

                testObject(dataStore, fileObject);
                dataStore.get('foo').should.equal('bar');
                dataStore.get('complex').alpha.should.equal(1);
                dataStore.get('complex').bravo.should.equal(false);
                dataStore.get('complex').charlie[1].should.equal(2);

            });

            it('should load multiple files with overridden data', () => {

                const obj = {};
                const dataStore = new DataAbstract(obj);

                testEmpty(dataStore);

                dataStore.loadYAMLSync(path.join(__dirname, '/resources/data.yml'));

                testObject(dataStore, obj);
                dataStore.get('foo').should.equal('bar');

                dataStore.loadYAMLSync(path.join(__dirname, '/resources/data.override.yml'));

                testObject(dataStore, obj);
                dataStore.get('foo').should.equal(123);

            });

        });

        describe('YAML file saving', () => {

            it('should throw an error if the file cannot be reached', () => {

                const dataStore = new DataAbstract();
                const file = '/tmp/this/is/a/bad/asdfasdf/bad.file.yml';

                (() => {

                    dataStore.saveYAMLSync(file);

                }).should.throw(`ENOENT: no such file or directory, open '${file}'`);

            });

            it('should throw an error if the file cannot be overwritten', () => {

                const dataStore = new DataAbstract();

                const file = tmp.fileSync({
                    mode              : 45,
                    postfix           : '.yml',
                    discardDescriptor : true
                });

                (() => {

                    dataStore.saveYAMLSync(file.name);

                }).should.throw(`EACCES: permission denied, open '${file.name}'`);

            });

            it('should save an empty data set', () => {

                const dataStore = new DataAbstract();

                testEmpty(dataStore);

                const file = tmp.fileSync({
                    postfix           : '.yml',
                    discardDescriptor : true
                });

                dataStore.saveYAMLSync(file.name);

                const readObj = yaml.safeLoad(
                    fs.readFileSync(file.name, 'utf8')
                );

                testObject(dataStore, readObj);

            });

            it('should save a complex data set', () => {

                const dataStore = new DataAbstract(fileObject);

                testObject(dataStore, fileObject);

                const file = tmp.fileSync({
                    postfix           : '.yml',
                    discardDescriptor : true
                });

                dataStore.saveYAMLSync(file.name);

                const readObj = yaml.safeLoad(
                    fs.readFileSync(file.name, 'utf8')
                );

                testObject(dataStore, readObj);

            });

        });

        describe('XML file loading', () => {

            it('should throw an error if the file is missing', () => {

                const dataStore = new DataAbstract();
                const file = '/this/is/a/bad/path/asdfasdf/bad.path.xml';

                (() => {

                    dataStore.loadXMLSync(file);

                }).should.throw(`ENOENT: no such file or directory, open '${file}'`);

            });

            it('should throw an error if the file cannot be read', () => {

                const dataStore = new DataAbstract();
                const file = tmp.fileSync({
                    mode              : 45,
                    postfix           : '.xml',
                    discardDescriptor : true
                });

                (() => {

                    dataStore.loadXMLSync(file.name);

                }).should.throw(`EACCES: permission denied, open '${file.name}'`);


            });

            it('should throw an error if given an invalid format', () => {

                const dataStore = new DataAbstract();
                const file = path.join(__dirname, '/resources/badformat.xml');

                (() => {

                    dataStore.loadXMLSync(file);

                }).should.throw('Non-whitespace before first tag.\nLine: 0\nColumn: 1\nChar: %');

            });

            it('should load a blank file', () => {

                const dataStore = new DataAbstract();

                dataStore.loadXMLSync(path.join(__dirname, '/resources/blank'));

                testEmpty(dataStore);

            });

            it('should load into a blank object', (done) => {

                const dataStore = new DataAbstract();
                const file = path.join(__dirname, '/resources/data.xml');

                dataStore.loadXMLSync(file);

                const fileData = fs.readFileSync(file, 'utf8');

                const parser = new xml.Parser({
                    trim            : true,
                    explicitArray   : false,
                    explicitRoot    : false,
                    valueProcessors : [
                        xml.processors.parseNumbers,
                        xml.processors.parseBooleans
                    ]
                });

                parser.parseString(fileData, (perr, pobj) => {

                    if (perr) {

                        done(perr);

                        return;

                    }

                    testObject(dataStore, pobj);
                    dataStore.get('foo').should.equal('bar');

                    done();

                });

            });

            it('should override existing data', () => {

                const data = {
                    foo    : 'apples',
                    abc    : 123,
                    truths : false
                };

                const dataStore = new DataAbstract(data);

                testObject(dataStore, data);
                dataStore.get('foo').should.equal('apples');

                dataStore.loadXMLSync(path.join(__dirname, '/resources/data.xml'));

                testObject(dataStore, data);
                dataStore.get('foo').should.equal('bar');

            });

            it('should load multiple files with appended data', () => {

                const obj = {};
                const dataStore = new DataAbstract(obj);

                testEmpty(dataStore);

                dataStore.loadXMLSync(path.join(__dirname, '/resources/data.xml'));

                testObject(dataStore, obj);
                dataStore.get('foo').should.equal('bar');

                dataStore.loadXMLSync(path.join(__dirname, '/resources/data.append.xml'));

                testObject(dataStore, fileObject);
                dataStore.get('foo').should.equal('bar');
                dataStore.get('complex').alpha.should.equal(1);
                dataStore.get('complex').bravo.should.equal(false);
                dataStore.get('complex').charlie[1].should.equal(2);

            });

            it('should load multiple files with overridden data', () => {

                const obj = {};
                const dataStore = new DataAbstract(obj);

                testEmpty(dataStore);

                dataStore.loadXMLSync(path.join(__dirname, '/resources/data.xml'));

                testObject(dataStore, obj);
                dataStore.get('foo').should.equal('bar');

                dataStore.loadXMLSync(path.join(__dirname, '/resources/data.override.xml'));

                testObject(dataStore, obj);
                dataStore.get('foo').should.equal(123);

            });

        });

        describe('XML file saving', () => {

            it('should throw an error if the file cannot be reached', () => {

                const dataStore = new DataAbstract();
                const file = '/tmp/this/is/a/bad/asdfasdf/bad.file.xml';

                (() => {

                    dataStore.saveXMLSync(file);

                }).should.throw(`ENOENT: no such file or directory, open '${file}'`);

            });

            it('should throw an error if the file cannot be overwritten', () => {

                const dataStore = new DataAbstract();

                const file = tmp.fileSync({
                    mode              : 45,
                    postfix           : '.xml',
                    discardDescriptor : true
                });

                (() => {

                    dataStore.saveXMLSync(file.name);

                }).should.throw(`EACCES: permission denied, open '${file.name}'`);

            });

            it('should save an empty data set', (done) => {

                const dataStore = new DataAbstract();

                testEmpty(dataStore);

                const file = tmp.fileSync({
                    postfix           : '.xml',
                    discardDescriptor : true
                });

                dataStore.saveXMLSync(file.name);

                const fileData = fs.readFileSync(file.name, 'utf8');

                const parser = new xml.Parser({
                    trim            : true,
                    explicitArray   : false,
                    explicitRoot    : false,
                    valueProcessors : [
                        xml.processors.parseNumbers,
                        xml.processors.parseBooleans
                    ]
                });

                parser.parseString(fileData, (perr, pobj) => {

                    if (perr) {

                        done(perr);

                        return;

                    }

                    pobj.should.be.empty();
                    done();

                });

            });

            it('should save a complex data set', (done) => {

                const dataStore = new DataAbstract(fileObject);

                testObject(dataStore, fileObject);

                const file = tmp.fileSync({
                    postfix           : '.xml',
                    discardDescriptor : true
                });

                dataStore.saveXMLSync(file.name);

                const fileData = fs.readFileSync(file.name, 'utf8');

                const parser = new xml.Parser({
                    trim            : true,
                    explicitArray   : false,
                    explicitRoot    : false,
                    valueProcessors : [
                        xml.processors.parseNumbers,
                        xml.processors.parseBooleans
                    ]
                });

                parser.parseString(fileData, (perr, pobj) => {

                    if (perr) {

                        done(perr);

                        return;

                    }

                    testObject(dataStore, pobj);
                    done();

                });

            });

        });

        describe('smart file loading', () => {

            it('should load a JSON file correctly', () => {

                const dataStore = new DataAbstract();

                dataStore.loadSync(path.join(__dirname, '/resources/data.json'));

                dataStore.get('foo').should.equal('bar');

                dataStore.loadSync(path.join(__dirname, '/resources/data.append.json'));

                dataStore.get('foo').should.equal('bar');
                dataStore.get('complex').alpha.should.equal(1);
                dataStore.get('complex').bravo.should.equal(false);
                dataStore.get('complex').charlie[1].should.equal(2);

                testObject(dataStore, fileObject);

            });

            it('should load a YAML file correctly', () => {

                const dataStore = new DataAbstract();

                dataStore.loadSync(path.join(__dirname, '/resources/data.yml'));

                dataStore.get('foo').should.equal('bar');

                dataStore.loadSync(path.join(__dirname, '/resources/data.append.yml'));

                dataStore.get('foo').should.equal('bar');
                dataStore.get('complex').alpha.should.equal(1);
                dataStore.get('complex').bravo.should.equal(false);
                dataStore.get('complex').charlie[1].should.equal(2);

                testObject(dataStore, fileObject);

            });

            it('should load an XML file correctly', () => {

                const dataStore = new DataAbstract();

                dataStore.loadSync(path.join(__dirname, '/resources/data.xml'));

                dataStore.get('foo').should.equal('bar');

                dataStore.loadSync(path.join(__dirname, '/resources/data.append.xml'));

                dataStore.get('foo').should.equal('bar');
                dataStore.get('complex').alpha.should.equal(1);
                dataStore.get('complex').bravo.should.equal(false);
                dataStore.get('complex').charlie[1].should.equal(2);

                testObject(dataStore, fileObject);

            });

            it('should throw an error if an invalid format is provided', () => {

                (() => {

                    const dataStore = new DataAbstract();

                    dataStore.loadSync(path.join(__dirname, '/resources/data.foobar'));

                }).should.throw('Invalid extension: foobar');

            });

            it('should throw an error if an no extension is provided', () => {

                (() => {

                    const dataStore = new DataAbstract();

                    dataStore.loadSync(path.join(__dirname, '/resources/blank'));

                }).should.throw('No file extension provided');

            });

        });

        describe('smart file saving', () => {

            it('should save a JSON file correctly', () => {

                const dataStore = new DataAbstract(fileObject);

                const file = tmp.fileSync({
                    postfix           : '.json',
                    discardDescriptor : true
                });

                dataStore.saveSync(file.name);

                const fileData = fs.readFileSync(file.name, 'utf8');
                const obj = JSON.parse(fileData);

                testObject(dataStore, obj);

            });

            it('should save a YAML file correctly', () => {

                const dataStore = new DataAbstract(fileObject);

                const file = tmp.fileSync({
                    postfix           : '.yml',
                    discardDescriptor : true
                });

                dataStore.saveSync(file.name);

                const fileData = fs.readFileSync(file.name, 'utf8');
                const obj = yaml.safeLoad(fileData);

                testObject(dataStore, obj);

            });

            it('should save an XML file correctly', (done) => {

                const dataStore = new DataAbstract(fileObject);

                const file = tmp.fileSync({
                    postfix           : '.xml',
                    discardDescriptor : true
                });

                dataStore.saveSync(file.name);

                const fileData = fs.readFileSync(file.name, 'utf8');

                const parser = new xml.Parser({
                    trim            : true,
                    explicitArray   : false,
                    explicitRoot    : false,
                    valueProcessors : [
                        xml.processors.parseNumbers,
                        xml.processors.parseBooleans
                    ]
                });

                parser.parseString(fileData, (perr, pobj) => {

                    if (perr) {

                        done(perr);

                        return;

                    }

                    testObject(dataStore, pobj);
                    done();

                });

            });

            it('should throw an error if an invalid format is provided', () => {

                (() => {

                    const dataStore = new DataAbstract();

                    dataStore.saveSync(path.join(__dirname, '/resources/data.foobar'));

                }).should.throw('Invalid extension: foobar');

            });

            it('should throw an error if an no extension is provided', () => {

                (() => {

                    const dataStore = new DataAbstract();

                    dataStore.saveSync(path.join(__dirname, '/resources/blank'));

                }).should.throw('No file extension provided');

            });

        });

    });

});
