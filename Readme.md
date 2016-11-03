# export-context

![](https://badge.fury.io/js/export-context.png)
[![Build Status](https://travis-ci.org/kazu69/export-context.svg?branch=master)](https://travis-ci.org/kazu69/export-context)

> A method that has not been export can be run via the context.
> It will be able to unit test of unexport methods.
> Further, if necessary of dom can test by creating a document in global.
> Esnext code is transpile using the babel.

[](media/export-context.png)

## install

```sh
npm install export-context --save-dev

# or if using yarn

yarn
```

## setup

```js
import ExportContext from 'export-context';

// configure option
const options = {
    basePath: './',
    babel: {
        presets: ['latest'],
        plugins: ['transform-runtime']
    },
    dom: true,
    html: '<div class="box">example</div>'
};

const modules = {
    '_': 'lodash',
    '$': 'jquery'
};

const html = '<span class="comment">example commnet</span>';

const exportContext = new ExportContext;

// add dependent modules setting
exportContext.addModules(modules);

// add html code
exportContext.addHtml(html);

// get context
const ctx = exportContext.run('TARGET/FILE/PATH.js', options);

// ctx has unexported method
// ... some code ...

// clear sandbox dom settings
exportContext.clear()
```

## API

### setFilepath(filePath = '')

Set default load file path

### addModules(modules = {}, sandbox = {})

Add the module to require at the time of context run.

### addHtml(html = '')

Add the html to the context that you want to run.

### clear()

Remove the dom in the global from the execution context.

### run(filePath = '', options = {})

Run the contents of the passed file path. You can have the option, if necessary.
Executed context will be returned.
The options are as follows.

If already in the path has been set (using the ```setfilePath()```), ```run(options)``` method can be performed only in the only option.

#### Options

##### basePath

Specify the directory to be a base to load the file to be executed.
(default: Projectroot).

##### babel

Code using esnext will run transformer pile in the babel.
You can set the options to be passed to the babel.
(default: null)

##### dom

If you run the code using DOM, please be true to this option.
To provide the necessary properties to global, you will be able to use the dom api.
(default: null)

##### html

If you want to set a pre-html adds html.
(default: null)

## example

see at below.

- [using jquery with dom example](example/using-jquery)
- [using esnext example](example/esnext)
- [using ava example](example/using-ava)
- [using tape example](example/using-tape)
- [using mocha chai example](example/using-mocha-chai)

## License

[MIT License](http://en.wikipedia.org/wiki/MIT_License)
