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
    var idRegEx = /^#[\w\-_]+$/;
    var classRegEx = /^\.[\w\-_]+$/;
    var tagRegEx = /^[a-z]+$/;
    var addClass, removeClass, hasClass;

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

    /**
     *
     * @param s
     * @returns {boolean}
     */
    var isString = function (s) {
        return toString.call(s) === '[object String]';
    };

    /**
     *
     * @param fn
     * @returns {boolean}
     */
    var isFunction = function (fn) {
        return toString.call(fn) === '[object Function]';
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
            el[classList].has(c);
        };
    }
    else {
        addClass = function (el, c) {
            if (el[className].split(' ').indexOf(c) === -1) {
                el[className] += ' ' + c;
            }
        };
        removeClass = function (el, c) {
            el[className] = el[className].split(' ').filter(function (cl) {
                return cl !== c;
            });
        };
        hasClass = function (el, c) {
            return el[className].split(' ').indexOf(c) !== -1;
        };
    }

    /**
     *
     * @param selector
     * @returns {*}
     * @constructor
     */
    var Dom = function (selector) {

        if (!selector) {
            return this;
        }

        // fast track 'document' and 'body' selectors
        selector = selector === 'body' ? doc.body : selector === 'document' ? doc : selector;

        if (isElement(selector) || selector === doc || selector === win) {
            this[0] = selector;
            this[length] = 1;
            return this;
        }

        if (isString(selector) && /^<.*?>$/.test(selector)) {
            selector = fromHtml(selector);
        }

        if (arrayLike(selector)) {
            push.apply(this, [].slice.call(selector));
            return this;
        }

        return this.find(selector);
    };

    Dom[prototype] = {

        /**
         *
         */
        length: 0,

        /**
         *
         * @param selector
         * @returns {*}
         */
        find: function (selector) {

            if (!isString(selector)) {
                return this;
            }

            if (idRegEx.test(selector)) {
                return dom(doc.getElementById(selector.substring(1)));
            }

            var results;
            var method = 'querySelectorAll';

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
                    results.push.apply(results, [].slice.call(this[i][method](selector)));
                }
            }
            else {
                results = doc[method](selector);
            }

            return dom(results);
        },

        /**
         *
         * @param fn
         * @returns {*}
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
         * @param fn
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
         * @param fn
         * @returns {Dom}
         */
        filter: function (fn) {

            if (!isFunction(fn)) {
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
         * @param c
         * @returns {boolean}
         */
        hasClass: function (c) {
            return this[length] === 0 ? false : hasClass(this[0], c);
        },

        /**
         *
         * @param selector
         * @returns {*}
         */
        closest: function (selector) {

            if (this[length] === 0) {
                return this;
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
         * @param selector
         * @returns {boolean}
         */
        is: function (selector) {

            for (var i = 0; i < this[length]; i++) {

                if (!selector) {
                    continue;
                }

                var matchesSelector = this[i].webkitMatchesSelector ||
                    this[i].mozMatchesSelector ||
                    this[i].msMatchesSelector ||
                    this[i].oMatchesSelector ||
                    this[i].matchesSelector ||
                    this[i].matches;

                if (matchesSelector) {
                    if (matchesSelector.call(this[i], selector)) {
                        return true;
                    }
                    else {
                        continue;
                    }
                }

                // fall back to performing a selector:
                var match;
                var parent = this[i][parentNode];
                var temp = !parent;

                if (temp) {
                    parent = testEl;
                    parent.appendChild(this[i]);
                }

                match = parent.querySelectorAll(selector).indexOf(this[i]) !== -1;

                if (temp) {
                    testEl.removeChild(this[i]);
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
            return this[length] > 0 ? dom(this[0]) : dom();
        },

        /**
         *
         * @returns {Dom}
         */
        last: function () {
            return this[length] > 0 ? dom(this[this[length] - 1]) : dom();
        },

        /**
         *
         * @param n
         * @returns {Dom}
         */
        eq: function (n) {
            return this[length] - 1 >= n ? dom(this[n]) : dom();
        },

        /**
         *
         * @param n
         * @returns {*}
         */
        get: function (n) {
            return arguments[length] === 0 ? this.toArray() : this[length] - 1 >= n ? this[n] : null;
        },

        /**
         *
         * @param event
         * @param fn
         * @returns {*}
         */
        on: function (event, fn) {
            return this.each(function () {
                this.addEventListener(event, fn, false);
            });
        },

        /**
         *
         * @param event
         * @param fn
         * @returns {*}
         */
        once: function (event, fn) {
            return this.on(event, function handler () {
                this.removeEventListener(event, handler, false);
                return fn.apply(this, arguments);
            });
        },

        /**
         *
         * @param event
         * @param fn
         * @returns {*}
         */
        off: function (event, fn) {
            return this.each(function () {
                this.removeEventListener(event, fn, false);
            });
        },

        remove: function () {
            return this.each(function () {
                if (this[parentNode]) {
                    this[parentNode].removeChild(this);
                }
            });
        },

        attr: function (key, value) {

            if (arguments[length] === 1) {
                return this[length] > 0 ? this[0].getAttribute(key) : null;
            }

            var method = !value ? 'removeAttribute' : 'setAttribute';

            return this.each(function () {
                this[method](key, value);
            });
        },

        prop: function (key, value) {

            if (arguments[length] === 1) {
                return this[length] > 0 ? this[0][key] : undefined;
            }

            return this.each(function () {
                this[key] = value;
            });
        },

        pluck: function (key) {
            return this.map(function (element) {
                return element[key];
            }).toArray();
        },

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

            return this.each(function () {
                this.value = value;
            });
        },

        children: function (selector) {
            var results = [];

            this.each(function () {
                results.push.apply(results, filter.call(this.childNodes, isElement));
            });

            if (isString(selector)) {
                results = results.filter(filterSelector(selector));
            }

            return dom(results);
        }

    };

    ['addClass', 'removeClass'][forEach](function (method, i) {

        Dom[prototype][method] = function (cls) {

           cls = cls.split(' ');

            return this.each(function (el) {

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

            if (arguments.length === 0) {
                return this.length > 0 ? this[0][parts[1]] : null;
            }

            return this.each(function () {
                this[parts[1]] = value;
            });

        };

    });

    // previous(), next(), and parent() methods
    ['previous', 'next', 'parent'][forEach](function (method, i) {

        Dom[prototype][method] = function (selector) {
            var results = [];

            this.each(function () {
                var el = this[method + (i < 1 ? 'Sibling' : 'Node')];
                if (isElement(el) && (!isString(selector) || dom(el).is(selector))) {
                    results.push(el);
                }
            });

            return dom(results);
        };

    });

    // append(), prepend(), after(), and before() methods
    ['append', 'prepend', 'after', 'before'][forEach](function (method, i) {

        Dom[prototype][method] = function (html) {

            html = isElement(html) ? [html] : isString(html) ? fromHtml(html) : html;

            if (!arrayLike(html)) {
                return this;
            }

            var clone = this[length] > 0;

            return this.each(function (target) {

                if (i > 1 && !target[parentNode]) {
                    return;
                }

                var root = i > 1 ? target[parentNode] : target;
                var ref = [null, target.firstChild, target.nextSibling, target][i];
                method = i === 0 ? 'appendChild' : 'insertBefore';

                html[forEach](function (el) {
                    root[method](clone ? el.cloneNode(true) : el, ref);
                });
            });
        };

    });

    // expose prototype jQuery style
    dom[prototype] = dom.fn = Dom[prototype];

    // helper for generated a delegate method
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