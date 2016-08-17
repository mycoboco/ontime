/*
 *  regular expressions to recognize time representations
 */

'use strict'


module.exports = {
    norm: /^(?:(?:(?:(?:(?:(\d{4})-)?(\d{1,2})-)?(\d{1,2})\D)?(\d{1,2}):)?(\d{1,2}):)?(\d{1,2})$/,
    week: /^[a-z]+\s(\d{1,2}:\d{1,2}:\d{1,2})$/i
}

// end of fmt.js
