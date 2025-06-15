import { nanoid } from "nanoid";
import {
  IExtension,
  IExtensionConstructor,
} from "../extensions/extensions.type";
import { Game } from "../game";

export const Entities = {
  ASTEROID: "asteroid",
  SHIP: "ship",
  BULLET: "bullet",
  FLAME: "flame",
  ROCKET: "rocket",
  EXPLOSION_SPARK: "explosion_spark",
  POINT_INDICATOR: "point_indicator",
};
export type EntityType = (typeof Entities)[keyof typeof Entities];

export type IEntity = {
  id: string;
  type: EntityType;
  zIndex: number;
  update: () => void;
  draw: () => void;
  getExtension: (extension: IExtensionConstructor<IExtension>) => IExtension;
  hasExtension: (extension: IExtensionConstructor<IExtension>) => boolean;
  addExtension: (extension: IExtension) => void;
  shouldRemove?: () => boolean;
};

export class Entity {
  public id: string;
  public type: EntityType;
  protected extensions: IExtension[] = [];
  protected game: Game;
  public zIndex: number = 0;

  constructor(game: Game, type: EntityType) {
    this.game = game;
    this.id = nanoid();
    this.type = type;
  }

  addExtension(extension: IExtension) {
    this.extensions.push(extension);
  }

  removeExtension(extension: IExtension) {
    delete this.extensions[extension.name];
  }

  getExtension<T extends IExtension>(ext: IExtensionConstructor<T>): T {
    const extension = this.extensions.find((e) => e instanceof ext);
    if (!extension) {
      throw new Error(`Extension ${(ext as any).type} not found`);
    }
    return extension as T;
  }

  hasExtension(extensionClass: IExtensionConstructor<IExtension>): boolean {
    return this.extensions.some((e) => e instanceof extensionClass);
  }

  update() {
    for (let extension of Object.values(this.extensions)) {
      if (extension.update) {
        extension.update();
      }
    }
  }

  draw() {}

  shouldRemove(): boolean {
    return false;
  }
}
