(function (UNIVERSE) {
    "use strict";
/*--------------------------------------------------------------------------*/



/*--------------------------------------------------------------------------*/
    var
        Fp,

        List,

        drop,
        dropWhile,
        e,
        foldl,
        foldr,
        fromArray,
        head,
        init,
        isNil,
        len,
        lLen,
        lProduct,
        lSum,
        product,
        setHead,
        sum,
        tail,
        toArray;



/*----------------------------------------------------------------------------
 * | IMPORTS
 */

    if (UNIVERSE.Fp === void(0)) {
        throw new Error("List.js: This module requires Fp.js.");
    } else {
        Fp = UNIVERSE.Fp;
    }

    if (Fp.e === Fp.undef) {
        e = Fp.environment();
    } else {
        e = Fp.e;
    }
/*--------------------------------------------------------------------------*/



/*----------------------------------------------------------------------------
 * | Add the List type to the environment.
 */

    e = e.type(Fp.mkType("List", {
        Nil: [],
        Cons: ["car", "cdr"]
    }));


/*----------------------------------------------------------------------------
 * | Empty list predicate.
 */

    isNil = function (xs) {
        return e.match(xs, {
            Nil: Fp.getTrue,
            Cons: Fp.getFalse
        });
    };


/*----------------------------------------------------------------------------
 * | Return the first element of a list.
 */

    head = function (xs) {
        return e.match(xs, {
            Nil: function () {
                throw new Error("head: Called head on an " + "empty List.");
            },
            Cons: Fp.kFunc
        });
    };


/*----------------------------------------------------------------------------
 * | Chapter 3 exercise 2
 *
 * Implement tail, which returns all but the first element of a list.
 */

    tail = function (xs) {
        return e.match(xs, {
            Nil: e.Nil,
            Cons: Fp.flip(Fp.kFunc)
        });
    };


/*----------------------------------------------------------------------------
 * | Chapter 3 exercise 3
 *
 * Generalize tail to drop, which removes the first n elements of the list.
 */

    drop = function (xs, n) {
        if (n <= 0) {
            return xs;
        }
        return drop(tail(xs), Fp.dec(n));
    };


/*----------------------------------------------------------------------------
 * | Chapter 3 exercise 4
 *
 * Implement dropWhile, which removes the elements from the List as long as
 * the predicate p holds.
 */

    dropWhile = function (p, xs) {
        return e.match(xs, {
            Nil: e.Nil,
            Cons: function (_x, _xs) {
                if (p(_x)) {
                    return dropWhile(p, _xs);
                }
                return xs;
            }
        });
    };


/*----------------------------------------------------------------------------
 * | Chapter 3 exercise 5
 *
 * Implement setHead for replacing the first element of a List.
 */

    setHead = function (x, xs) {
        return e.match(xs, {
            Nil: function () { return e.Cons(x, xs); },
            Cons: function (_x, _xs) { return e.Cons(x, _xs); }
        });
    };


/*----------------------------------------------------------------------------
 * | Chapter 3 exercise 6
 *
 * Implement init, which returns all but the first element of a List.
 */

    init = function (xs) {
        return e.match(xs, {
            Nil: e.Nil,
            Cons: function (_x, _xs) {
                if (isNil(_xs)) {
                    return e.Nil();
                }
                return e.Cons(_x, init(_xs));
            }
        });
    };


/*----------------------------------------------------------------------------
 * | Sum the elements of a List of numeric values.
 */

    sum = function (xs) {
        return e.match(xs, {
            Nil: function () { return 0; },
            Cons: function (x, xs) {
                return x + sum(xs);
            }
        });
    };


/*----------------------------------------------------------------------------
 * | Find the product of the elements of a List of numeric values.
 */

    product = function (xs) {
        return e.match(xs, {
            Nil: function () { return 1; },
            Cons: function (x, xs) {
                return x * product(xs);
            }
        });
    };


/*----------------------------------------------------------------------------
 * | Make a JavaScript Array into a List.
 */

    fromArray = function (xs) {
        var i, _xs;
        _xs = e.Nil();
        for (i = xs.length - 1; i >= 0; i -= 1) {
            _xs = e.Cons(xs[i], _xs);
        }
        return _xs;
    };


/*----------------------------------------------------------------------------
 * | Make a List into a JavaScript Array.
 */

    toArray = function (xs) {
        var _xs, iter;
        _xs = [];
        iter = function (ys) {
            return e.match(ys, {
                Nil: function () {},
                Cons: function (y, ys) {
                    _xs.push(y);
                    return iter(ys);
                }
            });
        };
        iter(xs);
        return _xs;
    };


/*----------------------------------------------------------------------------
 * | List recursion pattern starting with application at the end of the
 * List.
 */

    foldr = function (f, z, xs) {
        return e.match(xs, {
            Nil: function () { return z; },
            Cons: function (_x, _xs) { return f(_x, foldr(f, z, _xs)); }
        });
    };


/*----------------------------------------------------------------------------
 * | Chapter 3 exercise 9
 *
 * Use foldr to find the length of a list.
 */

    len = function (xs) {
        return foldr(function (x, y) { return y + 1; }, 0, xs);
    };


/*----------------------------------------------------------------------------
 * | Chapter 3 exercise 10
 *
 * Write a List recursion function that starts with application at the front
 * of the List.
 */

    foldl = function (f, z, xs) {
        return e.match(xs, {
            Nil: function () { return z; },
            Cons: function (_x, _xs) { return foldl(f, f(z, _x), _xs); }
        });
    };


/*----------------------------------------------------------------------------
 * | Chapter 3 exercise 11
 *
 * Use foldl to implement sum, product, and length.
 */

    lSum = function (xs) {
        return foldl(Fp.add, 0, xs);
    };

    lProduct = function (xs) {
        return foldl(Fp.mul, 1, xs);
    };

    lLen = function (xs) {
        return foldl(function (x, y) { return x + 1; }, 0, xs);
    };



    List = {};
    List.drop = drop;
    List.dropWhile = dropWhile;
    List.example = e.Cons(8, e.Cons(2, e.Cons(4, e.Cons(3, e.Nil()))));
    List.foldr = foldr;
    List.foldl = foldl;
    List.fromArray = fromArray;
    List.init = init;
    List.isNil = isNil;
    List.head = head;
    List.len = len;
    List.lLen = lLen;
    List.lProduct = lProduct;
    List.lSum = lSum;
    List.product = product;
    List.setHead = setHead;
    List.sum = sum;
    List.tail = tail;
    List.toArray = toArray;

    UNIVERSE.Fp.e = e;
    UNIVERSE.Fp.List = List;


}(this));
