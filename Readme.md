# export-context

![](https://badge.fury.io/js/export-context.png)
[![Build Status](https://travis-ci.org/kazu69/export-context.svg?branch=master)](https://travis-ci.org/kazu69/export-context)

> A method that has not been export can be run via the context.
> It will be able to unit test of unexport methods.
> Further, if necessary of dom can test by creating a document in global.
> Esnext code is transpile using the babel.

## install

```sh
npm install export-context --save-dev
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

see at [example](example/)

## License

[MIT License](http://en.wikipedia.org/wiki/MIT_License)
