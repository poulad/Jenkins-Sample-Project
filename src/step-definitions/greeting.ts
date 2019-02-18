import { Given, When, Then, Before, After } from 'cucumber'
import { Logger } from 'winston'
import { ulid } from 'ulid'
import { expect } from 'chai'
import { PipelineLogParser } from '../jenkins/pipeline-log-parser'
import { getAppSettings } from '../settings'
import { BuildLogs } from '../jenkins/build-logs'
import { JenkinsClient } from '../jenkins/jenkins-client'
import { sleep, createLogger } from '.'

interface ScenarioState {
   jenkinsClient: JenkinsClient,
   logger: Logger,
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
      logs?: BuildLogs
   },
   greeting: {
      language: string,
   }
}

Before(() => {
   const state = <ScenarioState>this
   const logger = createLogger({ scenarioLogId: ulid() })

   logger.debug(`Test Scenario execution is started.`)

   state.logger = logger
   state.jenkinsClient = new JenkinsClient(getAppSettings().jenkins)
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

   const queueItemNumber = await state.jenkinsClient.triggerBuild(jobNameEncoded)

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

   let queuedItem = null
   do {
      await sleep(2)
      queuedItem = await state.jenkinsClient.getItemInQueue(state.job.queueItemNumber)
   } while (!queuedItem.executable)
   const buildNumber: number = queuedItem.executable.number
   state.logger.info(
      `Build {number} is started.`,
      { data: { number: buildNumber } }
   )

   let buildResult
   do {
      buildResult = await state.jenkinsClient.getBuildResult(state.job.encodedName, buildNumber)
      await sleep(2)
   } while (!buildResult.result)

   const buildLogs = await state.jenkinsClient.getBuildLogs(state.job.encodedName, buildNumber)

   state.job.buildNumber = buildNumber
   state.job.status = buildResult.result
   state.job.logs = buildLogs
});

Then('the job output should contain the greeting {string}', async (expectedMessage: string) => {
   const state = <ScenarioState>this

   expect(state.job.logs.DomBody.innerHTML).to.contain(expectedMessage)

   const echoStepElement = PipelineLogParser.findEchoStep(state.job.logs, expectedMessage)
   expect(echoStepElement).to.exist
   expect(echoStepElement.textContent).to.contain(expectedMessage)
});

Then('the job finished with {string} status', (expectedStatus: string) => {
   const state = <ScenarioState>this

   expect(state.job.status).to.equal(expectedStatus)
});

After(() => {
   const state = <ScenarioState>this
   state.logger.debug(`Test scenario execution is finished.`)
})
