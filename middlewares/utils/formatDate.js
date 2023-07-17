const moment = require('moment')

const formatDate = function(date) {
    return moment(date).utcOffset("+07:00").format('DD-MM-YYYY HH:mm:ss');
}

const formatDate1 = function(date) {
    return moment(date).utcOffset("+07:00").format('YYYY-MM-DD');
}

const formatDate2 = function(date) {
    return moment(date).utcOffset("+07:00").format('MM-YYYY');
}


module.exports = {
    formatDate,
    formatDate1,
    formatDate2
}