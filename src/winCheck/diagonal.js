  //diagonal check!!
  function diagonal(matrix) {
    if(!matrix) return;
    let xWin = false;
    let yWin = false;
    for (let j = 0; j < 6; j++) {
    //the horizontal axis
    let xCounter = 0;
    let yCounter = 0;

    for (let k = 0; k < 7; k++) {
      //the vertical axis
      if (xCounter >= 4) {xWin = true}
      if (yCounter >= 4) {yWin = true}
      if ((k + 3) < 7 && (j + 3) < 6) {
        if(matrix[j][k] === 1 && matrix[j + 1][k + 1] === 1
          && matrix[j + 2][k + 2] === 1 && matrix[j + 3][k + 3] === 1) {xWin = true}
        if(matrix[j][k] === 2 && matrix[j + 1][k + 1] === 2
          && matrix[j + 2][k + 2] === 2 && matrix[j + 3][k + 3] === 2) {yWin = true}
      }
    }
}
if (xWin) return 1;
if (yWin) return 2;
return 0;
}

export default diagonal
