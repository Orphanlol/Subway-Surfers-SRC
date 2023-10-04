"use strict";
// CC0 Public Domain: http://creativecommons.org/publicdomain/zero/1.0/
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    }
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * SignalLink implements a doubly-linked ring with nodes containing the signal handlers.
 */
var SignalLink = /** @class */ (function () {
    function SignalLink(prev, next, order) {
        if (prev === void 0) { prev = null; }
        if (next === void 0) { next = null; }
        if (order === void 0) { order = 0; }
        this.enabled = true;
        this.newLink = false;
        this.callback = null;
        this.prev = prev ? prev : this;
        this.next = next ? next : this;
        this.order = order;
    }
    SignalLink.prototype.isEnabled = function () {
        return this.enabled && !this.newLink;
    };
    SignalLink.prototype.setEnabled = function (flag) {
        this.enabled = flag;
    };
    SignalLink.prototype.unlink = function () {
        this.callback = null;
        this.next.prev = this.prev;
        this.prev.next = this.next;
    };
    SignalLink.prototype.insert = function (callback, order) {
        var after = this.prev;
        while (after !== this) {
            if (after.order <= order)
                break;
            after = after.prev;
        }
        var link = new SignalLink(after, after.next, order);
        link.callback = callback;
        after.next = link;
        link.next.prev = link;
        return link;
    };
    return SignalLink;
}());
/**
 * Implementation of SignalConnection, for internal use only.
 */
var SignalConnectionImpl = /** @class */ (function () {
    /**
     * @param head The head link of the signal.
     * @param link The actual link of the connection.
     */
    function SignalConnectionImpl(head, link) {
        this.link = link;
    }
    SignalConnectionImpl.prototype.disconnect = function () {
        if (this.link !== null) {
            this.link.unlink();
            this.link = null;
            return true;
        }
        return false;
    };
    Object.defineProperty(SignalConnectionImpl.prototype, "enabled", {
        get: function () {
            return this.link !== null && this.link.isEnabled();
        },
        set: function (enable) {
            if (this.link)
                this.link.setEnabled(enable);
        },
        enumerable: true,
        configurable: true
    });
    return SignalConnectionImpl;
}());
/**
 * Represents a list of connections to a signal for easy disconnect.
 */
var SignalConnections = /** @class */ (function () {
    function SignalConnections() {
        this.list = [];
    }
    /**
     * Add a connection to the list.
     * @param connection
     */
    SignalConnections.prototype.add = function (connection) {
        this.list.push(connection);
    };
    /**
     * Disconnect all connections in the list and empty the list.
     */
    SignalConnections.prototype.disconnectAll = function () {
        for (var _i = 0, _a = this.list; _i < _a.length; _i++) {
            var connection = _a[_i];
            connection.disconnect();
        }
        this.list = [];
    };
    return SignalConnections;
}());
exports.SignalConnections = SignalConnections;
/**
 * A signal is a way to publish and subscribe to events.
 *
 * @typeparam CB The function signature to be implemented by handlers.
 */
var Signal = /** @class */ (function () {
    /**
     * Create a new signal.
     */
    function Signal() {
        this.head = new SignalLink();
        this.hasNewLinks = false;
        this.emitDepth = 0;
        this.emit = this.emitInternal.bind(this);
    }
    /**
     * Subscribe to this signal.
     *
     * @param callback This callback will be run when emit() is called.
     * @param order Handlers with a higher order value will be called later.
     */
    Signal.prototype.connect = function (callback, order) {
        if (order === void 0) { order = 0; }
        var link = this.head.insert(callback, order);
        if (this.emitDepth > 0) {
            this.hasNewLinks = true;
            link.newLink = true;
        }
        return new SignalConnectionImpl(this.head, link);
    };
    /**
     * Unsubscribe from this signal with the original callback instance.
     * While you can use this method, the SignalConnection returned by connect() will not be updated!
     *
     * @param callback The callback you passed to connect().
     */
    Signal.prototype.disconnect = function (callback) {
        for (var link = this.head.next; link !== this.head; link = link.next) {
            if (link.callback === callback) {
                link.unlink();
                return true;
            }
        }
        return false;
    };
    /**
     * Disconnect all handlers from this signal event.
     */
    Signal.prototype.disconnectAll = function () {
        while (this.head.next !== this.head) {
            this.head.next.unlink();
        }
    };
    Signal.prototype.emitInternal = function () {
        this.emitDepth++;
        for (var link = this.head.next; link !== this.head; link = link.next) {
            if (link.isEnabled() && link.callback)
                link.callback.apply(null, arguments);
        }
        this.emitDepth--;
        this.unsetNewLink();
    };
    Signal.prototype.emitCollecting = function (collector, args) {
        this.emitDepth++;
        for (var link = this.head.next; link !== this.head; link = link.next) {
            if (link.isEnabled() && link.callback) {
                var result = link.callback.apply(null, args);
                if (!collector.handleResult(result))
                    break;
            }
        }
        this.emitDepth--;
        this.unsetNewLink();
    };
    Signal.prototype.unsetNewLink = function () {
        if (this.hasNewLinks && this.emitDepth == 0) {
            for (var link = this.head.next; link !== this.head; link = link.next)
                link.newLink = false;
            this.hasNewLinks = false;
        }
    };
    return Signal;
}());
exports.Signal = Signal;
/**
 * Base class for collectors.
 *
 * @typeparam CB The function signature to be implemented by handlers.
 * @typeparam RT The return type of CB
 */
