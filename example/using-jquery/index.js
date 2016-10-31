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

let ctx = fn.run('example/using-jquery/example.js', option);
console.log(ctx.greet('Hello Private!')); // => Hello Private!

// ctx.setText('Hello Private!');
console.log(ctx.getText()); // => Hello Private!

option.sandbox = { window: { test: true } };
ctx = fn.run(option);

ctx.$(ctx.document).on('DOMContentLoaded', function() {
    setTimeout(function() {
        console.log(ctx.window.res); // Hello jQeury Ready
    }, 10)
})

// trigger $(document).ready()
ctx.$(ctx.document).trigger('DOMContentLoaded');
