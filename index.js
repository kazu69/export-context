'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _vm = require('vm');

var _vm2 = _interopRequireDefault(_vm);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _babelCore = require('babel-core');

var babel = _interopRequireWildcard(_babelCore);

var _jsdomGlobal = require('jsdom-global');

var _jsdomGlobal2 = _interopRequireDefault(_jsdomGlobal);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _deepmerge = require('deepmerge');

var _deepmerge2 = _interopRequireDefault(_deepmerge);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var path = _path2.default;

var ExportContext = function () {
  function ExportContext() {
    var _this = this;

    _classCallCheck(this, ExportContext);

    this.initSandbox = {
      global: global,
      console: console,
      require: function (_require) {
        function require(_x) {
          return _require.apply(this, arguments);
        }

        require.toString = function () {
          return _require.toString();
        };

        return require;
      }(function (name) {
        return require(name);
      }),
      exports: exports,
      __dirname: __dirname
    };

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
    this.createGlobalDom = function () {
      _this.cleanup = (0, _jsdomGlobal2.default)();
      return _this.cleanup;
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
    this.projectRoot = function () {
      var setRoot = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;

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
    this.createDom = function () {
      var sandbox = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

      _this.createGlobalDom();
      return Object.assign(sandbox, {
        document: global.document,
        window: global.window
      });
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
    this.getCode = function () {
      var filepath = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';
      var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

      if (!filepath) {
        throw new Error('load file path is not exist');
      }

      if (options.babel) {
        return _this.babelifyedCode(filepath, options.babel);
      }

      if (!options.encode) {
        options.encode = 'utf8';
      }
      return _fs2.default.readFileSync(filepath, options.encode);
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
    this.babelifyedCode = function (filepath) {
      var option = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

      if (!filepath) {
        throw new Error('load file path is not exist');
      }

      var initOption = {
        presets: ['latest']
      };

      var babelOption = Object.assign(initOption, option);
      return babel.transformFileSync(filepath, babelOption).code;
    };

    /**
     * # getSandbox
     *
     * Set the sandbox.
     *
     * @param {Object} options
     * @return {Object} sandbox
     * @api private
     */
    this.getSandbox = function (options) {
      if (options.dom) {
        _this.sandbox = _this.addModules(options.modules, _this.createDom(_this.initSandbox));
      } else {
        _this.sandbox = _this.addModules(options.modules, _this.initSandbox);
      }

      if (options.sandbox) {
        _this.sandbox = (0, _deepmerge2.default)(_this.sandbox, options.sandbox);
      }

      if (options.html != '') {
        _this.addHtml(options.html);
      }

      return _this.sandbox;
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
    this.runContext = function (options) {
      if (!options.code) {
        options.code = '';
      }

      var sandbox = options.sandbox ? options.sandbox : _this.sandbox;
      var context = _vm2.default.createContext(sandbox);

      _vm2.default.runInNewContext(options.code, context);
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


  _createClass(ExportContext, [{
    key: 'addModules',
    value: function addModules() {
      var modules = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      var sandbox = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

      Object.keys(modules).forEach(function (key) {
        sandbox[key] = require(modules[key]);
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

  }, {
    key: 'addHtml',
    value: function addHtml() {
      var html = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';

      if (!this.sandbox.document) {
        this.createDom(this.sandbox);
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

  }, {
    key: 'setFilepath',
    value: function setFilepath() {
      var filePath = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';

      if (!filePath) {
        throw new Error('load module path is not exist');
      }
      return this.filePath = filePath;
    }

    /**
     * # clear
     *
     * Return the sandbox to the initial state.
     *
     * @return {Boolena} true
     * @api public
     */

  }, {
    key: 'clear',
    value: function clear() {
      if (typeof this.cleanup === 'function') {
        var __global = _lodash2.default.cloneDeep(global);
        global = this.sandbox;
        this.cleanup();
        global = _lodash2.default.cloneDeep(__global);
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

  }, {
    key: 'run',
    value: function run() {
      var path = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';
      var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

      if (!path && !this.filePath) {
        throw new Error('load module path is not exist');
      }

      if (Object.getPrototypeOf(path).constructor === Object) {
        options = path;
        path = this.filePath;
      }

      var loadPath = typeof path === 'string' ? path : this.filePath;
      if (!this.filePath) {
        this.filePath = loadPath;
      }

      var appRoot = this.projectRoot(options.basePath);
      var filePath = appRoot + '/' + loadPath;
      console.log(filePath);
      var code = this.getCode(filePath, options);
      console.log(1);
      this.sandbox = this.getSandbox(options);
      var context = this.runContext({ code: code, sandbox: this.sandbox });

      _vm2.default.runInNewContext(code, context);
      if (typeof this.cleanup === 'function') {
        this.cleanup();
      }

      return context;
    }
  }]);

  return ExportContext;
}();

module.exports = ExportContext;
