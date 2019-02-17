import { Given, When, Then } from 'cucumber'
import { expect } from 'chai'
import { JenkinsClient } from '../jenkins-client';
import { sleep } from './timeout';

Given('the branch on GitHub is {string}', async (branchRef: string) => {
   const match = branchRef.match(/^(.*)\/(.*):(.*)$/)
   const owner = match[1]
   const repo = match[2]
   const branch = match[3]
   const jobNameEncoded = `${encodeURIComponent(repo)}/${encodeURIComponent(branch)}`

   const jenkins = new JenkinsClient()
   const queueItemNumber = await jenkins.triggerBuild(jobNameEncoded)

   this.github = { owner, repo, branch }
   this.job = {
      encodedName: jobNameEncoded,
      queueItemNumber
   }
});

Given('the language for greeting is {string}', (language: string) => {
   this.greeting = { language }
});

When('the Jenkins job is finished', async () => {
   const jenkins = new JenkinsClient()

   let queuedItem = null
   do {
      await sleep(2)
      queuedItem = await jenkins.getItemInQueue(this.job.queueItemNumber)
   } while (!queuedItem.executable)
   const buildNumber: number = queuedItem.executable.number

   let buildResult
   do {
      buildResult = await jenkins.getBuildResult(this.job.encodedName, buildNumber)
      await sleep(2)
   } while (!buildResult.result)

   this.job.buildNumber = buildNumber
   this.job.status = buildResult.result
});

Then('the job output should contain the greeting {string}', async (expectedMessage: string) => {
   let logs = ``

   const jenkins = new JenkinsClient()
   const subscription = jenkins.getBuildLogStream(this.job.encodedName, this.job.buildNumber)
      .subscribe(
         data => {
            if (data.includes(expectedMessage)) {
               logs = data
               subscription.unsubscribe()
            } else {
               logs += data
            }
         },
         err => {
            throw new Error(err)
         }
      )

   do { await sleep(.5) } while (!subscription.closed)

   expect(logs).to.contain(expectedMessage)
});

Then('the job finished with {string} status', (expectedStatus: string) => {
   expect(this.job.status).to.equal(expectedStatus)
});
