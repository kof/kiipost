var blackList

blackList = {uncategorized: true}

/**
 * All rules for blacklisting tags.
 *
 * @param {String} tag
 * @return {Boolean} true if tag is ok
 */
module.exports = function(tag) {
    if (!tag || String(tag).length < 2) return false
    return !blackList[tag]
}
