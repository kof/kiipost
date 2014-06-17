var blackList

blackList = {uncategorized: true}

/**
 * All rules for blacklisting tags.
 *
 * @param {String} tag
 * @return {Boolean} true if tag is ok
 */
module.exports = function(tag) {
    return !blackList[tag]
}
