const moment = require('moment')

module.exports = {
    sortBySelect: (sortBy, options) => {
        return options
            .fn(this)
            .replace(
                new RegExp(' id="feature' + sortBy + '"'),
                '$& '
            )
    }
}