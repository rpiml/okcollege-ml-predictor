// @flow

import Sylvester from 'sylvester';
import stringify from 'csv-stringify';
import { preprocessor, algorithms, parseCSV } from './util/'

/**
 * Uses an survey input to produce a ranking of colleges.
 */

export async function getCollegeRankings(input: string){

  let collegeTraining = await preprocessor.getTrainingData('learning:college_training.csv');
  let studentTraining = await preprocessor.getTrainingData('learning:survey_training.csv');


  input = await parseCSV(input);
  input.splice(0, 1)

  // Format the input vector into a sylvester vector
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
  let collegeScores = algorithms.rateCollege(inputVector, features, results, collegeTraining);

  // Normilize the College Scores
  collegeScores = preprocessor.normilze(collegeScores);

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
