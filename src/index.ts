import supplyDemand, { Supplier } from 'supply-demand';
import {
  EnvCreator,
  GetSupplierData,
  Getter,
  MicroEnv,
  SetSupplierData,
  Setter,
} from './types';

const createGet =
  <T>(custom?: Getter<T>): Supplier<GetSupplierData<any>, T> =>
  ({ descriptor, obj }, { key }) => {
    return custom
      ? custom({ key, descriptor, obj })
      : key in obj
      ? obj[key]
      : descriptor?.defaultData;
  };

const createSet =
  <T>(custom?: Setter<T>): Supplier<SetSupplierData<any>, T> =>
  ({ obj, descriptor, value }, { key }) => {
    // TODO: validate is type is known
    return custom
      ? custom({ key, descriptor, obj, value })
      : (obj[key] = value);
  };

const microEnv: EnvCreator = (
  obj = {},
  descriptor = undefined,
  { get, set } = {}
) => {
  if (!descriptor?.children)
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
              : typeof property?.then === 'function'
              ? 'promise'
              : typeof obj[k],
        });
        return res;
      }, []),
    };

  return supplyDemand<MicroEnv>(
    (_, { demand }) => {
      const { children = [] } = descriptor!;

      const childDescriptorsByKey = children.reduce<Record<string, any>>(
        (res, d) => {
          res[d.key] = d;
          return res;
        },
        {}
      );

      const face = (children || []).reduce((res, { key }) => {
        Object.defineProperty(res, key, {
          get: () =>
            demand({
              key,
              type: 'get',
              data: { descriptor: childDescriptorsByKey[key], obj },
            }),
          set: (value) =>
            demand({
              key,
              type: 'set',
              data: { descriptor: childDescriptorsByKey[key], obj, value },
            }),
        });

        return res;
      }, {});

      return {
        descriptor: descriptor!,
        face,
        data: obj,
        get: (key) =>
          demand({
            key,
            type: 'get',
            data: { descriptor: childDescriptorsByKey[key], obj },
          }),
        set: (key, value) =>
          demand({
            key,
            type: 'set',
            data: { descriptor: childDescriptorsByKey[key], obj, value },
          }),
      };
    },
    {
      get: createGet(get),
      set: createSet(set),
    }
  );
};

export default microEnv;
export {
  EnvCreator,
  GetSupplierData,
  Getter,
  MicroEnv,
  SetSupplierData,
  Setter,
};