var Collector = /** @class */ (function () {
    /**
     * Create a new collector.
     *
     * @param signal The signal to emit.
     */
    function Collector(signal) {
        var self = this;
        this.emit = function () { signal.emitCollecting(self, arguments); };
    }
    return Collector;
}());
exports.Collector = Collector;
/**
 * Returns the result of the last signal handler from a signal emission.
 *
 * @typeparam CB The function signature to be implemented by handlers.
 * @typeparam RT The return type of CB
 */
var CollectorLast = /** @class */ (function (_super) {
    __extends(CollectorLast, _super);
    function CollectorLast() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    CollectorLast.prototype.handleResult = function (result) {
        this.result = result;
        return true;
    };
    /**
     * Get the result of the last signal handler.
     */
    CollectorLast.prototype.getResult = function () {
        return this.result;
    };
    /**
     * Reset the result
     */
    CollectorLast.prototype.reset = function () {
        delete this.result;
    };
    return CollectorLast;
}(Collector));
exports.CollectorLast = CollectorLast;
/**
 * Keep signal emissions going while all handlers return true.
 *
 * @typeparam CB The function signature to be implemented by handlers.
 * Return type of CB must be boolean.
 */
var CollectorUntil0 = /** @class */ (function (_super) {
    __extends(CollectorUntil0, _super);
    function CollectorUntil0() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.result = false;
        return _this;
    }
    CollectorUntil0.prototype.handleResult = function (result) {
        this.result = result;
        return this.result ? true : false;
    };
    /**
     * Get the result of the last signal handler.
     */
    CollectorUntil0.prototype.getResult = function () {
        return this.result;
    };
    /**
     * Reset the result
     */
    CollectorUntil0.prototype.reset = function () {
        this.result = false;
    };
    return CollectorUntil0;
}(Collector));
exports.CollectorUntil0 = CollectorUntil0;
/**
 * Keep signal emissions going while all handlers return false.
 *
 * @typeparam CB The function signature to be implemented by handlers.
 * Return type of CB must be boolean.
 */
var CollectorWhile0 = /** @class */ (function (_super) {
    __extends(CollectorWhile0, _super);
    function CollectorWhile0() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.result = false;
        return _this;
    }
    CollectorWhile0.prototype.handleResult = function (result) {
        this.result = result;
        return this.result ? false : true;
    };
    /**
     * Get the result of the last signal handler.
     */
    CollectorWhile0.prototype.getResult = function () {
        return this.result;
    };
    /**
     * Reset the result
     */
    CollectorWhile0.prototype.reset = function () {
        this.result = false;
    };
    return CollectorWhile0;
}(Collector));
exports.CollectorWhile0 = CollectorWhile0;
/**
 * Returns the result of the all signal handlers from a signal emission in an array.
 *
 * @typeparam CB The function signature to be implemented by handlers.
 * @typeparam RT The return type of CB
 */
var CollectorArray = /** @class */ (function (_super) {
    __extends(CollectorArray, _super);
    function CollectorArray() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.result = [];
        return _this;
    }
    CollectorArray.prototype.handleResult = function (result) {
        this.result.push(result);
        return true;
    };
    /**
     * Get the list of results from the signal handlers.
     */
    CollectorArray.prototype.getResult = function () {
        return this.result;
    };
    /**
     * Reset the result
     */
    CollectorArray.prototype.reset = function () {
        this.result.length = 0;
    };
    return CollectorArray;
}(Collector));
exports.CollectorArray = CollectorArray;
//# sourceMappingURL=Signal.js.map