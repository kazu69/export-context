import Greet from './example/esnext/greet.class.js';

function greeting(msg) {
    const greet = new Greet('Hello Private!');
    return greet.greeting();
}
