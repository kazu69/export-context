const ExportContext = require('../../index.js');
const fn = new ExportContext();
const option = {
    basePath: './',
    dom: true
}

option.modules = {
    '$': 'jquery'
};

// or append after create context
// ExportContext.addModules({ '$': 'jquery' });

option.html = '<div id="example">This is example</div>';
// or append after create context
// ExportContext.addHtml('<div id="example">This is example</div>');

const ctx = fn.run('example/using-dom-jquery/example.js', option);
console.log(ctx.document)
console.log(ctx.greet('Hello Private!')); // => Hello Private!
ctx.setText('Hello Private!');
console.log(ctx.getText()); // => Hello Private!
fn.clear();
