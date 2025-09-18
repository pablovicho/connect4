/* eslint-disable no-loop-func */
import column from "../utils/column";
function vertical(matrix) {
  if(!matrix) return;
    let xWin = false;
    let yWin = false;
    for (let i = 0; i < 7; i++) {
        //vertical check
        const col = column(matrix, i);
        let xCounter = 0;
        let yCounter = 0;
    
        col.forEach((element) => {
          if (element === 1) {yCounter = 0;xCounter++}
          if (element === 2) {xCounter = 0;yCounter++}
          if (element === 0) {xCounter=0; yCounter=0}
          if (xCounter >= 4) {xWin = true}
          if (yCounter >= 4) {yWin = true}
        })
      }
      if (xWin) return 1
      if (yWin) return 2
      return 0
}

export default vertical
