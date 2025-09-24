import useStore from "../utils/store";

const SmallCircle = () => {
  const player = useStore((state) => state.player)
    const colorClass = ["smallWhite", "smallYellow", "smallRed"];
    return <div className={colorClass[player]}></div>;
  };

export default SmallCircle;