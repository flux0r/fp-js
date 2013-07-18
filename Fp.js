(function (UNIVERSE) {
    "use strict";

    var Fp, extend, environment, isDefined, isNotDefined, mkAccessor, mkData,
        mkDataConstructor, mkDataDeconstructor, mkDataPredicate;

    extend = function (x, y) {
        var prop;
        for (prop in y) {
            if (y.hasOwnProperty(prop)) {
                x[prop] = y[prop];
            }
        }
        return x;
    };

    mkAccessor = function (k, d) {
        return function (x) {
            if (!d.pred(x)) {
                throw new TypeError(k + ": Expected " + d.type +
                    " but got something else.");
            }
            return d.unmaker(x, k);
        };
    };

    environment = function (dataConstructors) {
        var d, datas, i, o;

        if (!(this instanceof environment) ||
                isDefined(this.data)) {
            o = Object.create(environment.prototype);
            environment.apply(o, arguments);
            return o;
        }

        datas = dataConstructors || {};

        this.data = function (d) {
            var c, newDatas;
            c = {};
            c[d.type] = d;
            newDatas = extend(datas, c);
            return environment(newDatas);
        };

        for (d in datas) {
            if (datas.hasOwnProperty(d)) {
                o = datas[d];
                if (isDefined(this[o.type])) {
                    throw new Error("The name for the data constructor " + d +
                            " is already defined in this environment.");
                }
                this[o.type] = o.maker;
                for (i = 0; i < o.meta.length; i += 1) {
                    this[o.meta[i]] = mkAccessor(o.meta[i], o);
                }
            }
        }
    };

    isDefined = function (x) {
        return x !== undefined;
    };

    isNotDefined = function (x) {
        return x === undefined;
    };

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

    mkDataPredicate = function (fields) {
        var p;
        p = function (x) {
            var i;
            for (i = 0; i < fields.length; i += 1) {
                if (isNotDefined(x[fields[i]])) {
                    return false;
                }
            }
            return true;
        };
        return p;
    };

    mkDataDeconstructor = function (fields) {
        var d;
        d = function (x, k) {
            return x[k];
        };
        return d;
    };

    mkData = function (dataName, fields) {
        return {
            type: dataName,
            meta: fields,
            maker: mkDataConstructor(dataName, fields),
            pred: mkDataPredicate(fields),
            unmaker: mkDataDeconstructor(fields)
        };
    };

    Fp = Object.create(null);
    Fp.environment = environment;
    Fp.extend = extend;
    Fp.mkData = mkData;

    UNIVERSE.Fp = Fp;

}(this));
