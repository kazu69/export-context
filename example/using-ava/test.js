'use strict';

import test from 'ava';
import ExportContext from '../../index.js';

const options = {
    basePath: './',
    dom: true,
    html: '<div id="example">This is example</div>',
    modules:{
        '$': 'jquery'
    }
}

const fn = new ExportContext;
const ctx = fn.run('example/using-ava/example.js', options);

test('greet', t => {
    t.is(ctx.greet('hello'), 'hello');
});

test('setText', t => {
    ctx.setText('hello');
    t.is('hello', ctx.document.querySelector('#example').textContent);
});

test('getText', t => {
    ctx.setText('hello');
    t.is(ctx.getText(), 'hello');
});