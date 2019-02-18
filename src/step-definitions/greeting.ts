import { Given, When, Then, Before } from 'cucumber'
import winston = require('winston');
import { ulid } from 'ulid';
import { expect } from 'chai'
import { JenkinsClient } from '../jenkins-client';
import { sleep } from './timeout';
import { PipelineLogParser } from '../jenkins-client/pipeline-log-parser';

interface ScenarioState {
   logger: winston.Logger,
   github: {
      owner: string,
      repo: string,
      branch: string,
   },
   job: {
      encodedName: string,
      queueItemNumber?: number,
      buildNumber?: number,
      status?: string,
   },
   greeting: {
      language: string,
   }
}

Before(() => {
   const state = <ScenarioState>this

   state.logger = winston.createLogger({
      defaultMeta: { scenarioLogId: ulid() },
      level: 'debug',
      transports: [
         new winston.transports.Console({ format: winston.format.json() })
      ]
   })
})

Given('the branch on GitHub is {string}', async (branchRef: string) => {
   const state = <ScenarioState>this

   const match = branchRef.match(/^(.*)\/(.*):(.*)$/)
   const owner = match[1]
   const repo = match[2]
   const branch = match[3]
   const jobNameEncoded = `${encodeURIComponent(repo)}/${encodeURIComponent(branch)}`

   state.logger.debug(
      `Building the branch {owner}/{repo}:{branch}.`,
      { data: { owner, repo, branch } }
   )

   const jenkins = new JenkinsClient()
   const queueItemNumber = await jenkins.triggerBuild(jobNameEncoded)

   state.logger.info(
      `Triggered the build and the queue item is {item}.`,
      { data: { item: queueItemNumber } }
   )

   state.github = { owner, repo, branch }
   state.job = {
      encodedName: jobNameEncoded,
      queueItemNumber
   }
});

Given('the language for greeting is {string}', (language: string) => {
   const state = <ScenarioState>this
   state.greeting = { language }
});

When('the Jenkins job is finished', async () => {
   const state = <ScenarioState>this

   const jenkins = new JenkinsClient()

   let queuedItem = null
   do {
      await sleep(2)
      queuedItem = await jenkins.getItemInQueue(state.job.queueItemNumber)
   } while (!queuedItem.executable)
   const buildNumber: number = queuedItem.executable.number
   state.logger.info(
      `Build {number} is started.`,
      { data: { number: buildNumber } }
   )

   let buildResult
   do {
      buildResult = await jenkins.getBuildResult(state.job.encodedName, buildNumber)
      await sleep(2)
   } while (!buildResult.result)

   state.job.buildNumber = buildNumber
   state.job.status = buildResult.result
});

Then('the job output should contain the greeting {string}', async (expectedMessage: string) => {
   const state = <ScenarioState>this

   const jenkins = new JenkinsClient()

   const logs = await jenkins.getBuildLogs(state.job.encodedName, state.job.buildNumber)
   const echoStepElement = PipelineLogParser.findEchoStep(logs, expectedMessage)

   expect(echoStepElement.textContent).to.contain(expectedMessage)
});

Then('the job finished with {string} status', (expectedStatus: string) => {
   const state = <ScenarioState>this

   expect(state.job.status).to.equal(expectedStatus)
});
