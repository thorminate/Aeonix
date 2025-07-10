import Aeonix from "../../aeonix.js";

export default class BaseManager {
  private _aeonix: Aeonix | undefined;

  get aeonix(): Aeonix | undefined {
    return this._aeonix;
  }

  constructor(aeonix?: Aeonix) {
    this._aeonix = aeonix ? aeonix : undefined;
  }
}
