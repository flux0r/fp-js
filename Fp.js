(function (UNIVERSE) {
    "use strict";
/*--------------------------------------------------------------------------*/



/*--------------------------------------------------------------------------*/
    var
        Fp,

        List,

        add,
        compose,
        curry,
        dec,
        div,
        drop,
        dropWhile,
        e,
        environment,
        extend,
        flip,
        head,
        inc,
        init,
        isDefined,
        isNil,
        isNotDefined,
        mkType,
        mul,
        partial1,
        setHead,
        sub,
        sum,
        tail,
        uncurry,
        undef,

        matchDatas,
        matchTypes,
        mkAccessor,
        mkData,
        mkDataConstructor,
        mkDataDeconstructor,
        mkDataPredicate,
        mkTypePredicate;
/*--------------------------------------------------------------------------*/



/*----------------------------------------------------------------------------
 * | Get the undefined primitive.
 *
 * > undef
 * undefined
 */

    undef = void(0);


/*----------------------------------------------------------------------------
 * | Find out whether a value is defined.
 *
 * > var x = 53;
 * > isDefined(53);
 * true
 */

    isDefined = function (x) {
        return x !== undef;
    };


/*----------------------------------------------------------------------------
 * | Find out whether a value is not defined.
 *
 * var f = function () {
 * ...     var x;
 * ...     return x;
 * ... };
 * > var x = f();
 * > isNotDefined(x);
 * true
 */

    isNotDefined = function (x) {
        return x === undef;
    };


/*----------------------------------------------------------------------------
 * | Add the properties in y to x. Any properties in x that also exist in y
 * will be overwritten with y's version.
 *
 * > var x = { one: 1, six: 6 };
 * > var y = { eight: 8, six: 10 };
 * > extend(x, y);
 * { one: 1, six: 10, eight: 8 }
 */

    extend = function (x, y) {
        var prop;
        for (prop in y) {
            if (y.hasOwnProperty(prop)) {
                x[prop] = y[prop];
            }
        }
        return x;
    };


/*----------------------------------------------------------------------------
 * | Get the names of the constructors for an object.
 *
 * Throw an error if x is not of a type registered in the environment from
 * which matchTypes is called.
 */

    matchTypes = function (x, types) {
        var k;
        for (k in types) {
            if (types.hasOwnProperty(k)) {
                if (types[k].pred(x)) {
                    return types[k].tags;
                }
            }
        }
        throw new Error("match: The parameter matches no types " +
            "in this environment.");
    };


/*----------------------------------------------------------------------------
 * | Get the name of the constructor that created an object.
 *
 * If x wasn't made by any of the constructors, throw an error.
 */

    matchDatas = function (x, constructors, datas) {
        var i;
        for (i = 0; i < constructors.length; i += 1) {
            if (datas[constructors[i]].pred(x)) {
                return constructors[i];
            }
        }
        throw new Error("match: The parameter matches no " +
            " constructors in this environment.");
    };



/*----------------------------------------------------------------------------
 * | An environment has type constructors, data constructors, accessors, and
 * a function for pattern matching.  Adding a type constructor that was
 * created with mkType to the environment using the type method embeds the
 * constructors for the type and creates accessor functions for the fields
 * in the data constructors for the type.
 *
 * To make a type, specify the type's name and an object containing all the
 * type's data constructors. Each constructor should have an Array (can be
 * empty) of field names.
 *
 *     > var Pair = mkType("Pair", { Pair: ["car", "cdr"] });
 *     > var Maybe = mkType("Maybe", { Nothing: [], Just: ["val"] });
 *
 * Make an environment and then add the types to it.
 * 
 *     > var e = environment().type(Pair).type(Maybe);
 *
 * Make some values of the types using the data constructors and use
 * the accessors to get them back out.
 *
 *     > var x = e.Pair(3, 2);
 *     > e.car(x);
 *     3
 *     > e.cdr(x);
 *     2
 *     > var y = e.Just(12);
 *     > var z = e.Nothing();
 *     > e.val(y);
 *     12
 *     > e.val(z);
 *     TypeError: val: Expected Just but got something else.
 *
 * Use pattern matching. (Only on constructors for now.)
 *     
 *     > var div = function (x, y) { return x/y; };
 *     > div(24, 0);
 *     Infinity
 *     > var fromMaybe = function (defaultValue, x) {
 *     ...     return e.match(x, {
 *     ...         Nothing: function () { return defaultValue; },
 *     ...         Just: function (x) { return x; }
 *     ...     });
 *     ... };
 *     > var safeDiv = function (x, y) {
 *     ...     return y === 0 ? e.Nothing() : e.Just(div(x, y));
 *     ... };
 *     > fromMaybe(0, safeDiv(24, 0))
 *     0
 *     > fromMaybe(0, safeDiv(24, 2))
 *     12
 */

    environment = function (datas, types) {
        var d, ds, i, o, ts;

        if (!(this instanceof environment) ||
                isDefined(this.type)) {
            o = Object.create(environment.prototype);
            environment.apply(o, arguments);
            return o;
        }

        ds = datas || {};
        ts = types || {};

        this.match = function (x, o) {
            var accessors, args, constructors, matchedConstructor, i;
            args = [];
            constructors = matchTypes(x, ts);
            matchedConstructor = matchDatas(x, constructors, ds);
            accessors = ds[matchedConstructor].meta;
            for (i = 0; i < accessors.length; i += 1) {
                args.push(this[accessors[i]](x));
            }
            return o[matchedConstructor].apply(this, args);
        };

        this.getDs = function () {
            return ds;
        };

        this.getTs = function () {
            return ts;
        };

        this.type = function (t) {
            var c, xt, xd, newDs, newTs;
            xt = {};
            xt[t.type] = { pred: t.pred };
            xt[t.type].tags = [];
            xd = {};
            for (c in t.constructors) {
                if (t.constructors.hasOwnProperty(c)) {
                    xt[t.type].tags.push(c);
                    xd[c] = t.constructors[c];
                }
            }
            newDs = extend(ds, xd);
            newTs = extend(ts, xt);
            return environment(newDs, newTs);
        };

        for (d in ds) {
            if (ds.hasOwnProperty(d)) {
                o = ds[d];
                if (isDefined(this[o.tag])) {
                    throw new Error("The name for the data constructor " + d +
                            " is already defined in this environment.");
                }
                this[o.tag] = o.maker;
                for (i = 0; i < o.meta.length; i += 1) {
                    this[o.meta[i]] = mkAccessor(o.meta[i], o);
                }
            }
        }
    };


/*----------------------------------------------------------------------------
 * | Make an accessor function out of a field name and a data type from
 * mkData.
 */

    mkAccessor = function (k, d) {
        return function (x) {
            if (!d.pred(x)) {
                throw new TypeError(k + ": Expected " + d.tag +
                    " but got something else.");
            }
            return d.unmaker(x, k);
        };
    };


/*----------------------------------------------------------------------------
 * | Make a data constructor out of a name and a list of field names.
 */

    mkDataConstructor = function (dataName, fields) {
        var maker;
        maker = function () {
            var i, o;
            if (!(this instanceof maker)) {
                o = Object.create(maker.prototype);
                maker.apply(o, arguments);
                return o;
            }
            if (arguments.length !== fields.length) {
                throw new TypeError(dataName + ": Expected " +
                        fields.length + " fields but got " +
                        arguments.length + ".");
            }
            for (i = 0; i < fields.length; i += 1) {
                this[fields[i]] = arguments[i];
            }
        };
        maker.tag = dataName;
        return maker;
    };


/*----------------------------------------------------------------------------
 * | Make a function to tell whether a value was made by a constructor.
 */

    mkDataPredicate = function (constructor, fields) {
        var p;
        p = function (x) {
            var i;
            if (!(x instanceof constructor)) {
                return false;
            }
            for (i = 0; i < fields.length; i += 1) {
                if (isNotDefined(x[fields[i]])) {
                    return false;
                }
            }
            return true;
        };
        return p;
    };


/*----------------------------------------------------------------------------
 * | Make a deconstructor. That is, make a function that when given a value
 * and a field name gets the correct field out of the value.
 */

    mkDataDeconstructor = function () {
        var d;
        d = function (x, k) {
            return x[k];
        };
        return d;
    };


/*----------------------------------------------------------------------------
 * | From a name and a list of fields, make an object with meta data (field
 * names), a constructor function, a predicate function, and a deconstructor
 * function. mkData is not exported should generally only be called by
 * mkType when created new sum type constructors.
 */

    mkData = function (dataName, fields) {
        var d;
        d = {};
        d.tag = dataName;
        d.meta = fields;
        d.maker = mkDataConstructor(dataName, fields);
        d.pred = mkDataPredicate(d.maker, fields);
        d.unmaker = mkDataDeconstructor(fields);
        return d;
    };


/*----------------------------------------------------------------------------
 * | Make a function to tell whether an object is of a given type.
 */

    mkTypePredicate = function (ds) {
        var p;
        p = function (x) {
            var constructor;
            for (constructor in ds) {
                if (ds.hasOwnProperty(constructor)) {
                    if (ds[constructor].pred(x)) {
                        return true;
                    }
                }
            }
            return false;
        };
        return p;
    };


/*----------------------------------------------------------------------------
 * | Make a sum type out of a name and an object with data constructor names
 * as keys and an Array of strings naming the fields for each constructor,
 * which can be the empty Array.
 *
 *     > var List = mkType("List", {Nil: [], Cons: ["head", "tail"]});
 *     > List
 *     { constructors:
 *         { Nil:
 *             { tag: "Nil",
 *               meta: [],
 *               maker: [Object],
 *               pred: [Function],
 *               unmaker: [Function] },
 *           Cons:
 *             { tag: "Cons",
 *               meta: [Object],
 *               maker: [Object],
 *               pred: [Function],
 *               unmaker: [Function] } },
 *       pred: [Function],
 *       type: "List" }
 */

    mkType = function (typeName, dataConstructors) {
        var o, k;
        o = { constructors: {} };

        for (k in dataConstructors) {
            if (dataConstructors.hasOwnProperty(k)) {
                o.constructors[k] = mkData(k, dataConstructors[k]);
                o.constructors[k].maker.type = typeName;
            }
        }

        o.pred = mkTypePredicate(o.constructors);
        o.type = typeName;

        return o;
    };


/*----------------------------------------------------------------------------
 * | Flip the arguments of a binary function.
 */

    flip = function (f) {
        return function (x, y) {
            return f(y, x);
        };
    };


/*----------------------------------------------------------------------------
 * | Make arithmetic operators functions.
 */

    add = function (x, y) { return x + y; };
    sub = function (x, y) { return x - y; };
    mul = function (x, y) { return x * y; };
    div = function (x, y) { return x / y; };


/*----------------------------------------------------------------------------
 * | Partially apply a binary function.
 */

    partial1 = function (x, f) {
        return function (y) {
            return f(x, y);
        };
    };


/*----------------------------------------------------------------------------
 * | Make a function of two arguments into a function of one argument that
 * returns a function of one argument. Also make a way to undo curry.
 */

    curry = function (f) {
        return function (x) {
            return partial1(x, f);
        };
    };

    uncurry = function (f) {
        return function (x, y) {
            return f(x)(y);
        };
    };


/*----------------------------------------------------------------------------
 * | Integer increment and decrement.
 */

    inc = partial1(1, add);
    dec = partial1(1, flip(sub));


/*----------------------------------------------------------------------------
 * | Function composition.
 */

    compose = function (f, g) {
        return function (x) {
            return f(g(x));
        };
    };


/*----------------------------------------------------------------------------
 * | List data type and functions.
 */

    List = mkType("List", {
        Nil: [],
        Cons: ["car", "cdr"]
    });
    e = environment().type(List);

    isNil = function (xs) {
        return e.match(xs, {
            Nil: function () { return true; },
            Cons: function () { return false; }
        });
    };

    head = function (xs) {
        return e.match(xs, {
            Nil: function () {
                throw new Error("head: Called head on an " + "empty List.");
            },
            Cons: function (x, xs) {
                return x;
            }
        });
    };

    tail = function (xs) {
        return e.match(xs, {
            Nil: function () {
                return e.Nil();
            },
            Cons: function (x, xs) {
                return xs;
            }
        });
    };

    drop = function (xs, n) {
        if (n <= 0) {
            return xs;
        }
        return drop(tail(xs), dec(n));
    };

    dropWhile = function (p, xs) {
        return e.match(xs, {
            Nil: function () { return e.Nil(); },
            Cons: function (_x, _xs) {
                if (p(_x)) {
                    return dropWhile(p, _xs);
                }
                return xs;
            }
        });
    };

    setHead = function (x, xs) {
        return e.match(xs, {
            Nil: function () { return e.Cons(x, xs); },
            Cons: function (_x, _xs) { return e.Cons(x, _xs); }
        });
    };

    init = function (xs) {
        return e.match(xs, {
            Nil: function () { return e.Nil(); },
            Cons: function (_x, _xs) {
                if (isNil(_xs)) {
                    return e.Nil();
                }
                return e.Cons(_x, init(_xs));
            }
        });
    };

    sum = function (xs) {
        return e.match(xs, {
            Nil: function () { return 0; },
            Cons: function (x, xs) {
                return x + sum(xs);
            }
        });
    };


/*----------------------------------------------------------------------------
 * | EXPORTS
 */

    Fp = Object.create(null);

    Fp.add = add;
    Fp.compose = compose;
    Fp.div = div;
    Fp.drop = drop;
    Fp.dropWhile = dropWhile;
    Fp.e = e;
    Fp.environment = environment;
    Fp.extend = extend;
    Fp.flip = flip;
    Fp.head = head;
    Fp.inc = inc;
    Fp.init = init;
    Fp.isDefined = isDefined;
    Fp.isNil = isNil;
    Fp.isNotDefined = isNotDefined;
    Fp.mkType = mkType;
    Fp.mul = mul;
    Fp.partial1 = partial1;
    Fp.setHead = setHead;
    Fp.sub = sub;
    Fp.sum = sum;
    Fp.tail = tail;
    Fp.uncurry = uncurry;
    Fp.undef = undef;

    UNIVERSE.Fp = Fp;
/*--------------------------------------------------------------------------*/



}(this));
