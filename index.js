var Promise = require('pinkie-promise');

function cancelableRace (promises) {
    function cancelPending () {
        return promises
            .filter(function (promise) {
                return typeof promise.cancel === 'function';
            })
            .map(function (promise){
                return promise.cancel();
            });
    }

    return Promise
        .race(promises)
        .then(function (result) {
            cancelPending(promises);

            return result;
        })
        .catch(function (error) {
            cancelPending(promises);

            throw error;
        });
}

module.exports = cancelableRace;
