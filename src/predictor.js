
import Sylvester from 'sylvester';
import { redis } from 'okc-js';
import stringify from 'csv-stringify';
import csv from 'csv';

/*
* Least Squares
*/
export function lstsq(data, results){
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

function parseCSV(csvData){
  return new Promise((resolve, reject) => {
    csv.parse(csvData, (err, result) => {
      if (err) return reject(err);
      resolve(result);
    });
  });
}

async function getTrainingData(redisKey){

  let trainingData = await redis.get(redisKey);
  trainingData = await parseCSV(trainingData);

  // Remove the first row of headers
  trainingData.splice(0, 1);
  return trainingData;
}

function normilzeScores(scores){
  let maxScore = Math.max(...scores),
      minScore = Math.min(...scores);
  let scoreRange = maxScore - minScore
  return  scores.map(score => (score+Math.abs(minScore))/scoreRange)
}

// Rates College
function rateCollege(inputVector, features, results, collegeTraining){
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

/*
* Ranking
*/
export async function getCollegeRankings(input){


  let collegeTraining = await getTrainingData('learning:college_training.csv');
  let studentTraining = await getTrainingData('learning:survey_training.csv');


  input = await parseCSV(input);
  input.splice(0, 1)


  // Format the input vector into
  let inputVector = (input[0])
  inputVector.shift()
  inputVector = inputVector.map(num => parseInt(num, 10))
  inputVector.unshift(1)
  inputVector = $V(inputVector)


  // Convert the data matrix into a set of features
  let results = [];
  let features = studentTraining.map(row => {
    results.push(parseInt(row.pop(), 10));
    return row.slice(1).map(num=>parseInt(num, 10));
  });

  // Rate Each College
  let collegeScores = rateCollege(inputVector, features, results, collegeTraining);

  // Normilize the College Scores
  collegeScores = normilzeScores(collegeScores);

  // Sort Colleges scored by indices
  let len = collegeScores.length;
  let indices = new Array(len);
  for (let i = 0; i < len; ++i) indices[i] = i;
  indices.sort(function (a, b) { return collegeScores[a] > collegeScores[b] ? -1 : collegeScores[a] < collegeScores[b] ? 1 : 0; });

  // Map sorted indices to an arry of the index and score
  let collegeRanking = indices.map(index => [index, collegeScores[index]])
  collegeRanking.unshift(['college', 'score'])

  return await new Promise((resolve, reject) => {
    stringify(collegeRanking, (err, result) => {
      if (err) return reject(err);
      resolve(result);
    });
  });
}
