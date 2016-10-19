'use strict';

const chai = require('chai');
const assert = chai.assert;
const ExportContext = require('../../index.js');

const options = {
    basePath: './',
    dom: true,
    html: '<div id="example">This is example</div>',
    modules:{
        '$': 'jquery'
    }
}

const fn = new ExportContext;
const ctx = fn.run('example/using-mocha-chai/example.js', options);

describe('greet', () => {
    it('returns argument', () => {
        assert.strictEqual(ctx.greet('hello'), 'hello');
    });
});

describe('setText', () => {
    it('sets text to #example', () => {
        ctx.setText('hello')
        assert.strictEqual(ctx.document.querySelector('#example').textContent, 'hello');
    });
});

describe('getText', () => {
    it('gets text from #example', () => {
        ctx.setText('hello')
        assert.strictEqual(ctx.getText(), 'hello');
    });
});
