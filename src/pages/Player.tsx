
import React from "react";
import { useParams } from "react-router-dom";

const Player = () => {
  const { id } = useParams();
  
  return (
    <div className="pt-6 pb-32 md:pb-4 px-4 md:px-8 md:ml-16">
      <h1 className="text-3xl font-bold mb-6 mt-2">Player</h1>
      <p>Playing content with ID: {id}</p>
    </div>
  );
};

export default Player;
