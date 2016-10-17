const ExportContext = require('../../index.js');
const options = {
    basePath: './',
    babel: { presets: ['latest'] }
};

const exportContext = new ExportContext;
const ctx = exportContext.run('example/esnext/private.js', options);

// Called through the context
console.log(ctx.greeting()); // => Hello Private!
