(function (UNIVERSE) {
    "use strict";
/*--------------------------------------------------------------------------*/



/*--------------------------------------------------------------------------*/
    var
        Fp,

        extend,
        environment,
        isDefined,
        isNotDefined,
        mkAccessor,
        mkData,
        mkDataConstructor,
        mkDataDeconstructor,
        mkDataPredicate,
        mkType,
        mkTypePredicate,
        undef;
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
 * | An environment has data constructors and accessors. Adding a data
 * constructor to the environment using mkData embeds the constructor and
 * creates accessor functions for the fields in the data type.
 *
 * // A simple product type.
 * > var Pair = Fp.mkData("Pair", ["car", "cdr"]);
 * // Make an environment and then add the type to it.
 * > var e = Fp.environment().data(Pair);
 * // Make a value of the type and then test the accessors.
 * > var x = e.Pair(3, 2);
 * > e.car(x);
 * 3
 * > var z = { car: 3, cdr: 2 };
 * // Looks just like x so I should be able to...
 * > e.car(z);
 * TypeError: car: Expected Pair but got something else.
 * // But it isn't a Pair.
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

        for (d in datas) {
            if (datas.hasOwnProperty(d)) {
                o = datas[d];
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
 * function. Generally this result is passed in to an environment via its
 * data function.
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


/* Sum type predicate */

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

/* Sum type. */

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
 * | EXPORTS
 */

    Fp = Object.create(null);

    Fp.environment = environment;
    Fp.extend = extend;
    Fp.isDefined = isDefined;
    Fp.isNotDefined = isNotDefined;
    Fp.mkData = mkData;
    Fp.mkType = mkType;
    Fp.undef = undef;

    UNIVERSE.Fp = Fp;
/*--------------------------------------------------------------------------*/



}(this));
