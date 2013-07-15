var Product = function (type, fields) {
    var f;
    f = function () {
        var o;
        if (!(this instanceof f)) {
            o = Object.create(f.prototype);
            f.apply(o, arguments);
            return o;
        }
        if (fields.length != arguments.length) {
            throw new TypeError(type + ": Expected " + fields.length +
                    " but got " + arguments.length + ".")
        }
        for (i = 0; i < arguments.length; i += 1) {
            this[fields[i]] = arguments[i]
        }
    };
    f.type = type;
    f.length = fields.length;
    return f;
};

var Data = function (type, maker, pred, unmaker) {
    var o = Object.create(null)
    o.type = type;
    o.maker = maker;
    o.pred = pred;
    o.unmaker = unmaker;
    return o;
};

var recordToDataType = function () {
    return mkDataTypeMaker(Records, rtdToDataType);
};

var DataTypeMaker = function (typeClass, f) {
    return function (args) {
        var data = f.apply(this, args);
        var namer = function (p) {
           return p(typeClass, data.type);
        };
        return mkData(function (p) { return p(typeClass); });
    };
};

//var DataType = function (tag, fields, options) {
//    var o, uuid;
//    o = Object.create(null);
//    if (options.constructor === undefined) {
//        o.hasAConstructor = false;
//    } else {
//        o.hasAConstructor = true;
//    }
//    o.uuid = options.uuid;
//    o.rtd = mkDataTypeRtd(tag, fields);
//    if (o.hasAConstructor) {
//        recordToDataType(o.rtd, function (maker, pred, unmaker) {


