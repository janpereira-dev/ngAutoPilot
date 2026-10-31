import fs from 'node:fs';
import { randomUUID } from 'node:crypto';
import { hash, manifest } from './manifest.mjs';

export default class RunReceipt {
  onBegin(config, suite) {
    fs.mkdirSync('observations', { recursive: true });
    this.run = { id: randomUUID(), startedAt: new Date().toISOString(), node: process.version,
      testCount: suite.allTests().length, passed: 0, failed: 0, skipped: 0, sources: manifest() };
  }
  onTestEnd(test, result) {
    if (result.status === 'passed') this.run.passed++;
    else if (result.status === 'skipped') this.run.skipped++;
    else this.run.failed++;
  }
  onEnd(result) {
    this.run.finishedAt = new Date().toISOString();
    this.run.sourceUnchanged = JSON.stringify(this.run.sources) === JSON.stringify(manifest());
    this.run.caseHashes = Object.fromEntries(fs.readdirSync('observations/cases').sort()
      .filter((file) => /^C\d{2}\.json$/.test(file))
      .map((file) => [file, hash(`observations/cases/${file}`)]));
    this.run.status = result.status;
    fs.writeFileSync('observations/run.json', JSON.stringify(this.run, null, 2) + '\n');
    if (!this.run.sourceUnchanged) throw new Error('Application or guides changed during the run');
  }
}
