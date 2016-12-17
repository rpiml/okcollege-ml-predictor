
import Sylvester from 'sylvester';

/*
* Least Squares
* Input Parameters:
*
*/
const lstsq = (data, results) => {
  let X = $M(data);
  // console.log('data', data)
  let y = $V(results);
  let ones = [];
  for(let i = 0; i < X.rows(); i++) {
      ones.push([1]);
  }
  ones = $M(ones)
  // console.log('Creating Matrix', ones)

  X = ones.augment(X);
  // console.log(((X.transpose()).multiply(X)))
  // console.log(((X.transpose()).multiply(X)).inverse())
  let pinv = (((X.transpose()).multiply(X)).inverse()).multiply(X.transpose())

  let weights = pinv.multiply(y)
  // console.log('weights', weights)
  return weights;

}

/*
* Ranking
*
*/
export function raking(input, data, colleges){
  let results = [];

  // Format the input vector into
  let inputVector = input.slice(1, -1).map(num => parseInt(num, 10))
  inputVector.unshift(1)
  inputVector = $V(inputVector)


  // Convert the data matrix into a set of features
  let features = data.map(row => {
    results.push(parseInt(row.pop(), 10));
    return row.slice(1).map(num=>parseInt(num, 10));
  });


  let collegeScores = [];

  // Rate Each College
  colleges.forEach((college, index) => {
    let collegeResult = results.map(result => {
      return result == index ? 1:0;
    })
    let collegeWeight = lstsq(features, collegeResult);
    // console.log('collegeWeight', collegeWeight);
    let collegeScore = collegeWeight.dot(inputVector);
    // console.log('collegeScore', collegeScore);
    collegeScores.push(collegeScore);
  });

  console.log('collegeScores', collegeScores);

  // Sort Colleges scored by indices
  let len = collegeScores.length;
  let indices = new Array(len);
  for (let i = 0; i < len; ++i) indices[i] = i;
  indices.sort(function (a, b) { return collegeScores[a] < collegeScores[b] ? -1 : collegeScores[a] > collegeScores[b] ? 1 : 0; });
  console.log(indices);

  // Map sorted indices to college names
  colleges = indices.map(index => colleges[index][0])
  return colleges

}

// let data = [["user1","0","1","1"],
// ["user2","1","1","2"],
// ["user3","1","0","0"],
// ["user4","0","0","3"]];
//
// let colleges = [[ 'fine-arts-school',1,0,1,4],
// [ 'computer-school',0,1,4,1],
// [ 'digital-arts-school',1,1,2,2],
// [ 'culinary-college',0,0,3,3 ]];
//
// raking(data[1], data, colleges)


export { lstsq, raking }
