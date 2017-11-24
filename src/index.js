import nativePath from 'path';
import vm from 'vm';
import fs from 'fs';
import * as babel from 'babel-core';
import jsdom from 'jsdom-global';
import _ from 'lodash';
import merge from 'deepmerge';
import domProperties from './libs/properties';

const path = nativePath;

class ExportContext {
  constructor() {
    this.initSandbox = {
      console,
      require: name => {
        return require(name);
      },
      exports,
      module,
      __dirname
    };

    if (process.env.NODE_ENV) {
      this.initSandbox.NODE_ENV = process.env.NODE_ENV;
    }

    this.sandbox = this.initSandbox;
    this.cleanup = null;
    this.filePath = null;

    /**
     * # createGlobalDom
     *
     * Add the document and window objects in global scope allows you to dom operation
     *
     * @return {Function}
     * @api private
     */
    this.createGlobalDom = () => {
      const __global = _.cloneDeep(global);
      this.cleanup = jsdom();

      if (process.env.NODE_ENV) {
        global.window.NODE_ENV = process.env.NODE_ENV;
      }

      const tmp = {};
      domProperties.forEach(key => {
        if (global[key]) {
          tmp[key] = global.window[key];
        }
      });

      const sandbox = Object.assign(tmp, {
        document: global.document,
        window: global.window
      });
      global = __global;

      return sandbox;
    };

    /**
     * # projectRoot
     *
     * Set the root path.
     * If not specified refer to the upper level of the directory of node_modules (project directory)
     *
     * @param {String} setRoot path
     * @return {String} project root path
     * @api private
     */
    this.projectRoot = (setRoot = null) => {
      if (!setRoot) {
        return path.resolve(__dirname, '..', '..');
      }

      return path.resolve(__dirname, setRoot.replace(/\/$/, ''));
    };

    /**
     * # createDom
     *
     * Add window object and document object to the sandbox
     *
     * @param {Object} sandbox
     * @return {Object} sandbox
     * @api private
     */
    this.createDom = (sandbox = {}) => {
      return Object.assign(sandbox, this.createGlobalDom());
    };

    /**
     * # getCode
     *
     * Read the file.
     * If babel option is enabled read code was transpile
     *
     * @param {String} filepath
     * @param {Object} options
     * @return {String} code
     * @api private
     */
    this.getCode = (filepath = '', options = {}) => {
      if (!filepath) {
        throw new Error('load file path is not exist');
      }

      if (options.babel) {
        return this.babelifyedCode(filepath, options.babel);
      }

      if (!options.encode) {
        options.encode = 'utf8';
      }
      return fs.readFileSync(filepath, options.encode);
    };

    /**
     * # babelifyedCode
     *
     * Read code was transpile by babel.
     *
     * @param {String} filepath
     * @param {Object} options
     * @return {String} code
     * @api private
     */
    this.babelifyedCode = (filepath, option = {}) => {
      if (!filepath) {
        throw new Error('load file path is not exist');
      }

      const initOption = {
        presets: ['latest']
      };

      const babelOption = Object.assign(initOption, option);
      return babel.transformFileSync(filepath, babelOption).code;
    };

    /**
     * # setSandbox
     *
     * Set the sandbox.
     *
     * @param {Object} options
     * @return {Object} sandbox
     * @api private
     */
    this.setSandbox = options => {
      if (options.dom) {
        this.sandbox = this.addModules(options.modules, this.createDom(this.initSandbox));
      } else {
        this.sandbox = this.addModules(options.modules, this.initSandbox);
      }

      if (options.sandbox) {
        this.sandbox = merge(this.sandbox, options.sandbox);
      }

      if (options.html !== '') {
        this.addHtml(options.html);
      }

      return this.sandbox;
    };

    /**
     * # runContext
     *
     * Given code to run in a sandbox, and returns the result
     *
     * @param {Object} options
     * @return {Object} context
     * @api private
     */
    this.runContext = options => {
      if (!options.code) {
        options.code = '';
      }

      if (!options.option) {
        options.option = [];
      }

      const sandbox = options.sandbox ? options.sandbox : this.sandbox;
      const option = options.option ? options.option : [];
      const context = vm.createContext(sandbox);

      vm.runInNewContext(options.code, context, option);
      return context;
    };
  }

  /**
   * # addModules
   *
   * Add the module to the sandbox.
   * Module to be added will be read by using the require method
   *
   * @param {Object} modules
   * @param {Object} sandbox
   * @return {Object} sandbox
   * @api private
   */
  addModules(modules = {}, sandbox = {}) {
    Object.keys(modules).forEach(key => {
      sandbox[key] = require(modules[key]);
      if (sandbox.window) {
        sandbox.window[key] = require(modules[key]);
      }
    });

    return sandbox;
  }

  /**
   * # addHtml
   *
   * Add the html pieces given by using the innerHTML to document of the sandbox.
   *
   * @param {Object} html
   * @return {Object} sandbox
   * @api public
   */
  addHtml(html = '') {
    if (!this.sandbox.document) {
      this.sandbox = this.createDom(this.sandbox);
    }

    this.sandbox.document.body.innerHTML = html;
    return this.sandbox;
  }

  /**
   * # setFilepath
   *
   * To set the file to be read.
   *
   * @param {String} filePath
   * @return {String} filePath
   * @api public
   */
  setFilepath(filePath = '') {
    if (!filePath) {
      throw new Error('load module path is not exist');
    }
    this.filePath = filePath;

    return this.filePath;
  }

  /**
   * # clear
   *
   * Return the sandbox to the initial state.
   *
   * @return {Boolena} true
   * @api public
   */
  clear() {
    if (typeof this.cleanup === 'function') {
      let __global = _.cloneDeep(global);
      global = this.sandbox;
      this.cleanup();
      global = _.cloneDeep(__global);
      __global = null;
    }

    this.sandbox = this.initSandbox;
    return true;
  }

  /**
   * # run
   *
   * Returns the context and executes the read code with the specified sandbox.
   *
   * @param {String} load file path
   * @param {Object} options
   * @return {Object} context
   * @api public
   */
  run(path = '', options = {}) {
    if (!path && !this.filePath) {
      throw new Error('load module path is not exist');
    }

    if (Object.getPrototypeOf(path).constructor === Object) {
      options = path;
      path = this.filePath;
    }

    const loadPath = typeof path === 'string' ? path : this.filePath;
    if (!this.filePath) {
      this.filePath = loadPath;
    }

    const appRoot = this.projectRoot(options.basePath);
    const filePath = `${appRoot}/${loadPath}`;
    const code = this.getCode(filePath, options);
    const vmOption = options.vm || [];
    this.sandbox = this.setSandbox(options);
    const context = this.runContext({code, sandbox: this.sandbox, option: vmOption});

    if (typeof this.cleanup === 'function') {
      this.cleanup();
    }

    return context;
  }
}

module.exports = ExportContext;
