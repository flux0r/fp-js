(function (UNIVERSE) {
    "use strict";

    var
        /* Module */
        Fp,

        /* Constructors */
        List,
        Pair,

        /* Functions */
        mk,
        product,
        sum;

    product = function (name, fields) {
        var f;
        f = function () {
            var i, o;
            if (!(this instanceof f)) {
                o = Object.create(f.prototype);
                f.apply(o, arguments);
                return o;
            }
            if (arguments.length !== fields.length) {
                throw new TypeError(name + ": Expected " + fields.length +
                        " fields. Got " + arguments.length + ".");
            }
            for (i = 0; i < fields.length; i += 1) {
                this[fields[i]] = arguments[i];
            }
            this.tag = name;
        };
        f.tag = name;
        f.fields = fields.length;
        return f;
    };

    sum = function (name, cs) {
        var f;
        f = function () {
            var c, o;
            if (!(this instanceof f)) {
                o = Object.create(f.prototype);
                f.apply(o, arguments);
                return o;
            }
            for (c in cs) {
                if (cs.hasOwnProperty(c)) {
                    this[c] = product(c, cs[c]);
                    this[c].type = name;
                }
            }
            this.type = name;
            this.branches = Object.keys(cs).length;
        };
        return f();
    };

    Pair = product("Pair", ["car", "cdr"]);
    List = sum("List", { Cons: ["head", "tail"], Nil: [] });

    Fp = Object.create(null);

    Fp.List = List;
    Fp.Pair = Pair;

    Fp.mk = mk;
    Fp.product = product;
    Fp.sum = sum;

    UNIVERSE.Fp = Fp;

}(this));
