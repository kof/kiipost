'use strict'

test('transform keys', function() {
    deepEqual(transformKeys({'a_a': 1}, 'camelize'), {aA: 1}, '1. level camelize')
    deepEqual(transformKeys({'a_a': null}, 'camelize'), {aA: null}, '1. level camelize, val null')
    deepEqual(transformKeys({'a_a': {'b_b': 1}}, 'camelize', true), {aA: {bB: 1}}, 'deep camelize')
    deepEqual(transformKeys(['a'], 'camelize'), ['a'], 'array without deep')
    deepEqual(transformKeys(['a'], 'camelize', true), ['a'], 'array with deep without objects')
    deepEqual(transformKeys([{'a_a': 1}], 'camelize', true), [{aA: 1}], 'array with deep with objects')
})
