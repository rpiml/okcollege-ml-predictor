// @flow

import Sylvester from 'sylvester';

/*
* Least Squares
* Given a data matrix of points and a vector of the results,
* it finds the weights using least squares
*/
export function lstsq(data: number[], results: number[]){
  let X = $M(data);
  let y = $V(results);
  let ones = [];
  for(let i = 0; i < X.rows(); i++) {
      ones.push([1]);
  }
  ones = $M(ones)

  X = ones.augment(X);
  let pinv = (((X.transpose()).multiply(X)).inverse()).multiply(X.transpose())

  let weights = pinv.multiply(y)
  return weights;

}

export function rateCollege(inputVector, features, results, collegeTraining){
  /*
  * Rates College by finding the weighs using least squares and scores the input
  * vector based of the scores
   */
  let collegeScores = [];
  collegeTraining.forEach((college, index) => {
    let collegeResult = results.map(result => {
      return result == index ? 1:0;
    })
    let collegeWeight = lstsq(features, collegeResult);
    let collegeScore = collegeWeight.dot(inputVector);
    collegeScores.push(collegeScore);
  });
  return collegeScores
}
