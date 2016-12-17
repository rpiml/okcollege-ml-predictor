// @flow

import { redis } from 'okc-js';
import { parseCSV } from './csv'

export async function getTrainingData(redisKey: string): Promise<number[]>{

  let trainingData = await redis.get(redisKey);
  trainingData = await parseCSV(trainingData);

  // Remove the first row of headers
  trainingData.splice(0, 1);
  return trainingData;
}

export function normilze(values: number[]){
  const maxVal = Math.max(...values),
      minVal = Math.min(...values);
  const valueRange = maxVal - minVal
  return  values.map(val => (val+Math.abs(minVal))/valueRange)
}
