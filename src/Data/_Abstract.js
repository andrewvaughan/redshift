'use strict';

const fs = require('fs'),
    jsonOverride = require('json-override'),
    xml = require('xml2js'),
    yaml = require('js-yaml');

const FileFormatError = require('../Error/FileFormatError');


/**
 * Manages a data Object.
 */
class DataAbstract {

    /**
     * Creates a new data storage Object.
     *
     * @param {object} data data to set on Object creation
     */
    constructor(data) {

        this.dataCache = {};

        if (typeof data !== 'undefined') {

            this.dataCache = data;

        }

    }


    /**
     * Returns the value of a key, or default, if set.
     *
     * @param {string} property the property to get
     * @param {*} fallback an optional fallback value to return if key does not exist
     *
     * @returns {*} the value for the property, or the fallback if not found
     */
    get(property, fallback) {

        if (property in this.dataCache) {

            return this.dataCache[property];

        }

        return fallback;

    }


    /**
     * Sets a value for a key.
     *
     * @param {string} key the key to set
     * @param {*} value the value to set
     */
    set(key, value) {

        this.dataCache[key] = value;

    }


    /**
     * Clears the current configuration.
     */
    clear() {

        this.dataCache = {};

    }


    /**
     * Returns the size of the data object.
     *
     * @returns {Integer} the length of the data object
     */
    get length() {

        return Object.keys(this.dataCache).length;

    }


    /**
     * Returns a copy of the data object.
     *
     * @returns {object} a clone of the data object stored
     */
    get clone() {

        return JSON.parse(
            JSON.stringify(this.dataCache)
        );

    }


    /**
     * Attempts to load a file asynchronously.  Will determine file format based on the extension being loaded.
     * Accepts JSON, YAML, and XML formats.  Will append or override any existing data, but will not clear it before.
     *
     * Callback should be in the format `function callback(err, data)`.
     *
     * @param {string} file the filename to load from
     * @param {function} callback the function to call when loading is complete
     *
     * @throws FileFormatError if an unknown format is provided
     */
    load(file, callback) {

        let extension = file.match(/.*\.([0-9a-z]+)$/i);

        if (!extension || !Array.isArray(extension) || !extension.length) {

            callback(new FileFormatError('No file extension provided'), {});

        }

        extension = extension[1].toLowerCase();     /* eslint no-magic-numbers: 0 */

        switch (extension) {

            case 'json':
            case 'js':
                this.loadJSON(file, callback);
                break;

            case 'yaml':
            case 'yml':
                this.loadYAML(file, callback);
                break;

            case 'xml':
                this.loadXML(file, callback);
                break;

            default:
                callback(new FileFormatError(`Invalid extension: ${extension}`), {});

        }

    }


    /**
     * Attempts to load a file synchronously.  Will determine file format based on the extension being loaded.
     * Accepts JSON, YAML, and XML formats.  Will append or override any existing data, but will not clear it before.
     *
     * @param {string} file the filename to load from
     *
     * @throws FileFormatError if an unknown format is provided
     */
    loadSync(file) {

        let extension = file.match(/.*\.([0-9a-z]+)$/i);

        if (!extension || !Array.isArray(extension) || extension.length < 2) {

            throw new FileFormatError('No file extension provided');

        }

        extension = extension[1].toLowerCase();     /* eslint no-magic-numbers: 0 */

        switch (extension) {

            case 'json':
            case 'js':
                this.loadJSONSync(file);            /* eslint no-sync: 0 */
                break;

            case 'yaml':
            case 'yml':
                this.loadYAMLSync(file);            /* eslint no-sync: 0 */
                break;

            case 'xml':
                this.loadXMLSync(file);            /* eslint no-sync: 0 */
                break;

            default:
                throw new FileFormatError(`Invalid extension: ${extension}`);

        }

    }


