(function (UNIVERSE) {
    "use strict";

    var Fp,

        List,

        id,
        mk,
        mkConstructor,
        product,
        sum;

    id = function (x) {
        return x;
    };

    mk = Object.create;

    mkConstructor = function (proto) {
        return function () {
            var o;
            if (Object.getPrototypeOf(this) !== proto.prototype) {
                o = Object.create(proto.prototype);
                o.constructor.apply(o, arguments);
                return o;
            }
            return c.apply(this, arguments);
        };
    };

    product = function (name, fields) {
        var constructor, i, v;
        constructor = function () {
            var self, x;
            self = mkConstructor(constructor);
            if (arguments.length !== fields.length) {
                throw new TypeError(name + ": Expected " + fields.length +
                        " fields. Got " + arguments.length + ".");
            }
            if (fields.length === 0) {
                self[name + "-void"] = true;
            } else {
                for (i = 0; i < fields.length; i += 1) {
                    self[fields[i]] = arguments[i]
                }
            }
            return self;
        };
        return constructor;
    };

    sum = function (cs) {
        var c, defs, k, mkCatamorphism, mkPrototype;

        defs = function () {};

        mkCatamorphism = function (k) {
            return function (fs) {
                var args, fields, i;
                fields = cs[k];
                args = [];
                if (!cs[k]) {
                    throw new TypeError("Catamorphism: No such " +
                            " constructor as " + k + ".");
                }
                for (i = 0; i < fields.length; i += 1) {
                    args.push(this[fields[i]]);
                }
                return fs[k].apply(this, args);
            };
        };

        mkPrototype = function (k) {
            var proto;
            proto = mk(defs.prototype);
            proto.catamorphism = mkCatamorphism(k);
            return proto;
        };

        for (c in cs) {
            if (cs.hasOwnProperty(c)) {
                if (!cs[c].length) {
                    defs[c] = mkPrototype(c);
                } else {
                    defs[c] = product(c, cs[c]);
                    defs[c].prototype = mkPrototype(c);
                }
            }
        }
        return defs;
    };

    List = sum({
        Cons: ["car", "cdr"],
        Nil: []
    });

    List.xs = List.Cons(4, List.Nil);

    Fp = {};

    Fp.List = List;

    Fp.mk = mk;
    Fp.product = product;
    Fp.sum = sum;

    UNIVERSE.Fp = Fp;

}(this));
