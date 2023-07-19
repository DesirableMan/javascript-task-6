'use strict';

const invited = (friends, guestList = [], queue = [], guests = []) => {
    if (!queue.length) {
        queue = friends.filter((friend) => friend.best);
        guestList.push(queue);
        guests = queue.map((friend) => friend.name);
    }

    const nextQueue = queue
        .reduce((result, friend) => [...result, ...friend.friends], [])
        .filter((guest) => !guests.includes(guest))
        .map((name) => friends.find((friend) => friend.name === name));

    guests = guests.concat(nextQueue.map((friend) => friend.name));
    guestList.push(nextQueue);

    if (nextQueue.length) {
        invited(friends, guestList, nextQueue, guests);
    }

    return guestList;
};

/**
 * Фильтр друзей
 * @constructor
 */
class Filter {
    constructor() {
        this.mainFilter = () => true;
    }
    additionalFilter(friends, property, value) {
        return friends.filter((friend) => friend[property] === value);
    }
}

/**
 * Фильтр друзей
 * @extends Filter
 * @constructor
 */
class MaleFilter extends Filter {
    constructor() {
        super();
        this.mainFilter = (friends) =>
            this.additionalFilter(friends, 'gender', 'male');
    }

}

/**
 * Фильтр друзей-девушек
 * @extends Filter
 * @constructor
 */
class FemaleFilter extends Filter {
    constructor() {
        super();
        this.mainFilter = (friends) =>
            this.additionalFilter(friends, 'gender', 'female');
    }
}

/**
 * Итератор по друзьям
 * @constructor
 * @param {Object[]} friends
 * @param {Filter} filter
 */
class Iterator {
    constructor(friends, filter) {
        if (!(filter instanceof Filter)) {
            throw new TypeError('Not instance of Filter');
        }
        this.friends = friends;
        this.filter = filter;
        this._invitedFriends = invited(friends);
        this._initialized = false;
        this.stack = [];
    }

    done() {
        if (!this._initialized) {
            this._initialize();
        }

        return this.stack.length === 0;
    }

    next() {
        if (!this._initialized) {
            this._initialize();
        }
        if (this.stack.length > 0) {
            return this.stack.shift();
        }

        return null;
    }

    _initialize(length = this._invitedFriends.length) {
        const unpack = (arrays, maxLevel) => {
            let array = [];
            maxLevel = maxLevel > arrays.length ? arrays.length : maxLevel;
            for (let i = 0; i < maxLevel; i++) {
                array.push(
                    ...arrays[i].sort((a, b) => a.name.localeCompare(b.name))
                );
            }

            return [...new Set(array)];
        };
        this.stack = this.filter.mainFilter(
            unpack(this._invitedFriends, length)
        );
        this._initialized = true;
    }
}

/**
 * Итератор по друзям с ограничением по кругу
 * @extends Iterator
 * @constructor
 * @param {Object[]} friends
 * @param {Filter} filter
 * @param {Number} maxLevel – максимальный круг друзей
 */
class LimitedIterator extends Iterator {
    constructor(friends, filter, maxLevel) {
        super(friends, filter);
        this.maxLevel = maxLevel;
        this._initialized = true;
        if (maxLevel > 0) {
            this._initialize(maxLevel);
        }
    }
}


exports.Iterator = Iterator;
exports.LimitedIterator = LimitedIterator;

exports.Filter = Filter;
exports.MaleFilter = MaleFilter;
exports.FemaleFilter = FemaleFilter;
