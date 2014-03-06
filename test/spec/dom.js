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

        it('should return true if the first element in the collection has the given class', function () {



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

    describe('#closest()', function () {

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

});