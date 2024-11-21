type GetterSetterProps = {
  key: string;
  descriptor: Descriptor;
  obj: Record<string, any>;
  caller?: string;
};

export type Setter<T> = (
  props: GetterSetterProps & {
    value: T;
  }
) => T;

export type Getter<T> = (props: GetterSetterProps & { next?: boolean }) => T;

type Face = Record<string, any>;

export type EnvData = Record<string, EnvPropertyValue>;

export type MicroEnv = {
  id?: string;
  descriptor: MicroEnvDescriptor;
  face: Face;
  data: EnvData;
  get: (key: string, caller?: string, next?: boolean) => any;
  set: <T>(key: string, value: T, caller?: string) => T;
};

export type Child = {
  key: string;
  type: string | { extends: string; data?: any };
  name?: string;
  description?: string;
  private?: boolean;
  defaultData?: any;
};

export type Descriptor = Child & {
  children: Child[];
  id: string;
};

type GetSet = {
  get?: Getter<any>;
  set?: Setter<any>;
};

export type SetSupplierData<T> = {
  descriptor: Descriptor;
  obj: Record<string, any>;
  value: T;
  caller?: string;
};

export type GetSupplierData = {
  descriptor: Descriptor;
  obj: Record<string, any>;
  caller?: string;
  next?: boolean;
};

export type MicroEnvDescriptor = Partial<Child> & {
  id: string;
  children?: Child[];
};

export type EnvPropertyValue =
  | undefined
  | null
  | boolean
  | number
  | string
  | unknown[]
  | { [k: string]: unknown }
  | ((payload: unknown, caller?: string) => unknown)
  | Promise<unknown>;

export type EnvCreator = (
  obj: Record<string, EnvPropertyValue>,
  descriptor: MicroEnvDescriptor,
  overrides?: GetSet
) => MicroEnv;
