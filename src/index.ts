import supplyDemand, { Supplier, Suppliers } from '@ceil-dev/supply-demand';
import {
  Descriptor,
  Child,
  EnvCreator,
  GetSupplierData,
  Getter,
  MicroEnv,
  MicroEnvDescriptor,
  SetSupplierData,
  Setter,
} from './types';

type Awaiter<TValue = unknown> = {
  promise: Promise<TValue>;
  resolve: (value: TValue) => void;
  reject: (reason: unknown) => void;
};

const createGet =
  <T>(custom?: Getter<T>): Supplier<GetSupplierData, T> =>
  ({ descriptor, obj, caller, next }, { key }) => {
    return custom
      ? custom({ key, descriptor, obj, caller, next })
      : key in obj
        ? obj[key]
        : descriptor?.defaultData;
  };

const createSet =
  <T>(custom?: Setter<T>): Supplier<SetSupplierData<any>, T> =>
  ({ obj, descriptor, value, caller }, { key }) => {
    // TODO: validate if type is known
    return custom
      ? custom({ key, descriptor, obj, value, caller })
      : (obj[key] = value);
  };

const microEnv: EnvCreator = (obj = {}, descriptor, { get, set } = {}) => {
  if (!descriptor.children)
    descriptor = {
      key: 'environment',
      type: 'environment',
      ...descriptor,
      children: Object.keys(obj).reduce<any[]>((res, k) => {
        const property = obj[k];
        res.push({
          key: k,
          type:
            property === undefined
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
      }, []),
    };

  const awaiters: Record<string, Awaiter> = {};
  const pendingGet: Record<string, Promise<unknown>> = {};

  const getAwaiter = (key: string) => {
    if (key in awaiters) return awaiters[key];

    const awaiter: Awaiter = {} as any;
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

  return supplyDemand(
    (_, { demand }): MicroEnv => {
      const { children = [] } = descriptor!;

      const childDescriptorsByKey = children.reduce<Record<string, any>>(
        (res, d) => {
          res[d.key] = d;
          return res;
        },
        {}
      );

      const _get: MicroEnv['get'] = (key, caller, next) => {
        const childDescriptor = childDescriptorsByKey[key];

        if (!childDescriptor || (caller && childDescriptor.private))
          throw new Error(
            `microEnv: trying to get non-existent property "${key}"`
          );

        if (next && caller) {
          return pendingGet[key] || getAwaiter(key).promise;
        } else if (caller && key in pendingGet) {
          return pendingGet[key];
        }

        const res = demand({
          key,
          type: 'get',
          data: { descriptor: childDescriptor, obj, caller, next },
        });

        if (res instanceof Promise) {
          pendingGet[key] = new Promise((resolve) => {
            (async () => {
              const r = await res;
              delete pendingGet[key];
              resolve(r);
            })().catch((e) => {
              console.warn(e);
            });
          });
        }

        return res;
      };

      const _set: MicroEnv['set'] = (key, value, caller?) => {
        const childDescriptor = childDescriptorsByKey[key];

        if (!childDescriptor || (caller && childDescriptor.private))
          throw new Error(
            `microEnv: trying to set non-existent property "${key}"`
          );

        awaiters[key]?.resolve(value);

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
    },
    {
      get: createGet(get),
      set: createSet(set),
    } satisfies Suppliers
  );
};

export default microEnv;
export {
  microEnv,
  Child,
  Descriptor,
  EnvCreator,
  GetSupplierData,
  Getter,
  MicroEnv,
  MicroEnvDescriptor,
  SetSupplierData,
  Setter,
};
