"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.microEnv = void 0;
const supply_demand_1 = require("@ceil-dev/supply-demand");
const createGet = (custom) => ({ descriptor, obj, caller, next }, { key }) => {
    return custom
        ? custom({ key, descriptor, obj, caller, next })
        : key in obj
            ? obj[key]
            : descriptor === null || descriptor === void 0 ? void 0 : descriptor.defaultData;
};
const createSet = (custom) => ({ obj, descriptor, value, caller }, { key }) => {
    return custom
        ? custom({ key, descriptor, obj, value, caller })
        : (obj[key] = value);
};
const microEnv = (obj = {}, descriptor, { get, set } = {}) => {
    if (!descriptor.children)
        descriptor = Object.assign(Object.assign({ key: 'environment', type: 'environment' }, descriptor), { children: Object.keys(obj).reduce((res, k) => {
                const property = obj[k];
                res.push({
                    key: k,
                    type: property === undefined
                        ? 'unknown'
                        : property === null
                            ? 'null'
                            : Array.isArray(property)
                                ? 'array'
                                : property instanceof Promise
                                    ? 'promise'
                                    : typeof obj[k],
                });
                return res;
            }, []) });
    const awaiters = {};
    const pendingGet = {};
    const getAwaiter = (key) => {
        if (key in awaiters)
            return awaiters[key];
        const awaiter = {};
        awaiter.promise = new Promise((res, rej) => {
            awaiter.resolve = (v) => {
                delete awaiters[key];
                res(v);
            };
            awaiter.reject = rej;
        });
        awaiters[key] = awaiter;
        return awaiter;
    };
    return (0, supply_demand_1.default)((_, { demand }) => {
        const { children = [] } = descriptor;
        const childDescriptorsByKey = children.reduce((res, d) => {
            res[d.key] = d;
            return res;
        }, {});
        const _get = (key, caller, next) => {
            const childDescriptor = childDescriptorsByKey[key];
            if (!childDescriptor || (caller && childDescriptor.private))
                throw new Error(`microEnv: trying to get non-existent property "${key}"`);
            if (next && caller) {
                return pendingGet[key] || getAwaiter(key).promise;
            }
            else if (caller && key in pendingGet) {
                return pendingGet[key];
            }
            const res = demand({
                key,
                type: 'get',
                data: { descriptor: childDescriptor, obj, caller, next },
            });
            if (res instanceof Promise) {
                pendingGet[key] = new Promise((resolve) => {
                    (() => __awaiter(void 0, void 0, void 0, function* () {
                        const r = yield res;
                        delete pendingGet[key];
                        resolve(r);
                    }))().catch((e) => {
                        console.warn(e);
                    });
                });
            }
            return res;
        };
        const _set = (key, value, caller) => {
            var _a;
            const childDescriptor = childDescriptorsByKey[key];
            if (!childDescriptor || (caller && childDescriptor.private))
                throw new Error(`microEnv: trying to set non-existent property "${key}"`);
            (_a = awaiters[key]) === null || _a === void 0 ? void 0 : _a.resolve(value);
            return demand({
                key,
                type: 'set',
                data: {
                    descriptor: childDescriptor,
                    obj,
                    value,
                    caller,
                },
            });
        };
        const face = (children || []).reduce((res, { key }) => {
            Object.defineProperty(res, key, {
                get: () => _get(key),
                set: (value) => _set(key, value),
            });
            return res;
        }, {});
        return {
            descriptor,
            face,
            data: obj,
            get: _get,
            set: _set,
        };
    }, {
        get: createGet(get),
        set: createSet(set),
    });
};
exports.microEnv = microEnv;
exports.default = microEnv;
//# sourceMappingURL=index.js.map