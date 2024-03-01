import { createRoot } from "solid-js";
import { XFormDefinition } from "./XFormDefinition";
import { EntryState } from "./state/EntryState";

export class Engine implements Disposable {
  reactiveEntry: EntryState;
  disposeSolidRoot: () => void;

  constructor(formXml:string, reactiveFactory: <T extends object>(value: T) => T){
    const definition = new XFormDefinition(formXml);
    const [dispose, re] = createRoot((disposeRoot) => {
      const entry = new EntryState(definition);
      const reactiveEntry = reactiveFactory(entry);
      reactiveEntry.setup();
      return [disposeRoot, reactiveEntry];
    });

    this.reactiveEntry = re;
    this.disposeSolidRoot = dispose;

  }

  [Symbol.dispose](): void {
    this.disposeSolidRoot();
  }
}