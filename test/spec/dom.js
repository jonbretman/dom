describe('dom', function () {

    var testRoot = document.createElement('div');
    testRoot.id = 'test-root';
    document.body.appendChild(testRoot);

    afterEach(function () {
        testRoot.innerHTML = '';
    });

    var addTestHTML = function () {
        testRoot.innerHTML = [].slice.call(arguments).join('');
    };

    it('should be a function', function () {
        expect(dom).to.be.a('function');
    });

    describe('dom(selector)', function () {

        it('should be able to find by id', function () {
            expect(dom('#mocha')).to.have.length(1);
            expect(dom('#mocha')[0]).to.equal(document.getElementById('mocha'));
        });

        it('should be able to find by class', function () {
            addTestHTML('<div class="foo bar"></div><div class="foo"></div>');
            expect(dom('.foo')).to.have.length(2);
            expect(dom('.foo.bar')).to.have.length(1);

            addTestHTML('<div class="one"><div class="two inner"><div class="three inner"></div></div></div>');
            expect(dom('.one .two')).to.have.length(1);
            expect(dom('.one .three')).to.have.length(1);
            expect(dom('.one .inner')).to.have.length(2);
        });

        it('should be able to find by tag name', function () {
            expect(dom('script')).to.have.length(document.getElementsByTagName('script').length);
            expect(dom('div')).to.have.length(document.getElementsByTagName('div').length);
        });

        it('should handle an id that doesnt exist', function () {
            expect(dom('#does-not-exist')).to.be.ok();
        });

        it('should treat the selector "body" as document.body', function () {
            expect(dom('body')[0]).to.equal(document.body);
        });

        it('should treat the selector "document" as document', function () {
            expect(dom('document')[0]).to.equal(document);
        });

    });

    describe('dom(document)', function () {

        it('should create an object with length 1 containing the document', function () {
            expect(dom(document)).to.have.length(1);
            expect(dom(document)[0]).to.equal(document);
        });

    });

    describe('dom(window)', function () {

        it('should create an object with length 1 containing the window', function () {
            expect(dom(window)).to.have.length(1);
            expect(dom(window)[0]).to.equal(window);
        });

    });

    describe('dom(html)', function () {

        it('should create DOM elements from the HTML string passed', function () {
            expect(dom('<p></p>')).to.have.length(1);
            expect(dom('<p></p><p></p>')).to.have.length(2);
        });

    });

    describe('dom(HTMLElement)', function () {

        it('should create an object with a length of 1 containing the passed element', function () {
            var el = document.createElement('p');
            expect(dom(el)).to.have.length(1);
            expect(dom(el)[0]).to.equal(el);
        });

    });

    describe('dom(Array)', function () {

        it('should copy the array into the collection', function () {
            var el = document.createElement('p');
            var arr = [el];
            expect(dom(arr)).to.have.length(1);
            expect(dom(arr)[0]).to.equal(el);
        });

    });

    describe('dom(function)', function () {

        it('should call the function when the document is ready passing it the dom() function', function () {
            var spy = sinon.spy();
            dom(spy);
            expect(spy.callCount).to.equal(1);
            expect(spy.getCall(0).args[0]).to.equal(dom);
        });

        it('should call functions when the document is ready', function () {
            expect(domReady1.callCount).to.equal(1);
            expect(domReady1.getCall(0).args[0]).to.equal(dom);
            expect(domReady2.callCount).to.equal(1);
            expect(domReady2.getCall(0).args[0]).to.equal(dom);
            expect(domReady3.callCount).to.equal(1);
            expect(domReady3.getCall(0).args[0]).to.equal(dom);
        });

    });

    describe('#find()', function () {

        it('should return this if selector is not valid', function () {
            var d = dom();
            expect(d.find()).to.have.length(0);
            expect(d.find(null)).to.have.length(0);
            expect(d.find({})).to.have.length(0);
            expect(d.find(10)).to.have.length(0);
        });

        it('should search inside the collection only', function () {

            addTestHTML(
                '<div id="test-find">',
                    '<span id="test-find-with-id"></span>',
                    '<span class="test-find-inner"></span>',
                    '<span class="test-find-container"><span class="test-find-inner"></span></span>',
                    '<span class="test-find-container"></span>',
                    '<span class="test-find-container"><span class="test-find-inner"></span></span>',
                '</div>'
            );

            var root = dom('#test-find');

            expect(root.find('.test-find-container')).to.have.length(3);
            expect(root.find('.test-find-container').find('.test-find-inner')).to.have.length(2);
            expect(root.find('.test-find-container').find('#test-find-with-id')).to.have.length(0);
        });

        it('should not throw exceptions with invalid selectors', function () {
            expect(dom(document).find('<not a valid selector>')).to.be.ok();
        });

    });

    describe('#addClass', function () {

        it('should return this', function () {
            var d = dom();
            expect(d.addClass('foo')).to.equal(d);
        });

        it('should add the given classes to all elements in the collection', function () {
            var el = document.createElement('div');
            dom(el).addClass('foo');
            expect(el.className).to.equal('foo');

            dom(el).addClass('bar baz');
            expect(el.className.split(' ')).to.contain('bar');
            expect(el.className.split(' ')).to.contain('baz');

            var els = [
                document.createElement('span'),
                document.createElement('span'),
                document.createElement('span')
            ];

            dom(els).addClass('testing foo');

            els.forEach(function (el) {
                expect(el.className.split(' ')).to.contain('testing');
                expect(el.className.split(' ')).to.contain('foo');
            });

        });

    });

    describe('#removeClass()', function () {

        it('should return this', function () {
            var d = dom();
            expect(d.removeClass('foo')).to.equal(d);
        });

        it('should remove the given classes from all elements in the collection', function () {
            var el = document.createElement('div');
            el.className = 'one two three';
            dom(el).removeClass('one');
            expect(el.className.split(' ')).to.not.contain('one');

            dom(el).removeClass('two three');
            expect(el.className).to.equal('');

            var els = [
                document.createElement('span'),
                document.createElement('span'),
                document.createElement('span')
            ];

            els.forEach(function (el) {
                el.className = 'one two three';
            });

            dom(els).removeClass('one three');

            els.forEach(function (el) {
                expect(el.className).to.equal('two');
            });

        });

    });

    describe('#hasClass()', function () {

        it('should return false if the collection is empty', function () {
            expect(dom().hasClass('foo')).to.equal(false);
        });

        it('should return true if the first element in the collection has the given class', function () {

            var el = document.createElement('div');
            el.className = 'test-has-class';

            expect(dom(el).hasClass('test-has-class')).to.equal(true);
            expect(dom(el).hasClass('does-not-exist')).to.equal(false);

        });

    });

    describe('#toArray()', function () {

        it('should return a proper array', function () {

            addTestHTML('<div class="test-to-array"></div><div class="test-to-array"></div>');

            expect(dom('.test-to-array').toArray()).to.be.an('array');
            expect(dom('.test-to-array').toArray()).to.have.length(2);

        });

    });

    describe('#each()', function () {

        it('should return this', function () {
            var d = dom();
            expect(d.each()).to.equal(d);
        });

        it('should call the passed function for each element in the collection', function () {

            addTestHTML('<span id="first" class="test-each"></span><span id="second" class="test-each"></span><span id="third" class="test-each"></span>');

            var spy = sinon.spy();
            var collection = dom('.test-each');
            collection.each(spy);
            sinon.assert.callCount(spy, 3);

            for (var i = 0; i < 3; i++) {
                expect(spy.getCall(i).args[0]).to.equal(collection[i]);
                expect(spy.getCall(i).args[1]).to.equal(i);
                expect(spy.getCall(i).calledOn(collection[i])).to.equal(true);
            }

        });

    });

    describe('#map()', function () {

        it('should return this if parameter is not a function', function () {
            var d = dom();
            expect(d.map()).to.equal(d);
            expect(d.map(null)).to.equal(d);
            expect(d.map({})).to.equal(d);
            expect(d.map()).to.equal(d);
        });

        it('should create a new object that is the result of calling the function for each element in the collection', function () {

            addTestHTML(
                '<div id="one"><span class="test-map"></span></div>',
                '<div id="two"><span class="test-map"></span></div>',
                '<div id="three"><span class="test-map"></span></div>'
            );

            var spy = sinon.spy(function (el) {
                return el.parentNode;
            });

            var original = dom('.test-map');

            var mapped = original.map(spy);
            sinon.assert.callCount(spy, 3);

            for (var i = 0; i < 3; i++) {
                expect(spy.getCall(i).args[0]).to.equal(original[i]);
                expect(spy.getCall(i).args[1]).to.equal(i);
                expect(spy.getCall(i).calledOn(original[i])).to.equal(true);
                expect(mapped[i]).to.equal(original[i].parentNode);
            }

        });

    });

    describe('#filter()', function () {

        it('should return this if parameter is not a function or a string', function () {
            var d = dom();
            expect(d.filter()).to.equal(d);
            expect(d.filter(null)).to.equal(d);
            expect(d.filter({})).to.equal(d);
            expect(d.filter()).to.equal(d);
        });

    });

    describe('#filter(function)', function () {

        it('should create a new object that contains only those elements for which the function returned truthy values', function () {

            addTestHTML(
                '<div class="test-filter" id="one"></div>',
                '<div class="test-filter" id="two"></div>',
                '<div class="test-filter" id="three"></div>'
            );

            var spy = sinon.spy(function (el) {
                return el.id === 'two';
            });

            var original = dom('.test-filter');

            var filtered = original.filter(spy);
            sinon.assert.callCount(spy, 3);

            for (var i = 0; i < 3; i++) {
                expect(spy.getCall(i).args[0]).to.equal(original[i]);
                expect(spy.getCall(i).args[1]).to.equal(i);
                expect(spy.getCall(i).calledOn(original[i])).to.equal(true);
            }

            expect(filtered).to.have.length(1);
            expect(filtered[0].id).to.equal('two');
        });

    });

    describe('#filter(selector)', function () {

        it('should filter the collection using the selector', function () {

            addTestHTML(
                '<div class="test-filter" id="one"></div>',
                '<div class="test-filter" id="two"></div>',
                '<div class="test-filter" id="three"></div>'
            );

            var d = dom('.test-filter');

            expect(d).to.have.length(3);
            expect(d.filter('#two')).to.have.length(1);

        });

    });

    describe('#closest()', function () {

        it('should return a new empty collection if the collection is empty', function () {
            var d = dom();
            expect(d.closest('.foo')).to.have.length(0);
            expect(d.closest('.foo')).to.not.equal(d);
        });

        it('should find the first element matching the selector', function () {

            addTestHTML(
                '<div class="outer">',
                    '<span class="inner"></span>',
                    '<p class="inner">',
                        '<span class="inner-inner"></span>',
                    '</p>',
                '</div>'
            );

            expect(dom('.inner-inner').closest('.inner')[0]).to.have.property('tagName', 'P');
            expect(dom('.inner-inner').closest('.outer')[0]).to.have.property('tagName', 'DIV');
            expect(dom('.inner-inner').closest('.does-not-exist')).to.have.length(0);
        });

    });

    describe('#is()', function () {

        it('should return false if selector is invalid', function () {
            var el = document.createElement('div');
            expect(dom(el).is()).to.equal(false);
        });

    });

    describe('#is(selector)', function () {

        it('should return true if the passed selector matches any elements in the object', function () {

            var el = document.createElement('div');
            el.id = 'foo';
            el.className = 'one two three';
            expect(dom(el).is('.two')).to.be.ok();
            expect(dom(el).is('div')).to.be.ok();
            expect(dom(el).is('#foo')).to.be.ok();
            expect(dom(el).is('#bar')).to.not.be.ok();
            expect(dom(el).is('.two.not-present')).to.not.be.ok();

            var arr = [
                document.createElement('span'),
                el,
                document.createElement('span')
            ];

            expect(dom(arr).is('.two')).to.be.ok();
            expect(dom(arr).is('span')).to.be.ok();
            expect(dom(arr).is('.not-present')).to.not.be.ok();
        });

    });

    describe('#is(element)', function () {

        it('should return true if passed a node that is in the collection', function () {

            var el1 = document.createElement('div');
            var el2 = document.createElement('div');
            var el3 = document.createElement('div');
            var el4 = document.createElement('div');

            var d = dom([el1, el2, el3]);

            expect(d.is(el1)).to.equal(true);
            expect(d.is(el2)).to.equal(true);
            expect(d.is(el3)).to.equal(true);
            expect(d.is(el4)).to.equal(false);

        });

    });

    describe('#first()', function () {

        it('should return a new object containing only the first element', function () {
            var arr = [
                document.createElement('span'),
                document.createElement('span'),
                document.createElement('span')
            ];
            expect(dom(arr).first()).to.have.length(1);
            expect(dom(arr).first()[0]).to.equal(arr[0]);
            expect(dom().first()).to.have.length(0);
        });

    });

    describe('#last()', function () {

        it('should return a new object containing only the last element', function () {
            var arr = [
                document.createElement('span'),
                document.createElement('span'),
                document.createElement('span')
            ];
            expect(dom(arr).last()).to.have.length(1);
            expect(dom(arr).last()[0]).to.equal(arr[2]);
            expect(dom().last()).to.have.length(0);
        });

    });

    describe('#get()', function () {

        it('should return null if the index is larger than the collection', function () {
            expect(dom(document.createElement('div')).get(10)).to.equal(null);
        });

        it('should return the actual element at the provided index', function () {
            var arr = [
                document.createElement('span'),
                document.createElement('span'),
                document.createElement('span')
            ];
            expect(dom(arr).get(0)).to.equal(arr[0]);
            expect(dom(arr).get(1)).to.equal(arr[1]);
            expect(dom(arr).get(2)).to.equal(arr[2]);
            expect(dom(arr).get()).to.have.length(3);
            expect(dom(arr).get()).to.be.an('array');
        });

        it('should accept a negative index and return elements from the end of the collection', function () {
             var arr = [
                document.createElement('span'),
                document.createElement('span'),
                document.createElement('span')
            ];
            expect(dom(arr).get(-1)).to.equal(arr[2]);
            expect(dom(arr).get(-2)).to.equal(arr[1]);
            expect(dom(arr).get(-3)).to.equal(arr[0]);
            expect(dom(arr).get(-4)).to.equal(null);
        });

    });

    describe('#eq()', function () {

        it('should return a new object containing only the element at the provided index', function () {
            var arr = [
                document.createElement('span'),
                document.createElement('span'),
                document.createElement('span')
            ];

            arr.forEach(function (el, i) {
                expect(dom(arr).eq(i)).to.have.length(1);
                expect(dom(arr).eq(i)[0]).to.equal(el);
            });
        });

        it('should accept a negative index', function () {
            var arr = [
                document.createElement('span'),
                document.createElement('span'),
                document.createElement('span')
            ];

            expect(dom(arr).eq(-1)).to.have.length(1);
            expect(dom(arr).eq(-2)[0]).to.equal(arr[1]);
            expect(dom(arr).eq(-1)[0]).to.equal(arr[2]);
        });

    });

    describe('#remove()', function () {

        it('should return this', function () {
            var d = dom();
            expect(d.remove()).to.equal(d);
        });

        it('should remove all elements in the collection', function () {

            addTestHTML(
                '<div class="test-remove">',
                    '<span class="test-remove-inner"></span>',
                    '<span class="test-remove-inner"></span>',
                    '<span class="test-remove-inner"></span>',
                '</div>'
            );

            expect(dom('.test-remove')[0].childNodes).to.have.length(3);
            dom('.test-remove-inner').remove();
            expect(dom('.test-remove')[0].childNodes).to.have.length(0);
        });

        it('should do nothing if element has no parent', function () {
            expect(dom('<div></div>').remove()).to.be.ok();
            expect(dom('<div></div>').remove()).to.have.length(1);
        });

    });

    describe('#attr(key)', function () {

        it('should return the given attribute from the first element in the collection', function () {

            var el = document.createElement('label');
            el.setAttribute('for', 'some-input-id');

            expect(dom(el).attr('for')).to.equal('some-input-id');
            expect(dom(el).attr('doesnt-exist')).to.equal(null);
        });

    });

    describe('#attr(key, value)', function () {

        it('should return this', function () {
            var d = dom();
            expect(d.attr('foo', 'bar')).to.equal(d);
        });

        it('should return null if the collection is empty', function () {
            expect(dom().attr('value')).to.equal(null);
        });

        it('should set or remove the attribute with the given value for each element in the collection', function () {

            var input = document.createElement('input');
            expect(input.name).to.equal('');
            dom(input).attr('value', 'new value');
            expect(input.value).to.equal('new value');

            var inputs = [
                document.createElement('input'),
                document.createElement('input'),
                document.createElement('input')
            ];

            dom(inputs).attr('type', 'password');
            expect(inputs[0].type).to.equal('password');
            expect(inputs[1].type).to.equal('password');
            expect(inputs[2].type).to.equal('password');
        });

        it('should remove the attribute if the value is falsey', function () {
            var div = document.createElement('div');

            dom(div).attr('data-key', 'some-value');
            expect(dom(div).attr('data-key')).to.equal('some-value');

            dom(div).attr('data-key', null);
            expect(dom(div).attr('data-key')).to.equal(null);

        });

    });

    describe('#prop(key)', function () {

        it('should return the given property from the first element in the collection', function () {

            var input = document.createElement('input');
            input.type = 'checkbox';
            input.checked = false;

            expect(dom(input).prop('checked')).to.equal(false);
            input.checked = true;
            expect(dom(input).prop('checked')).to.equal(true);
        });

    });

    describe('#prop(key, value)', function () {

        it('should return this', function () {
            var d = dom();
            expect(d.prop('foo', 'bar')).to.equal(d);
        });

        it('should return undefined if the collection is empty', function () {
            expect(dom().prop('id')).to.equal(undefined);
        });

        it('should set the property with the given value for each element in the collection', function () {

            var inputs = [
                document.createElement('input'),
                document.createElement('input'),
                document.createElement('input')
            ];

            dom(inputs).prop('value', 'new value');

            inputs.forEach(function (el) {
                expect(el.value).to.equal('new value');
            });
        });

    });

    describe('#pluck()', function () {

        it('should return an array containing the values of the given property for every element in the collection', function () {

            addTestHTML(
                '<div class="test-pluck"></div>',
                '<div class="test-pluck"></div>',
                '<div class="test-pluck"></div>'
            );

            expect(dom('.test-pluck').pluck('className')).to.eql(['test-pluck','test-pluck','test-pluck']);
        });

    });

    describe('#val()', function () {

        it('should retrieve the value of the first element in the collection', function () {

            var input = document.createElement('input');
            input.type = 'text';
            input.value = 'the value';
            expect(dom(input).val()).to.equal('the value');

            var select = document.createElement('select');
            select.multiple = true;

            [1,2,3].forEach(function (n) {
                var option = document.createElement('option');
                option.value = 'option-' + n;
                option.selected = n % 2 === 1;
                select.appendChild(option);
            });

            expect(dom(select).val()).to.eql(['option-1', 'option-3']);
        });

    });

    describe('#val(value)', function () {

        it('should set the value of each element in the collection', function () {

            var arr = [1,2,3].map(function () {
                return document.createElement('input');
            });

            dom(arr).val('the value');

            arr.forEach(function (el) {
                expect(el.value).to.equal('the value');
            });
        });

    });

    describe('#children()', function () {

        it('should return a new collection containing the children of each element in the collection', function () {

            addTestHTML(
                '<div class="test-children">',
                    '<span></span>',
                    '<span></span>',
                    '<span></span>',
                '</div>',
                '<div class="test-children">',
                    '<span class="control"></span>',
                    '<span></span>',
                    '<span></span>',
                '</div>',
                '<div class="test-children">',
                    '<span></span>',
                    '<span class="control"></span>',
                    '<span></span>',
                '</div>'
            );

            expect(dom('.test-children').children()).to.have.length(9);
            expect(dom('.test-children').children('.control')).to.have.length(2);
        });

    });

    describe('#html()', function () {

        it('should get the HTML of the first element in the collection', function () {
            addTestHTML('<span></span><p></p><ul><li></li></ul>');
            expect(dom('#test-root').html()).to.equal('<span></span><p></p><ul><li></li></ul>');
        });

        it('should return null if the collection is empty', function () {
            expect(dom().html()).to.equal(null);
        });

    });

    describe('#html(html)', function () {

        it('should return this', function () {
            var d = dom();
            expect(d.html('foo')).to.equal(d);
        });

        it('should set the HTML of each element in the collection', function () {
            addTestHTML(
                '<div class="test-html"></div>',
                '<div class="test-html"></div>',
                '<div class="test-html"></div>'
            );
            expect(dom('.test-html').html('<p>Hello</p>'));
        });

    });

    describe('#css(prop)', function () {

        it('should return the value of the property for the first element in the collection', function () {

            var el = document.createElement('div');
            el.style.display = 'inline';
            el.style.color = 'red';
            el.style.position = 'absolute';

            expect(dom(el).css('color')).to.equal('red');
            expect(dom(el).css('display')).to.equal('inline');
            expect(dom(el).css('position')).to.equal('absolute');

            // test computed styles from css
            el = document.createElement('div');
            testRoot.appendChild(el);
            el.id = 'test-css-computed-style';

            expect(dom(el).css('font-size')).to.equal('50px');
            expect(dom(el).css('float')).to.equal('left');
        });

        it('should return an empty string if an invalid property is passed', function () {
            expect(dom(document.createElement('div')).css('foo-bar')).to.equal('');
        });

        it('should return an empty string if the collection is empty', function () {
            expect(dom().css('color')).to.equal('');
        });

    });

    describe('#css(prop, key)', function () {

        it('should set the styles on each element in the collection', function () {

            var els = [
                document.createElement('div'),
                document.createElement('div'),
                document.createElement('div')
            ];

            dom(els).css('line-height', '20px');

            els.forEach(function (el) {
                expect(el.style.lineHeight).to.equal('20px');
            });

        });

    });

    describe('#css(map)', function () {

        it('should set each style on each element in the collection', function () {

            var els = [
                document.createElement('div'),
                document.createElement('div'),
                document.createElement('div')
            ];

            dom(els).css({
                fontSize: '10px',
                color: 'red',
                'padding-top': '50px'
            });

            els.forEach(function (el) {
                expect(el.style.fontSize).to.equal('10px');
                expect(el.style.color).to.equal('red');
                expect(el.style.paddingTop).to.equal('50px');
            });

        });

    });

    describe('#offset()', function () {

        it('should return null if the collection is empty', function () {
            expect(dom().offset()).to.equal(null);
        });

        it('should return an object containing top, left, width, and height properties for the first element', function () {
            var offset = dom('<div></div>').offset();
            expect(offset).to.have.property('top');
            expect(offset).to.have.property('left');
            expect(offset).to.have.property('width');
            expect(offset).to.have.property('height');
        });

        it('should return correct values based on element styles', function () {

            addTestHTML('<div id="test-offset"></div>');

            var offset = dom('#test-offset').offset();

            expect(offset).to.have.property('top', document.getElementById('test-offset').getBoundingClientRect().top + window.pageYOffset);
            expect(offset).to.have.property('left', 0);
            expect(offset).to.have.property('width', 100);
            expect(offset).to.have.property('height', 220);

        });

    });

    describe('#prev()', function () {

        it('should return a new collection containing the previous elements of each element in the original collection', function () {

            addTestHTML(
                '<span class="foo"></span><span class="test-previous"></span>',
                '<span class="foo"></span><span class="test-previous"></span>',
                '<span class="foo"></span><span class="test-previous"></span>'
            );

            var previous = dom('.test-previous').prev();
            expect(previous).to.have.length(3);
        });

    });

    describe('#prev(selector)', function () {

        it('should filter the results by the passed selector', function () {

            addTestHTML(
                '<span class="foo"></span><span class="test-previous"></span>',
                '<span class="foo bar"></span><span class="test-previous"></span>',
                '<span class="foo"></span><span class="test-previous"></span>'
            );

            var previous = dom('.test-previous').prev('.bar');
            expect(previous).to.have.length(1);
        });

    });

    describe('#next()', function () {

        it('should return a new collection containing the next elements of each element in the original collection', function () {

            addTestHTML(
                '<span class="test-next"></span><span class="foo"></span>',
                '<span class="test-next"></span><span class="foo"></span>',
                '<span class="test-next"></span><span class="foo"></span>'
            );

            var next = dom('.test-next').next();
            expect(next).to.have.length(3);
        });

    });

    describe('#next(selector)', function () {

        it('should filter the results by the passed selector', function () {

            addTestHTML(
                '<span class="test-next"></span><span class="foo"></span>',
                '<span class="test-next"></span><span class="foo bar"></span>',
                '<span class="test-next"></span><span class="foo"></span>'
            );

            var next = dom('.test-next').next('.bar');
            expect(next).to.have.length(1);
        });

    });

    describe('#parent()', function () {

        it('should return a new collection containing the parent elements of each element in the original collection', function () {

            addTestHTML(
                '<span class="foo"><span class="test-parent"></span></span>',
                '<span class="foo"><span class="test-parent"></span></span>',
                '<span class="foo"><span class="test-parent"></span></span>'
            );

            var parent = dom('.test-parent').parent();
            expect(parent).to.have.length(3);
        });

    });

    describe('#parent(selector)', function () {

        it('should filter the results by the passed selector', function () {

            addTestHTML(
                '<span class="foo"><span class="test-parent"></span></span>',
                '<span class="foo bar"><span class="test-parent"></span></span>',
                '<span class="foo"><span class="test-parent"></span></span>'
            );

            var parent = dom('.test-parent').parent('.bar');
            expect(parent).to.have.length(1);
        });

    });

    describe('#append()', function () {

        it('should return this if argument is invalid', function () {
            var d = dom();
            expect(d.append(null)).to.equal(d);
            expect(d.append({})).to.equal(d);
            expect(d.append()).to.equal(d);
        });

        it('should accept an html string', function () {

            addTestHTML(
                '<span class="test-append"><span class="existing"></span></span>',
                '<span class="test-append"><span class="existing"></span></span>',
                '<span class="test-append"><span class="existing"></span></span>'
            );

            dom('.test-append').append('<span class="appended"></span>');

            dom('.test-append').each(function (el) {
                expect(el.children).to.have.length(2);
                expect(el.children[1]).to.have.property('className', 'appended');
            });
        });

        it('should accept a DOM element', function () {

            addTestHTML(
                '<span class="test-append"><span class="existing"></span></span>',
                '<span class="test-append"><span class="existing"></span></span>',
                '<span class="test-append"><span class="existing"></span></span>'
            );

            var toBeAppended = document.createElement('span');
            toBeAppended.className = 'appended';

            dom('.test-append').append(toBeAppended);

            dom('.test-append').each(function (el) {
                expect(el.children).to.have.length(2);
                expect(el.children[1]).to.have.property('className', 'appended');
            });
        });

        it('should accept a dom() collection', function () {

            addTestHTML(
                '<span class="test-append"><span class="existing"></span></span>',
                '<span class="test-append"><span class="existing"></span></span>',
                '<span class="test-append"><span class="existing"></span></span>'
            );

            var toBeAppended = dom('<span></span><span></span>').addClass('appended');

            dom('.test-append').append(toBeAppended);

            dom('.test-append').each(function (el) {
                expect(el.children).to.have.length(3);
                expect(el.children[1]).to.have.property('className', 'appended');
                expect(el.children[2]).to.have.property('className', 'appended');
            });
        });

    });

    describe('#prepend()', function () {

        it('should return this if argument is invalid', function () {
            var d = dom();
            expect(d.prepend(null)).to.equal(d);
            expect(d.prepend({})).to.equal(d);
            expect(d.prepend()).to.equal(d);
        });

        it('should accept an html string', function () {

            addTestHTML(
                '<span class="test-prepend"><span class="existing"></span></span>',
                '<span class="test-prepend"><span class="existing"></span></span>',
                '<span class="test-prepend"><span class="existing"></span></span>'
            );

            dom('.test-prepend').prepend('<span class="prepended"></span>');

            dom('.test-prepend').each(function (el) {
                expect(el.children).to.have.length(2);
                expect(el.children[0]).to.have.property('className', 'prepended');
            });
        });

        it('should accept a DOM element', function () {

            addTestHTML(
                '<span class="test-prepend"><span class="existing"></span></span>',
                '<span class="test-prepend"><span class="existing"></span></span>',
                '<span class="test-prepend"><span class="existing"></span></span>'
            );

            var toBePrepended = document.createElement('span');
            toBePrepended.className = 'prepended';

            dom('.test-prepend').prepend(toBePrepended);

            dom('.test-prepend').each(function (el) {
                expect(el.children).to.have.length(2);
                expect(el.children[0]).to.have.property('className', 'prepended');
            });
        });

        it('should accept a dom() collection', function () {

            addTestHTML(
                '<span class="test-prepend"><span class="existing"></span></span>',
                '<span class="test-prepend"><span class="existing"></span></span>',
                '<span class="test-prepend"><span class="existing"></span></span>'
            );

            var toBePrepended = dom('<span></span><span></span>').addClass('prepended');

            dom('.test-prepend').prepend(toBePrepended);

            dom('.test-prepend').each(function (el) {
                expect(el.children).to.have.length(3);
                expect(el.children[0]).to.have.property('className', 'prepended');
                expect(el.children[1]).to.have.property('className', 'prepended');
            });
        });

    });

    describe('#after()', function () {

        beforeEach(function () {
            addTestHTML(
                '<div id="test-after">',
                    '<span class="test-after"></span>',
                    '<span class="test-after-placeholder"></span>',
                    '<span class="test-after"></span>',
                    '<span class="test-after-placeholder"></span>',
                    '<span class="test-after"></span>',
                    '<span class="test-after-placeholder"></span>',
                '</div>'
            );
        });

        it('should return this if argument is invalid', function () {
            var d = dom();
            expect(d.after(null)).to.equal(d);
            expect(d.after({})).to.equal(d);
            expect(d.after()).to.equal(d);
        });

        it('should do nothing if an element has no parent', function () {
            expect(dom('<span></span>').after('<span></span>')).to.be.ok();
        });

        it('should not clone the passed element if the collection has only one element', function () {
            var root = document.createElement('div');
            var child = document.createElement('span');
            root.appendChild(child);
            var secondChild = document.createElement('span');
            dom(child).after(secondChild);
            expect(root.children[1]).to.equal(secondChild);
        });

        it('should accept an html string', function () {

            dom('.test-after').after('<span class="added-after"></span>');
            var el = document.getElementById('test-after');

            expect(el.children).to.have.length(9);
            expect(el.children[1]).to.have.property('className', 'added-after');
            expect(el.children[2]).to.have.property('className', 'test-after-placeholder');
            expect(el.children[4]).to.have.property('className', 'added-after');
        });

        it('should accept a DOM element', function () {

            var toBeAddedAfter = document.createElement('span');
            toBeAddedAfter.className = 'added-after';

            dom('.test-after').after(toBeAddedAfter);
            var el = document.getElementById('test-after');

            expect(el.children).to.have.length(9);
            expect(el.children[1]).to.have.property('className', 'added-after');
            expect(el.children[2]).to.have.property('className', 'test-after-placeholder');
            expect(el.children[4]).to.have.property('className', 'added-after');
        });

        it('should accept a dom() collection', function () {

            var toBeAddedAfter = dom('<span></span>').addClass('added-after');

            dom('.test-after').after(toBeAddedAfter);
            var el = document.getElementById('test-after');

            expect(el.children).to.have.length(9);
            expect(el.children[1]).to.have.property('className', 'added-after');
            expect(el.children[2]).to.have.property('className', 'test-after-placeholder');
            expect(el.children[4]).to.have.property('className', 'added-after');
        });

    });

    describe('#before()', function () {

        beforeEach(function () {
            addTestHTML(
                '<div id="test-before">',
                    '<span class="test-before-placeholder"></span>',
                    '<span class="test-before"></span>',
                    '<span class="test-before-placeholder"></span>',
                    '<span class="test-before"></span>',
                    '<span class="test-before-placeholder"></span>',
                    '<span class="test-before"></span>',
                '</div>'
            );
        });

        it('should return this if argument is invalid', function () {
            var d = dom();
            expect(d.before(null)).to.equal(d);
            expect(d.before({})).to.equal(d);
            expect(d.before()).to.equal(d);
        });

        it('should do nothing if an element has no parent', function () {
            expect(dom('<span></span>').before('<span></span>')).to.be.ok();
        });

        it('should not clone the passed element if the collection has only one element', function () {
            var root = document.createElement('div');
            var child = document.createElement('span');
            root.appendChild(child);
            var firstChild = document.createElement('span');
            dom(child).before(firstChild);
            expect(root.children[0]).to.equal(firstChild);
        });

        it('should accept an html string', function () {

            dom('.test-before').before('<span class="added-before"></span>');
            var el = document.getElementById('test-before');

            expect(el.children).to.have.length(9);
            expect(el.children[1]).to.have.property('className', 'added-before');
            expect(el.children[2]).to.have.property('className', 'test-before');
            expect(el.children[4]).to.have.property('className', 'added-before');
        });

        it('should accept a DOM element', function () {

            var toBeAddedBefore = document.createElement('span');
            toBeAddedBefore.className = 'added-before';

            dom('.test-before').before(toBeAddedBefore);
            var el = document.getElementById('test-before');

            expect(el.children).to.have.length(9);
            expect(el.children[1]).to.have.property('className', 'added-before');
            expect(el.children[2]).to.have.property('className', 'test-before');
            expect(el.children[4]).to.have.property('className', 'added-before');
        });

        it('should accept a dom() collection', function () {

            var toBeAddedBefore = dom('<span></span>').addClass('added-before');

            dom('.test-before').before(toBeAddedBefore);
            var el = document.getElementById('test-before');

            expect(el.children).to.have.length(9);
            expect(el.children[1]).to.have.property('className', 'added-before');
            expect(el.children[2]).to.have.property('className', 'test-before');
            expect(el.children[4]).to.have.property('className', 'added-before');
        });

    });

    describe('#insertBefore()', function () {

        beforeEach(function () {
            addTestHTML(
                '<div id="test-before">',
                    '<span class="test-before-placeholder"></span>',
                    '<span class="test-before"></span>',
                    '<span class="test-before-placeholder"></span>',
                    '<span class="test-before"></span>',
                    '<span class="test-before-placeholder"></span>',
                    '<span class="test-before"></span>',
                '</div>'
            );
        });

        it('should return this if argument is invalid', function () {
            var d = dom();
            expect(d.insertBefore(null)).to.equal(d);
            expect(d.insertBefore({})).to.equal(d);
            expect(d.insertBefore()).to.equal(d);
        });

        it('should do nothing if an element has no parent', function () {
            expect(dom('<span></span>').insertBefore('<span></span>')).to.be.ok();
        });

        it('should not clone the passed element if the collection has only one element', function () {
            var root = document.createElement('div');
            var child = document.createElement('span');
            root.appendChild(child);
            var firstChild = document.createElement('span');
            dom(firstChild).insertBefore(child);
            expect(root.children[0]).to.equal(firstChild);
        });

        it('should accept an html string', function () {

            dom('<span class="added-before"></span>').insertBefore('.test-before');
            var el = document.getElementById('test-before');

            expect(el.children).to.have.length(9);
            expect(el.children[1]).to.have.property('className', 'added-before');
            expect(el.children[2]).to.have.property('className', 'test-before');
            expect(el.children[4]).to.have.property('className', 'added-before');
        });

        it('should accept a DOM element', function () {

            var toBeAddedBefore = document.createElement('span');
            toBeAddedBefore.className = 'added-before';

            dom(toBeAddedBefore).insertBefore('.test-before');
            var el = document.getElementById('test-before');

            expect(el.children).to.have.length(9);
            expect(el.children[1]).to.have.property('className', 'added-before');
            expect(el.children[2]).to.have.property('className', 'test-before');
            expect(el.children[4]).to.have.property('className', 'added-before');
        });

        it('should accept a dom() collection', function () {

            var toBeAddedBefore = dom('<span></span>').addClass('added-before');

            dom(toBeAddedBefore).insertBefore('.test-before');
            var el = document.getElementById('test-before');

            expect(el.children).to.have.length(9);
            expect(el.children[1]).to.have.property('className', 'added-before');
            expect(el.children[2]).to.have.property('className', 'test-before');
            expect(el.children[4]).to.have.property('className', 'added-before');
        });

    });

    describe('#insertAfter()', function () {

        beforeEach(function () {
            addTestHTML(
                '<div id="test-after">',
                    '<span class="test-after"></span>',
                    '<span class="test-after-placeholder"></span>',
                    '<span class="test-after"></span>',
                    '<span class="test-after-placeholder"></span>',
                    '<span class="test-after"></span>',
                    '<span class="test-after-placeholder"></span>',
                '</div>'
            );
        });

        it('should return this if argument is invalid', function () {
            var d = dom();
            expect(d.insertAfter(null)).to.equal(d);
            expect(d.insertAfter({})).to.equal(d);
            expect(d.insertAfter()).to.equal(d);
        });

        it('should do nothing if an element has no parent', function () {
            expect(dom('<span></span>').insertAfter('<span></span>')).to.be.ok();
        });

        it('should not clone the passed element if the collection has only one element', function () {
            var root = document.createElement('div');
            var child = document.createElement('span');
            root.appendChild(child);
            var secondChild = document.createElement('span');
            dom(secondChild).insertAfter(child);
            expect(root.children[1]).to.equal(secondChild);
        });

        it('should accept an html string', function () {

            dom('<span class="added-after"></span>').insertAfter('.test-after');
            var el = document.getElementById('test-after');

            expect(el.children).to.have.length(9);
            expect(el.children[1]).to.have.property('className', 'added-after');
            expect(el.children[2]).to.have.property('className', 'test-after-placeholder');
            expect(el.children[4]).to.have.property('className', 'added-after');
        });

        it('should accept a DOM element', function () {

            var toBeAddedAfter = document.createElement('span');
            toBeAddedAfter.className = 'added-after';

            dom(toBeAddedAfter).insertAfter('.test-after');
            var el = document.getElementById('test-after');

            expect(el.children).to.have.length(9);
            expect(el.children[1]).to.have.property('className', 'added-after');
            expect(el.children[2]).to.have.property('className', 'test-after-placeholder');
            expect(el.children[4]).to.have.property('className', 'added-after');
        });

        it('should accept a dom() collection', function () {

            var toBeAddedAfter = dom('<span></span>').addClass('added-after');

            dom(toBeAddedAfter).insertAfter('.test-after');
            var el = document.getElementById('test-after');

            expect(el.children).to.have.length(9);
            expect(el.children[1]).to.have.property('className', 'added-after');
            expect(el.children[2]).to.have.property('className', 'test-after-placeholder');
            expect(el.children[4]).to.have.property('className', 'added-after');
        });

    });

    describe('#trigger()', function () {

        it('should trigger the event on all elements in the collection', function () {

            var els = [
                document.createElement('div'),
                document.createElement('div'),
                document.createElement('div')
            ];

            var spy = sinon.spy();

            els.forEach(function (el) {
                testRoot.appendChild(el);
                el.addEventListener('click', spy);
            });

            dom(els).trigger('click');

            sinon.assert.callCount(spy, 3);
        });

        it('should trigger events that bubble', function () {

            ['click', 'mouseup', 'mousedown', 'focus', 'change', 'blur', 'select'].forEach(function (event) {

                addTestHTML(
                    '<div class="test-trigger"><span><span class="trigger-target"></span></span></div>',
                    '<div class="test-trigger"><span><span class="trigger-target"></span></span></div>',
                    '<div class="test-trigger"><span><span class="trigger-target"></span></span></div>'
                );

                var spy = sinon.spy();

                dom('.test-trigger').each(function (el) {
                    el.addEventListener(event, spy);
                });

                dom('.trigger-target').trigger(event);

                sinon.assert.callCount(spy, 3);

            });
        });

        it('should handle invalid events', function () {
            var d = dom(document.createElement('div'));
            expect(d.trigger('foo-bar', function () {})).to.equal(d);
        });

    });

    describe('#on()', function () {

        it('should return this', function () {
            var d = dom(document.createElement('div'));
            expect(d.on('click', function () {})).to.equal(d);
        });

        it('should add a listener for the given event', function () {
            var el = document.createElement('div');
            testRoot.appendChild(el);
            var spy = sinon.spy();
            dom(el).on('click', spy);
            dom(el).trigger('click');
            sinon.assert.callCount(spy, 1);
        });

    });

    describe('#off()', function () {

        it('should return this', function () {
            var d = dom(document.createElement('div'));
            expect(d.off('click', function () {})).to.equal(d);
        });

        it('should remove a listener for the given event', function () {
            var el = document.createElement('div');
            testRoot.appendChild(el);
            var spy = sinon.spy();
            dom(el).on('click', spy);
            dom(el).trigger('click');
            sinon.assert.callCount(spy, 1);
            dom(el).off('click', spy);
            dom(el).trigger('click');
            sinon.assert.callCount(spy, 1);
        });

    });

    describe('#once()', function () {

        it('should remove the hamdler after it has been called once', function () {
            var el = document.createElement('div');
            testRoot.appendChild(el);
            var spy = sinon.spy();
            dom(el).once('click', spy);
            dom(el).trigger('click');
            dom(el).trigger('click');
            dom(el).trigger('click');
            dom(el).trigger('click');
            sinon.assert.callCount(spy, 1);
        });

    });

    describe('dom.delegate()', function () {

        it('should only call the handler if the event happened within the given selector', function () {

            addTestHTML(
                '<div id="test-delegate">',
                    '<div class="foo-bar">',
                        '<div class="click-target"></div>',
                     '</div>',
                    '<div class="foo-bar-baz">',
                        '<div class="other-click-target"></div>',
                    '</div>',
                '</div>'
            );

            var spy = sinon.spy();
            dom('#test-delegate').on('click', sinon.spy(dom.delegate('.foo-bar', spy)));
            dom('.click-target').trigger('click');
            dom('.click-target').trigger('click');
            dom('.other-click-target').trigger('click');
            dom('.other-click-target').trigger('click');
            sinon.assert.callCount(spy, 2);
        });

    });

});