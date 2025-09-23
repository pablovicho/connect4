const Winner = ({winner}) => {
    const colorClass = ["none", "player1", "player2"];
    return winner > 0 ? (
      <div>
        <h1 className={colorClass[winner]}>Player {winner} wins!</h1>
      </div>
    ) : null;
  };

  export default Winner;