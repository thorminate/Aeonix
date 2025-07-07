import Aeonix from "../../aeonix.js";

type ConditionalAeonix<Bool> = Bool extends true ? Aeonix : undefined;

export default class BaseManager<HasAeonix = true> {
  aeonix: ConditionalAeonix<HasAeonix>;
  constructor(aeonix: ConditionalAeonix<HasAeonix>) {
    this.aeonix = aeonix;
  }
}
