function greet(message) {
    return message;
}

function setText(text) {
    $('#example').text(text);
}

function getText() {
    return $('#example').text();
}

$(function() {
    if(window && window.test) {
        window.res = greet('Hello jQeury Ready');
    }
});
