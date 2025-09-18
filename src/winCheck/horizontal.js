function horizontal(matrix) {
    if(!matrix) return;
    //horizontal check
    let xWin = false;
    let yWin = false;
    for (let row = 0; row < 6; row++) {
        let xCounter = 0;
        let yCounter = 0;
        for(let col = 0; col < 7; col++) {
            if(matrix[row][col] === 1) {yCounter = 0; xCounter++;}
            if(matrix[row][col] === 2) {yCounter ++; xCounter = 0;}
            if(matrix[row][col] === 0) {yCounter = 0; xCounter = 0;}
            if (xCounter >= 4) xWin=true;
            if (yCounter >= 4) yWin = true;
        }
  }
  if (xWin) return 1;
  if (yWin) return 2;
  return 0
}

export default horizontal;