'use strict';

const test = require('tape');
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
const ctx = fn.run('example/using-tape/example.js', options);

test('greet', t => {
    t.plan(1);
    t.equal(ctx.greet('hello'), 'hello');
    t.end();
});

test('setText', t => {
    ctx.setText('hello');
    t.plan(1);
    t.equal('hello', ctx.document.querySelector('#example').textContent);
    t.end();
});

test('getText', t => {
    ctx.setText('hello');
    t.plan(1);
    t.equal(ctx.getText(), 'hello');
    t.end();
});
