var assert         = require('assert');
var EventEmitter   = require('events').EventEmitter;
var Promise        = require('pinkie-promise');
var promisifyEvent = require('promisify-event');
var cancelableRace = require('../');

it('Should race multiple events', function () {
    var emitter = new EventEmitter();

    var promise = cancelableRace([
        promisifyEvent(emitter, 'test-event1'),
        promisifyEvent(emitter, 'test-event2'),
        promisifyEvent(emitter, 'test-event3')
    ]);

    emitter.emit('test-event2', 'test2', 'data2');

    return promise
        .then(function (res) {
            assert.deepEqual(res, ['test2', 'data2']);
            assert.strictEqual(emitter.listeners('test-event1').length, 0);
            assert.strictEqual(emitter.listeners('test-event2').length, 0);
            assert.strictEqual(emitter.listeners('test-event3').length, 0);
        })
});

it('Should race multiple events along with error', function () {
    var emitter = new EventEmitter();

    var promise = cancelableRace([
        promisifyEvent(emitter, 'test-event1'),
        promisifyEvent(emitter, 'test-event2'),
        promisifyEvent(emitter, 'error')
    ]);

    emitter.emit('error', 'error-data');

    return promise
        .then(function () {
            throw new Error('Promise rejection expected!');
        })
        .catch(function (err) {
            assert.strictEqual(err, 'error-data');
            assert.strictEqual(emitter.listeners('test-event1').length, 0);
            assert.strictEqual(emitter.listeners('test-event2').length, 0);
            assert.strictEqual(emitter.listeners('test-event3').length, 0);
        })
});

it('Should race multiple events along with another promises', function () {
    var emitter = new EventEmitter();

    var promise = cancelableRace([
        promisifyEvent(emitter, 'test-event1'),
        new Promise(function (resolve) {
            setTimeout(function () {
                resolve('timeout1')
            }, 100);
        }),
        promisifyEvent(emitter, 'test-event2'),
        new Promise(function (resolve) {
            setTimeout(function () {
                resolve('timeout2')
            }, 150);
        }),
        promisifyEvent(emitter, 'test-event3')
    ]);

    return promise
        .then(function (res) {
            assert.strictEqual(res, 'timeout1');
            assert.strictEqual(emitter.listeners('test-event1').length, 0);
            assert.strictEqual(emitter.listeners('test-event2').length, 0);
            assert.strictEqual(emitter.listeners('test-event3').length, 0);
        })
});
