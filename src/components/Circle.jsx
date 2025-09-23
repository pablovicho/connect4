import React from "react";
import "./../App";
import useStore from "../utils/store";

export default function Circle(props) {
  const winner = useStore((state) => state.winner);
  const player = props.player;
  const colorClass = ["white", "yellow", "red"];

  return winner === 0 ? (
      <div className= {`circle ${colorClass[player]}`}></div>
  )
  :
  (
    <div className= {`circle ${colorClass[player]} no-animate` }></div>
  );
}
