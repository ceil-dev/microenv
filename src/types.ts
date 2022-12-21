type GetterSetterProps = {
  key: string;
  descriptor: Descriptor;
  obj: Record<string, any>;
};

export type Setter<T> = (
  props: GetterSetterProps & {
    value: T;
  }
) => T;

export type Getter<T> = (props: GetterSetterProps) => T;

type Face = Record<string, unknown>;

export type MicroEnv = {
  descriptor: Descriptor;
  face: Face;
  data: unknown;
  get: (key: string) => any;
  set: <T>(key: string, value: T) => T;
};

type Descriptor = {
  key: string;
  type: string;
  children: Descriptor[];
  defaultData?: any;
};

type GetSet = {
  get?: Getter<any>;
  set?: Setter<any>;
};

export type SetSupplierData<T> = {
  key: string;
  descriptor: Descriptor;
  obj: Record<string, any>;
  value: T;
};

export type GetSupplierData<T> = {
  key: string;
  descriptor: Descriptor;
  obj: Record<string, any>;
};

export type EnvCreator = (
  obj: Record<string, any>,
  descriptor?: Descriptor,
  overrides?: GetSet
) => MicroEnv;
