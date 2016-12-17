#!/usr/bin/env node

import 'babel-polyfill';
import 'babel-core/register'
import { rmq } from 'okc-js';
import { getCollegeRankings } from './predictor';

const queue = 'predictor_queue';

rmq.rpcReply(queue, getCollegeRankings)
