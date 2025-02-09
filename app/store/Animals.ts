import { Store } from "@tanstack/store";

export interface AnimalState {
  dogs: number;
  cats: number;
}
export const AnimalStore = new Store({
  dogs: 0,
  cats: 0,
});
