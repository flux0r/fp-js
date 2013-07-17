(function (UNIVERSE) {
    
    var
        Fp,
        
        environment,
        extend,
        isNotDefined,
        mkData,
        mkDataConstructor,
        mkDataDeconstructor,
        mkDataPredicate;
    
    Fp = Object.create(null);
    
    extend = function (x, y) {
        var prop;
        for (prop in y) {
            if (y.hasOwnProperty(prop)) {
                x[prop] = y[prop]; 
            }
        }
        return x;
    };
    
    isNotDefined = function (x) {
        return x === undefined;
    };
    
    environment = function (dataConstructors) {
        if (!(this instanceof environment)) {
            return new environment(typeClasses, dataConstructors);
        }
        
        dataConstructors = dataConstructors || {};
        
        
    };
    
    mkDataConstructor = function (dataName, fields) {
        maker = function () {
            var i, o;
            if (!(this instanceof maker)) {
                o = Object.create(maker.prototype);
                maker.apply(o, arguments);
                return o;
            }
            if (arguments.length !== fields.length) {
                throw new TypeError(dataName + ": Expected " + fields.length  + 
                        " fields but got " + arguments.length + ".");
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
            meta: fields,
            maker: mkDataConstructor(dataName, fields),
            pred: mkDataPredicate(fields),
            unmaker: mkDataDeconstructor(fields),
        };
    };
    
    mkType = function (type, constructors) {
        var branches;
    }


/*Pair = mkRecordConstructor("Pair", ["car", "cdr"]);

testPair1 = car(Pair(3, 4)) === 3;
testPair2 = cdr(Pair(3, 4)) === 4;
*/

/*
Maybe = mkTypeConstructor("Maybe", { Just: ["val"], Nothing: [] });

fromMaybe = function (defval, x) {
    x.match({ Just: x.val, Nothing: defval });
};


testMaybe1 = fromMaybe(0, Just(3)) === 3;
testMaybe2 = fromMaybe(0, Nothing()) === 0;
*/

Fp.extend = extend;
Fp.mkData = mkData;

UNIVERSE.Fp = Fp;

}(this));
