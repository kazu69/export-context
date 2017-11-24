'use strict';

import test from 'ava';
import * as babel from 'babel-core';
import sinon from 'sinon';
import path from 'path';
import fs from 'fs';
import vm from 'vm';
import ExportContext from '../index.js';
import domProperties from '../libs/properties';

const fn = new ExportContext;

test('constructor', t => {
    t.is(fn.sandbox.NODE_ENV, 'test');
});

test('createGlobalDom', t => {
    const res = fn.createGlobalDom();
    t.is(typeof res.document, 'object');
    t.is(typeof res.window, 'object');
    t.is(res.window.NODE_ENV, 'test');

    domProperties.forEach(key => {
        t.is(typeof res.window[key], 'function');
    });
});

test('projectRoot', t => {
    let res = fn.projectRoot();
    t.is(res, path.resolve(__dirname, '..', '..', '..'));

    res = fn.projectRoot('./');
    t.is(res, path.resolve(__dirname, '..'));
});

test('createDom', t => {
    const spy = sinon.spy(fn, 'createGlobalDom');
    const res = fn.createDom({});

    t.true(spy.calledOnce);
    t.true(res.hasOwnProperty('document'));
    t.true(res.hasOwnProperty('window'));
    fn.createGlobalDom.restore();
});

test('getCode', t => {
    const babelifyedCodeSpy = sinon.spy(fn, 'babelifyedCode');
    const path = 'test/fixtures/example.es6.js'
    const res = fn.getCode(path, { babel: { presets: ['latest'] }, encode: 'utf8'});

    t.true(babelifyedCodeSpy.calledOnce);
    t.true(babelifyedCodeSpy.calledWith(path));
    t.true(typeof(res) === 'string');
    fn.babelifyedCode.restore();
});

test('babelifyedCode', t => {
    const option = { presets: ['latest'] };
    const expect = babel.transformFileSync('test/fixtures/example.es6.js', option).code;
    t.is(fn.babelifyedCode('test/fixtures/example.es6.js'), expect);
});

test('setSandbox', t => {
    let expected = { sandbox: true };
    let result = fn.setSandbox({sandbox: expected});
    t.is(result.sandbox, expected.sandbox);

    result = fn.setSandbox({sandbox: expected, dom: true });
    t.true(result.hasOwnProperty('document'));
    t.true(result.hasOwnProperty('window'));

    const spy = sinon.spy(fn, 'addHtml');
    result = fn.setSandbox({sandbox: expected, dom: true, html: '<div>test</div>'});
    t.true(spy.calledOnce);
    fn.addHtml.restore();
});

test('runContext', t => {
    const spy = sinon.spy(vm, 'runInNewContext');
    const option = {filename: 'file/to/path'}
    const context = fn.runContext({code: 'var test = true;', sandbox: {}, option: option});
    t.is(context.test, true);
    t.true(spy.calledOnce);
    t.is(spy.args[0][2].filename, option.filename);
   spy.restore();
});

test('addModules', t => {
    const modules = { $: 'jquery' };
    const expected = { $: require('jquery') }

    let sandbox = {};
    let res = fn.addModules(modules, sandbox);

    t.is(res.$, expected.$);

    sandbox.window = {};
    res = fn.addModules(modules, sandbox);

    t.is(expected.$, res.window.$);
});

test('addHtml', t => {
    const html = '<div>test</div>';
    const sandbox = fn.addHtml(html);
    const body = sandbox.document.body;

    t.true(sandbox.hasOwnProperty('document'));
    t.true(sandbox.hasOwnProperty('window'));
    t.is(body.innerHTML, html);
});

test('setFilepath', t => {
    const path = 'fixtures/example.js'
    const result = fn.setFilepath(path);
    t.is(result, path);
});

test('clear', t => {
    const path = 'fixtures/example.js';
    const option = {
        basePath: './test',
        dom: true,
        html: '<div>test</div>'
    }
    const context = fn.run(path, option);
    const response = fn.clear();
    t.true(response);
    t.is(undefined, context.document);
});

test('run', t => {
    const path = 'fixtures/example.js';
    const option = {
        basePath: './test',
        dom: true,
        html: '<div>test</div>'
    }
    const setSandboxSpy = sinon.spy(fn, 'setSandbox');
    const runContextSpy = sinon.spy(fn, 'runContext');
    const getCodeSpy = sinon.spy(fn, 'getCode');
    let context = fn.run(path, option);

    t.true(typeof(context.greet) === 'function');
    t.true(typeof(context.greeting) === 'function');
    t.true(setSandboxSpy.withArgs(option).calledOnce);
    t.true(runContextSpy.calledOnce);
    t.true(getCodeSpy.calledOnce);

    context = fn.run(option);

    t.true(typeof(context.greet) === 'function');
    t.true(typeof(context.greeting) === 'function');
    t.true(setSandboxSpy.withArgs(option).calledTwice);
    t.true(runContextSpy.calledTwice);
    t.true(getCodeSpy.calledTwice);

    fn.setSandbox.restore();
    fn.runContext.restore();
    fn.getCode.restore();
});

test('run with es6', t => {
    const path = 'fixtures/example.es6.js';
    const option = {
        basePath: './test',
        babel: {
            presets: ['latest'],
            plugins: ['transform-runtime']
        }
    }
    let context = fn.run(path, option);
    const example = new context.exports.default();

    t.is(example.hello(), 'test');
});
