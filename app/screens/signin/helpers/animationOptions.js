define(function(require, exports, module) {
    'use strict'

    var easing = require('famous/transitions/Easing')

    module.exports = {
        start: {
            logo: {
                top: 0.5,
                left: 0.5
            },
            slogan: {
                origin: [0.5, 0.5],
                opacity: 0
            },
            connect: {
                origin: [0.5, 0.85],
                opacity: 0
            },
            bg: {
                opacity: 0
            }
        },
        in: {
            logo: {
                left: 0.5,
                top: 0.32,
                transition: {
                    duration: 500,
                    curve: easing.inOutQuad
                }
            },
            slogan: {
                opacity: 1,
                transition: {duration: 500}
            },
            connect: {
                opacity: 1,
                top: 20,
                transition: {duration: 200}
            },
            bg: {
                opacity: 1,
                transition: {duration: 500}
            }
        },
        out: {
            connect: {
                opacity: 0,
                transition: {duration: 200}
            },
            slogan: {
                opacity: 0,
                transition: {duration: 200}
            },
            logo: {
                top: 70,
                left: 70,
                scale: 0.3,
                transition: {
                    duration: 500,
                    curve: easing.inOutQuad
                }
            }
        }
    }
})
