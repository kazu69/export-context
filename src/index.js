import nativePath from 'path';
import vm from 'vm';
import fs from 'fs';
import * as babel from 'babel-core';
import jsdom from 'jsdom-global';
import _ from 'lodash';

const path = nativePath;

class ExportContext {
  constructor() {
    this.initSandbox = {
      global,
      console,
      require: name => {
        return require(name);
      },
      exports,
      __dirname
    };

    this.sandbox = this.initSandbox;
    this.cleanup = null;

    // private methods
    this.createGlobalDom = () => {
      this.cleanup = jsdom();
      return this.cleanup;
    }

    this.projectRoot = (setRoot = null) => {
      if (!setRoot) {
        return path.resolve(__dirname, '..', '..');
      }

      return path.resolve(__dirname, setRoot.replace(/\/$/, ''));
    }

    this.createDom = (sandbox = {}) => {
      this.createGlobalDom();
      return Object.assign(sandbox, {
        document: global.document,
        window: global.window
      });
    }

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
    }

    this.babelifyedCode = (filepath, option = {}) => {
      if (!filepath) {
        throw new Error('load file path is not exist');
      }

      const initOption = {
        presets: ['latest']
      };

      const babelOption = Object.assign(initOption, option);
      return babel.transformFileSync(filepath, babelOption).code;
    }
  }

  addModules(modules = {}, sandbox = {}) {
    Object.keys(modules).forEach(key => {
      sandbox[key] = require(modules[key]);
    });

    return sandbox;
  }

  addHtml(html = '') {
    if (!this.sandbox.document) {
      this.createDom(this.sandbox);
    }

    this.sandbox.document.body.innerHTML = html;
    return this.sandbox;
  }

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

  run(path = '', options = {}) {
    if (!path) {
      throw new Error('load module path is not exist');
    }

    const appRoot = this.projectRoot(options.basePath);
    const filePath = `${appRoot}/${path}`;

    if (options.dom) {
      this.sandbox = this.addModules(options.modules, this.createDom(this.initSandbox));
    } else {
      this.sandbox = this.addModules(options.modules, this.initSandbox);
    }

    if (options.html) {
      this.addHtml(options.html);
    }

    const code = this.getCode(filePath, options);
    const context = vm.createContext(this.sandbox);

    vm.runInNewContext(code, context);
    if (typeof this.cleanup === 'function') {
      this.cleanup();
    }

    return context;
  }
}

module.exports = ExportContext;