    /**
     * Attempts to save the existing data to a file asynchronously.  Will determine file format based on the extension
     * being saved.  Accepts JSON, YAML, and XML formats.  Will override a file if it exists.
     *
     * Callback should be in the format `function callback(err)`.
     *
     * @param {string} file the filename to save to
     * @param {function} callback the function to call when saving is complete
     *
     * @throws FileFormatError if an unknown format is provided
     */
    save(file, callback) {

        let extension = file.match(/.*\.([0-9a-z]+)$/i);

        if (!extension || !Array.isArray(extension) || extension.length < 2) {

            callback(new FileFormatError('No file extension provided'), {});

        }

        extension = extension[1].toLowerCase();

        switch (extension) {

            case 'json':
            case 'js':
                this.saveJSON(file, callback);
                break;

            case 'yaml':
            case 'yml':
                this.saveYAML(file, callback);
                break;

            case 'xml':
                this.saveXML(file, callback);
                break;

            default:
                callback(new FileFormatError(`Invalid extension: ${extension}`), {});

        }

    }


    /**
     * Attempts to save the existing data to a file synchronously.  Will determine file format based on the extension
     * being saved.  Accepts JSON, YAML, and XML formats.  Will override a file if it exists.
     *
     * @param {string} file the filename to save to
     * @param {Boolean} overwrite whether to overwrite a file if it exists (default: false)
     *
     * @throws FileFormatError if an unknown format is provided
     */
    saveSync(file) {

        let extension = file.match(/.*\.([0-9a-z]+)$/i);

        if (!extension || !Array.isArray(extension) || extension.length < 2) {

            throw new FileFormatError('No file extension provided');

        }

        extension = extension[1].toLowerCase();

        switch (extension) {

            case 'json':
            case 'js':
                this.saveJSONSync(file);
                break;

            case 'yaml':
            case 'yml':
                this.saveYAMLSync(file);
                break;

            case 'xml':
                this.saveXMLSync(file);
                break;

            default:
                throw new FileFormatError(`Invalid extension: ${extension}`);

        }

    }


    /**
     * Loads a data JSON file asynchronously.  Overrides any existing values if duplicates exist.
     *
     * Callback should be in the format `function callback(err, data)`.
     *
     * @param {string} file the filename to load from
     * @param {function} callback the function to call when loading is complete
     *
     * @throws any errors thrown by the file reader or parser
     */
    loadJSON(file, callback) {

        const self = this;

        fs.readFile(file, 'utf8', (err, data) => {

            let obj = {};

            if (err) {

                callback(err, obj);

                return;

            }

            if (String(data).trim() === '') {

                callback(err, obj);

                return;

            }

            try {

                obj = JSON.parse(data);

            } catch (except) {

                callback(except, obj);

                return;

            }

            jsonOverride(self.dataCache, obj);

            callback(null, self.dataCache);

        });

    }


    /**
     * Loads a data JSON file synchronously.  Overrides any existing values if duplicates exist.
     *
     * @param {string} file the filename to load from
     *
     * @throws any errors thrown by the file reader or parser
     */
    loadJSONSync(file) {

        const data = fs.readFileSync(file, 'utf8');

        if (data.trim() === '') {

            return;

        }

        const obj = JSON.parse(data);

        jsonOverride(this.dataCache, obj);

    }


    /**
     * Saves the current data to a JSON file asynchronously.
     *
     * Callback should be in the format `function callback(err)`.
     *
     * @param {string} file the filename to save to
     * @param {function} callback the function to call when saving has completed
     *
     * @throws any errors thrown by the file writer
     */
    saveJSON(file, callback) {

        const output = JSON.stringify(this.dataCache);

        fs.writeFile(file, output, 'utf8', (err) => {

            if (err) {

                callback(err);

                return;

            }

            callback();

        });

    }


    /**
     * Saves the current data to a JSON file synchronously.
     *
     * @param {string} file the filename to save to
     *
     * @throws any errors throw by the file writer
     */
    saveJSONSync(file) {

        const output = JSON.stringify(this.dataCache);

        fs.writeFileSync(file, output, 'utf8');

    }


    /**
     * Loads a data YAML file asynchronously.  Overrides any existing values if duplicates exist.
     *
     * Callback should be in the format `function callback(err, data)`.
     *
     * @param {string} file the filename to load from
     * @param {function} callback the function to call after loading is complete
     *
     * @throws any errors throw by the file writer
     */
    loadYAML(file, callback) {

        const self = this;

        fs.readFile(file, 'utf8', (err, data) => {

            let obj = {};

            if (err) {

                callback(err, obj);

                return;

            }

            if (String(data).trim() === '') {

                callback(err, obj);

                return;

            }

            try {

                obj = yaml.safeLoad(data);

            } catch (except) {

                callback(except, obj);

                return;

            }

            jsonOverride(self.dataCache, obj);

            callback(null, self.dataCache);

        });

    }


