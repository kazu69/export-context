'use strict';

import test from 'ava';
import * as babel from 'babel-core';
import sinon from 'sinon';
import path from 'path';
import fs from 'fs';
import ExportContext from '../index.js';

const options = {
    basePath: './'
}

const fn = new ExportContext;

test('createGlobalDom', t => {
    const res = fn.createGlobalDom();
    t.is(typeof(res), 'function');
    t.is(res.name, 'cleanup');
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
    const path = 'fixtures/example.es6.js'
    const res = fn.getCode(path, { babel: { presets: ['latest'] }, encode: 'utf8'});

    t.true(babelifyedCodeSpy.calledOnce);
    t.true(babelifyedCodeSpy.calledWith(path));
    t.true(typeof(res) === 'string');
    fn.babelifyedCode.restore();
});

test('babelifyedCode', t => {
    const option = { presets: ['latest'] };
    const expect = babel.transformFileSync('fixtures/example.es6.js', option).code;
    t.is(fn.babelifyedCode('fixtures/example.es6.js'), expect);
});

test('addModules', t => {
    const modules = { $: 'jquery' };
    const sandbox = {};
    const expected = { $: require('jquery') }
    const res = fn.addModules(modules, sandbox);

    t.is(res.$, expected.$);
});

test('addHtml', t => {
    const spy = sinon.spy(fn, 'createDom');
    const html = '<div>test</div>';
    const sandbox = fn.addHtml(html);
    const body = sandbox.document.body;

    t.true(spy.calledOnce);
    t.is(body.innerHTML, html);
    fn.createDom.restore();
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
    const addModules = sinon.spy(fn, 'addModules');
    const addHtmlSpy = sinon.spy(fn, 'addHtml');
    const getCodeSpy = sinon.spy(fn, 'getCode');
    const context = fn.run(path, option);

    t.true(typeof(context.greet) === 'function');
    t.true(typeof(context.greeting) === 'function');
    t.true(addHtmlSpy.withArgs(option.html).calledOnce);
    t.true(addModules.calledOnce);
    t.true(getCodeSpy.calledOnce);
    fn.addHtml.restore();
    fn.addModules.restore();
    fn.getCode.restore();
});
