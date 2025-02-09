import React from "react";

interface Props {
  name: string;
  likes: number;
}

const AnimalCard: React.FC<Props> = ({ name, likes }) => {
  return <div>You Animal: {name} and the Likes are {likes}</div>;
};
export default AnimalCard;