    /**
     * Loads a data YAML file synchronously.  Overrides any existing values if duplicates exist.
     *
     * @param {string} file the filename to load from
     *
     * @throws any errors throw by the file writer
     */
    loadYAMLSync(file) {

        const fileData = fs.readFileSync(file, 'utf8');

        if (fileData.trim() === '') {

            return;

        }

        const data = yaml.safeLoad(fileData);

        jsonOverride(this.dataCache, data);

    }


    /**
     * Saves the current data to a JSON file asynchronously.
     *
     * Callback should be in the format `function callback(err)`.
     *
     * @param {string} file the filename to save to
     * @param {function} callback the function to call when writing is complete
     *
     * @throws any errors throw by the file writer
     */
    saveYAML(file, callback) {

        const output = yaml.safeDump(
            this.dataCache,
            {
                indent    : 4,
                lineWidth : 118
            }
        );

        fs.writeFile(file, output, 'utf8', (err) => {

            if (err) {

                callback(err);

                return;

            }

            callback(null);

        });

    }


    /**
     * Saves the current data to a JSON file synchronously.
     *
     * @param {string} file the filename to save to
     *
     * @throws any errors throw by the file writer
     */
    saveYAMLSync(file) {

        const output = yaml.safeDump(this.dataCache);

        fs.writeFileSync(file, output, 'utf8');

    }


    /**
     * Loads a data XML file asynchronously.  Overrides any existing values if duplicates exist.
     *
     * Callback should be in the format `function callback(err, data)`.
     *
     * @param {string} file the filename to load from
     * @param {function} callback the function to call after loading is complete
     *
     * @throws any errors throw by the file writer
     */
    loadXML(file, callback) {

        const self = this;

        fs.readFile(file, 'utf8', (err, data) => {

            const parser = new xml.Parser({
                trim            : true,
                explicitArray   : false,
                explicitRoot    : false,
                valueProcessors : [
                    xml.processors.parseNumbers,
                    xml.processors.parseBooleans
                ]
            });

            if (err) {

                callback(err, {});

                return;

            }

            if (String(data).trim() === '') {

                callback(err, {});

                return;

            }

            parser.parseString(data, (suberr, obj) => {

                if (suberr) {

                    callback(suberr, {});

                    return;

                }

                jsonOverride(self.dataCache, obj);

                callback(null, self.dataCache);

            });

        });

    }


    /**
     * Loads a data XML file synchronously.  Overrides any existing values if duplicates exist.
     *
     * @param {string} file the filename to load from
     *
     * @throws any errors throw by the file writer
     */
    loadXMLSync(file) {

        const self = this;
        const fileData = fs.readFileSync(file, 'utf8');

        if (fileData.trim() === '') {

            return;

        }

        const parser = new xml.Parser({
            trim            : true,
            explicitArray   : false,
            explicitRoot    : false,
            valueProcessors : [
                xml.processors.parseNumbers,
                xml.processors.parseBooleans
            ]
        });

        parser.parseString(fileData, (err, obj) => {

            if (err) {

                throw err;

            }

            jsonOverride(self.dataCache, obj);

        });

    }


    /**
     * Saves the current data to a XML file asynchronously.
     *
     * Callback should be in the format `function callback(err)`.
     *
     * @param {string} file the filename to save to
     * @param {function} callback the function to call when writing is complete
     *
     * @throws any errors throw by the file writer
     */
    saveXML(file, callback) {

        const builder = new xml.Builder();
        const output = builder.buildObject(this.dataCache);

        fs.writeFile(file, output, 'utf8', (err) => {

            if (err) {

                callback(err);

                return;

            }

            callback();

        });

    }


    /**
     * Saves the current data to a XML file synchronously.
     *
     * @param {string} file the filename to save to
     *
     * @throws any errors throw by the file writer
     */
    saveXMLSync(file) {

        const builder = new xml.Builder();
        const output = builder.buildObject(this.dataCache);

        fs.writeFileSync(file, output, 'utf8');

    }

}

module.exports = DataAbstract;
