import { createMachine } from 'xstate';

const promiseMachine = createMachine({
  /** @xstate-layout N4IgpgJg5mDOIC5gF8A0IB2B7CdGgAcAnLAWwEtYx8QCtZyAXcrDGgD0QFoAWATh4A6AMwAmABwBGUQFZ0AT26Shk8WuEA2cQAY+agOzbt+5GlokKVQeQgAbaklr0mLNo84JhQ4TJk8t+nIgigj6wiKSkRrCknzakaJ8fKboxGSUYIIYYADuAASwjACGjGB5kjR0DMysNIxYBIiS2qKCfKJGPMICMjGy6PYAZozcPP4iEtJBAEZYjPWkTTLabR3aXT19QUTkUAAWIwhcYhoTUv0gOTaMe00d6HtguweIPOLoHrzjYudBIc2tdqdbo8XpTFLmdJWbL5QolMqiSrOGpuUD1RoICQyVbAzZTAZgYbcYT6Vo-fEgWbzMiIYR0nHrEFgi47faHLiyMmTC5XCA3O7aB5PNmvd4gT4krm-BSILEMjagramUxAA */
  id: 'promise',
  initial: "idle",
  states: {
    idle: {},
    "new state 1": {},
    "new state 2": {}
  }
});