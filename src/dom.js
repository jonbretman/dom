(function () {

    var doc = document;
    var win = window;
    var push = [].push;
    var slice = [].slice;
    var filter = [].filter;
    var toString = {}.toString;
    var testEl = doc.createElement('div');
    var prototype = 'prototype';
    var length = 'length';
    var parentNode = 'parentNode';
    var classList = 'classList';
    var className = 'className';
    var forEach = 'forEach';
    var each = 'each';
    var querySelectorAll = 'querySelectorAll';
    var removeEventListener = 'removeEventListener';
    var idRegEx = /^#[\w\-_]+$/;
    var classRegEx = /^\.[\w\-_]+$/;
    var tagRegEx = /^[a-z]+$/;
    var htmlRegEx = /^<.*?>$/;
    var addClass, removeClass, hasClass;
    var domReadyListeners = [];
    var domReadyListener;
    var domContentLoaded = 'DOMContentLoaded';
    var domIsReady = /^loaded|^i|^c/.test(doc.readyState);

    if (!domIsReady) {
        doc.addEventListener(domContentLoaded, domReadyListener = function () {
            doc[removeEventListener](domContentLoaded, domReadyListener, false);
            domIsReady = true;
            domReadyListener = domReadyListeners.shift();

            while (domReadyListener) {
                domReadyListener(dom);
                domReadyListener = domReadyListeners.shift();
            }
        }, false);
    }

    /**
     * Main entry method.
     * @param {String|HTMLElement|Array} [selector]
     * @returns {Dom}
     */
    var dom = function (selector) {
        return new Dom(selector);
    };

    /**
     * Returns true if arr is array-like.
     * Checking typeof !== 'string' due to bug in PhantomJS that returns 'object' for typeof NodeList
     * @param {*} arr
     * @returns {boolean}
     */
    var arrayLike = function (arr) {
        return arr && isFinite(arr[length]) && typeof arr !== 'string';
    };

    /**
     * Returns true if el is an HTMLElement.
     * @param {*} el
     * @returns {boolean}
     */
    var isElement = function (el) {
        return el && el.nodeType === 1;
    };

    var generateTypeMethod = function (type) {
        return function (obj) {
            return toString.call(obj) === '[object ' + type + ']';
        };
    };

    /**
     *
     * @param s
     * @returns {boolean}
     */
    var isString = generateTypeMethod('String');

    /**
     *
     * @param fn
     * @returns {boolean}
     */
    var isFunction = generateTypeMethod('Function');

    /**
     *
     * @param obj
     * @returns {boolean}
     */
    var isObject = generateTypeMethod('Object');

    /**
     * Converts a string to camel case.
     * @param {string} str
     * @returns {string}
     */
    var normaliseCSSProperty = function (str) {
        return str === 'float' ? 'cssFloat' : str.replace(/-(\w)/g, function (match, group) {
            return group.toUpperCase();
        });
    };

    /**
     *
     * @param html
     * @returns {*|Array}
     */
    var fromHtml = function (html) {
        testEl.innerHTML = html;
        var result = slice.call(testEl.children);
        testEl.innerHTML = '';
        return result;
    };

    /**
     *
     * @param selector
     * @returns {Function}
     */
    var filterSelector = function (selector) {
        return function (element) {
            return dom(element).is(selector);
        };
    };

    if (testEl[classList] && testEl[classList].add) {
        addClass = function (el, c) {
            el[classList].add(c);
        };
        removeClass = function (el, c) {
            el[classList].remove(c);
        };
        hasClass = function (el, c) {
            return el[classList].contains(c);
        };
    }
    else {
        addClass = function (el, c) {
            var cls = el[className] ? el[className].split(' ') : [];
            if (cls.indexOf(c) === -1) {
                cls.push(c);
            }
            el[className] = cls.join(' ');
        };
        removeClass = function (el, c) {
            var cls = el[className].split(' ').filter(function (cl) {
                return cl && cl !== c;
            });
            el[className] = cls.length ? cls.join(' ') : '';
        };
        hasClass = function (el, c) {
            return el[className].split(' ').indexOf(c) !== -1;
        };
    }

    /**
     *
     * @param selector
     * @returns {Dom}
     * @constructor
     */
    var Dom = function (selector) {

        if (!selector) {
            return this;
        }

        // jQuery's $(function () {}) behaviour
        if (isFunction(selector)) {
            this[0] = doc;
            this.length = 1;
            if (domIsReady) {
                selector(dom);
            }
            else {
                domReadyListeners.push(selector);
            }
            return this;
        }

        // fast track 'document' and 'body' selectors
        selector = selector === 'body' ? doc.body : selector === 'document' ? doc : selector;

        // optimize for id selector
        if (idRegEx.test(selector)) {
            selector = doc.getElementById(selector.substring(1));

            if (!selector) {
                return this;
            }
        }

        // an element, the document, or window
        if (isElement(selector) || selector === doc || selector === win) {
            this[0] = selector;
            this[length] = 1;
            return this;
        }

        // html string to be converted into dom elements
        if (isString(selector) && htmlRegEx.test(selector)) {
            selector = fromHtml(selector);
        }

        // array, NodeList etc...
        if (arrayLike(selector)) {
            push.apply(this, slice.call(selector));
            return this;
        }

        // perform dom query
        return this.find(selector, document);
    };

    Dom[prototype] = {

        /**
         *
         */
        length: 0,

        /**
         *
         * @param {String} selector
         * @param {HTMLElement} [root] Only used internally.
         * @returns {Dom}
         */
        find: function (selector, root) {

            if (!isString(selector)) {
                return dom();
            }

            var results;
            var method = querySelectorAll;

            if (classRegEx.test(selector)) {
                method = 'getElementsByClassName';
                selector = selector.substring(1);
            }
            else if (tagRegEx.test(selector)) {
                method = 'getElementsByTagName';
            }

            if (this[length] > 0) {
                results = [];
                for (var i = 0; i < this[length]; i++) {
                    // catch SyntaxError's for querySelectorAll and querySelector
                    try {
                        results.push.apply(results, slice.call(this[i][method](selector)));
                    }
                    catch (e) {}
                }
            }
            else if (root) {
                results = root[method](selector);
            }

            return dom(results);
        },

        /**
         *
         * @param {Function} fn
         * @returns {Dom}
         */
        each: function (fn) {

            if (!isFunction(fn)) {
                return this;
            }

            for (var i = 0; i < this[length]; i++) {
                fn.call(this[i], this[i], i);
            }

            return this;
        },

        /**
         *
         * @param {Function} fn
         * @returns {Dom}
         */
        map: function (fn) {

            if (!isFunction(fn)) {
                return this;
            }

            return dom([].map.call(this, function (el, i) {
                return fn.call(el, el, i);
            }));
        },

        /**
         *
         * @param {Function} fn
         * @returns {Dom}
         */
        filter: function (fn) {

            if (!isFunction(fn) && !isString(fn)) {
                return this;
            }

            return dom(filter.call(this, isString(fn) ? filterSelector(fn) : function (el, i) {
                return fn.call(el, el, i);
            }));
        },

        /**
         *
         */
        toArray: slice,

        /**
         *
         */
        slice: slice,

        /**
         *
         * @param {String} c
         * @returns {Boolean}
         */
        hasClass: function (c) {
            return this[length] === 0 ? false : hasClass(this[0], c);
        },

        /**
         *
         * @param {String} selector
         * @returns {Dom}
         */
        closest: function (selector) {

            if (this[length] === 0) {
                return dom();
            }

            var target = this[0];

            while (target && target !== doc.body) {

                if (dom(target).is(selector)) {
                    return dom(target);
                }

                target = target[parentNode];
            }

            return dom();
        },

        /**
         *
         * @param {String|HTMLElement} selector
         * @returns {Boolean}
         */
        is: function (selector) {

            for (var i = 0, el; i < this[length]; i++) {

                el = this[i];

                if (!selector) {
                    continue;
                }

                if (isElement(selector)) {
                    if (el === selector) {
                        return true;
                    }
                    else {
                        continue;
                    }
                }

                var matchesSelector = el.webkitMatchesSelector ||
                    el.mozMatchesSelector ||
                    el.oMatchesSelector ||
                    el.matchesSelector ||
                    el.matches;

                if (matchesSelector) {
                    if (matchesSelector.call(el, selector)) {
                        return true;
                    }
                    else {
                        continue;
                    }
                }

                //fall back to performing a selector:
                var match;
                var parent = el[parentNode];
                var temp = !parent;

                if (temp) {
                    parent = testEl;
                    parent.appendChild(el);
                }

                match = slice.call(parent[querySelectorAll](selector)).indexOf(el) !== -1;

                if (temp) {
                    testEl.removeChild(el);
                }

                if (match) {
                    return true;
                }
            }

            return false;
        },

        /**
         *
         * @returns {Dom}
         */
        first: function () {
            return this.eq(0);
        },

        /**
         *
         * @returns {Dom}
         */
        last: function () {
            return this.eq(-1);
        },

        /**
         *
         * @param {Number} n
         * @returns {Dom}
         */
        eq: function (n) {
            if (n < 0) {
                return this[length] + n >= 0 ? dom(this[this[length] + n]) : dom();
            }
            return this[length] - 1 >= n ? dom(this[n]) : dom();
        },

        /**
         *
         * @param {Number} n
         * @returns {HTMLElement|Null}
         */
        get: function (n) {
            if (!arguments[length]) {
                return this.toArray();
            }
            if (n < 0) {
                return this[length] + n >= 0 ? this[this[length] + n] : null;
            }
            return this[length] - 1 >= n ? this[n] : null;
        },

        /**
         *
         * @param {String} event
         * @param {Function} fn
         * @returns {Dom}
         */
        on: function (event, fn) {
            return this[each](function () {
                this.addEventListener(event, fn, false);
            });
        },

        /**
         *
         * @param {String} event
         * @param {Function} fn
         * @returns {Dom}
         */
        once: function (event, fn) {
            return this.on(event, function handler() {
                this[removeEventListener](event, handler, false);
                return fn.apply(this, arguments);
            });
        },

        /**
         *
         * @param {String} eventName
         */
        trigger: function (eventName) {
            return this.each(function (el) {

                var event, eventClass;

                switch (eventName) {
                    case 'click':
                    case 'mousedown':
                    case 'mouseup':
                        eventClass = 'MouseEvents';
                        break;

                    case 'focus':
                    case 'change':
                    case 'blur':
                    case 'select':
                        eventClass = 'HTMLEvents';
                        break;
                    default:
                        return;
                }

                event = doc.createEvent(eventClass);
                event.initEvent(eventName, true, true);
                event.synthetic = true;
                el.dispatchEvent(event, true);
            });
        },

        /**
         *
         * @param {String} event
         * @param {Function} fn
         * @returns {Dom}
         */
        off: function (event, fn) {
            return this[each](function () {
                this[removeEventListener](event, fn, false);
            });
        },

        /**
         *
         * @returns {Dom}
         */
        remove: function () {
            return this[each](function () {
                if (this[parentNode]) {
                    this[parentNode].removeChild(this);
                }
            });
        },

        /**
         *
         * @param {String} key
         * @param {String} [value]
         * @returns {String|Null|Dom}
         */
        attr: function (key, value) {

            if (arguments[length] === 1) {
                return this[length] > 0 ? this[0].getAttribute(key) : null;
            }

            var method = !value ? 'removeAttribute' : 'setAttribute';

            return this[each](function () {
                this[method](key, value);
            });
        },

        /**
         *
         * @param {String} key
         * @param {String} [value]
         * @returns {String|Undefined|Dom}
         */
        prop: function (key, value) {

            if (arguments[length] === 1) {
                return this[length] > 0 ? this[0][key] : undefined;
            }

            return this[each](function () {
                this[key] = value;
            });
        },

        /**
         *
         * @param {String} key
         * @returns {String[]}
         */
        pluck: function (key) {
            return this.map(function (element) {
                return element[key];
            }).toArray();
        },

        /**
         *
         * @param {String} [value]
         * @returns {String[]|String|Dom}
         */
        val: function (value) {

            if (arguments[length] === 0) {

                if (this[0].multiple) {
                    return dom(this[0]).find('option').filter(function () {
                        return this.selected;
                    }).pluck('value');
                }
                else {
                    return this[0].value;
                }

            }

            return this[each](function () {
                this.value = value;
            });
        },

        /**
         *
         * @param {String} [selector]
         * @returns {Dom}
         */
        children: function (selector) {
            var results = [];

            this[each](function () {
                results.push.apply(results, filter.call(this.childNodes, isElement));
            });

            if (isString(selector)) {
                results = results.filter(filterSelector(selector));
            }

            return dom(results);
        },

        /**
         *
         * @param {Object|String} prop
         * @param {String} [value]
         * @returns {String|Dom}
         */
        css: function (prop, value) {

            if (arguments[length] === 1 && isString(prop)) {
                var el = this[0];
                var style = el && el.style;
                var computed = el ? getComputedStyle(el, null) : null;
                prop = normaliseCSSProperty(prop);
                return el ? style[prop] || computed[prop] || '' : '';
            }

            if (isObject(prop)) {
                return this[each](function () {
                    for (var key in prop) {
                        this.style[normaliseCSSProperty(key)] = prop[key];
                    }
                });
            }

            prop = normaliseCSSProperty(prop);

            return this[each](function () {
                this.style[prop] = value;
            });
        },

        /**
         *
         * @returns {Object|Null}
         */
        offset: function () {

            if (this[length] === 0) {
                return null;
            }

            var result = {left: 0, top: 0, width: 0, height: 0};
            var obj;

            try {
                obj = this[0].getBoundingClientRect();
            }
            catch (e) {
                return result;
            }

            return {
                left: obj.left + win.pageXOffset,
                top: obj.top + win.pageYOffset,
                width: Math.round(obj.width),
                height: Math.round(obj.height)
            };
        }

    };

    // addClass() and removeClass() methods
    ['addClass', 'removeClass'][forEach](function (method, i) {

        Dom[prototype][method] = function (cls) {

            cls = cls.split(' ');

            return this[each](function (el) {

                cls[forEach](function (c) {
                    return i ? removeClass(el, c) : addClass(el, c);
                });

            });

        };


    });

    // text() and html() methods
    ['text:textContent', 'html:innerHTML'][forEach](function (parts) {

        parts = parts.split(':');

        Dom[prototype][parts[0]] = function (value) {

            if (arguments[length] === 0) {
                return this[length] > 0 ? this[0][parts[1]] : null;
            }

            return this[each](function () {
                this[parts[1]] = value;
            });

        };

    });

    // prev(), next(), and parent() methods
    ['prev', 'next', 'parent'][forEach](function (method, i) {

        Dom[prototype][method] = function (selector) {
            var results = [];

            this[each](function () {
                var el = this[method + (!i ? 'ious' : '') + (i < 2 ? 'ElementSibling' : 'Element')];
                if (isElement(el) && (!isString(selector) || dom(el).is(selector))) {
                    results.push(el);
                }
            });

            return dom(results);
        };

    });

    // append(), prepend(), after(), before(), insertBefore() and insertAfter() methods
    ['append', 'prepend', 'after', 'before', 'insertBefore', 'insertAfter'][forEach](function (method, i) {

        var domMethod = i === 0 ? method + 'Child' : 'insertBefore';

        Dom[prototype][method] = function (html) {

            html = dom(html).filter(isElement);

            if (!html[length]) {
                return this;
            }

            var targets = i < 4 ? this : html;
            var clone = targets[length] > 1;

            html = i < 4 ? html : this;

            return targets[each](function (target) {

                var root = i > 1 ? target[parentNode] : target;

                if (!root) {
                    return;
                }

                var ref = [null, target.firstChild, target.nextSibling, target, target, target.nextSibling][i];

                html[each](function (el) {
                    root[domMethod](clone ? el.cloneNode(true) : el, ref);
                });
            });
        };

    });

    // expose prototype jQuery style
    dom[prototype] = dom.fn = Dom[prototype];

    // helper for generating a delegate method
    dom.delegate = function (selector, fn) {
        return function (e) {
            if (dom(e.target).closest(selector)[length]) {
                fn.call(this, e);
            }
        };
    };

    if (win.define && define.amd) {
        define(function () {
            return dom;
        });
    }
    else {
        win.dom = dom;
    }

})();