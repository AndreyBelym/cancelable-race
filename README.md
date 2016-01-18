# cancelable-race
[![Build Status](https://travis-ci.org/AndreyBelym/cancelable-race.svg?branch=master)](https://travis-ci.org/AndreyBelym/cancelable-race)

*Pumped up [Promice.race](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/race) that is aware of cancelable Promises.*

## Install
```
npm install cancelable-race
```

## Usage
Are you tired of manually clearing timeouts or removing event listeners from emitters?
Especially when you have a bunch of timeouts/events/other Promises and you are waiting for just one of them?
Just wrap them to cancelable promises (e.g. with help of 'promisify-event' module) and use with this tiny module!
```
    cancelableRace([
        //Use 'promisifyEvent' module to wrap emitter.once(event) in cancelable Promise!
        promisifyEvent(emitter, 'test-event'),

        //You can use plain Promises too, but they will not be canceled.
        new Promise(function (resolve) {
            setTimeout(function () {
                resolve('timeout1')
            }, 100);
        }),

        //It will be rejected when you call emitter.emit('error')
        promisifyEvent(emitter, 'error')
    ])
    .then(function (result) {
        //Handle 'result' of soonest resolved promise
    })
    .catch(function (error) {
        //Handle 'error' raised by one of specified promises
    });
```
In order to cancel a pending Promise, it must have a `cancel` method. There are requirements assumed for the method:
1. 'cancel' should leave Promise in pending state and prevent it from becoming settled.
2. 'cancel' is a synchronous function.
3. 'cancel' may be called on already settled Promised, but the call has no effect.
