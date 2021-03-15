const moment = require('moment')

module.exports = {
    sortBySelect: (sortBy, value, options) => {
        if (sortBy == value) {
            return options.fn(this);
        }

    }
}