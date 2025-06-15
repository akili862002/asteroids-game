export interface IExtension {
  name: string;
  update?: () => void;
}

export interface IExtensionConstructor<T extends IExtension> {
  new (...args: any[]): T;
}
