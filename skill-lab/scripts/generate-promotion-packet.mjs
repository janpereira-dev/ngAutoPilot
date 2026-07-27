#!/usr/bin/env node
import path from 'node:path';

import { generatePromotionPacket } from '../lib/promotion-packet.mjs';
import { assertInsideLab } from '../lib/sandbox.mjs';

const args = parseArgs(process.argv.slice(2));
const runRoot = assertInsideLab(path.resolve('skill-lab'), path.resolve('skill-lab', 'runs', args.run ?? 'manual-evaluation'));
const promotionRoot = generatePromotionPacket({ runRoot });
console.log(promotionRoot);

function parseArgs(argv) {
  const result = {};
  for (let index = 0; index < argv.length; index += 1) {
    if (argv[index].startsWith('--')) result[argv[index].slice(2)] = argv[index + 1];
  }
  return result;
}
