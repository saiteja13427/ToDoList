
exports.getDate = function (){
const date = new Date();

    var options = {
        weekday: 'long',
        day: 'numeric',
        month: 'long'
    }

    return date.toLocaleDateString('en-US', options);
}

exports.getDay = function (){
const date = new Date();

    var options = {
        weekday: 'long',
    }

    return date.toLocaleDateString('en-US', options);
}