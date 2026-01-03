import EventEmitter from "events";
import Aeonix from "../../aeonix.js";

export default class BaseManager extends EventEmitter {
  private _aeonix: Aeonix | undefined;

  get aeonix(): Aeonix | undefined {
    return this._aeonix;
  }

  constructor(aeonix?: Aeonix) {
    super();
    this._aeonix = aeonix ? aeonix : undefined;
  }
}
