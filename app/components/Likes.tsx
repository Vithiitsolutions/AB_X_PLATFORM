import React from "react";
import { useStore } from "@tanstack/react-store";
import { AnimalState, AnimalStore } from "../store/index.ts";

interface Props {
  animal: keyof AnimalState;
}

const Display: React.FC<Props> = ({ animal }) => {
  const count = useStore(AnimalStore, (state: AnimalState) => state[animal]);
  return <div>{`${animal}: ${count}`}</div>;
};

const updateState = (animal: keyof AnimalState) => {
  AnimalStore.setState((state: AnimalState) => {
    return {
      ...state,
      [animal]: state[animal] + 1,
    };
  });
};
export const Increment: React.FC<Props> = ({ animal }) => (
  <button onClick={() => updateState(animal)}>My Friend Likes {animal}</button>
);

export default Display;
