import { Given, When, Then, setDefaultTimeout } from 'cucumber'
import { expect } from 'chai'

Given('the branch on GitHub is {string}', (branchRef: string) => {
   const match = branchRef.match(/^(.*)\/(.*):(.*)$/)
   this.github = {
      owner: match[1],
      repo: match[2],
      branch: match[3]
   }
});

Given('the language for greeting is {string}', (language: string) => {
   this.greeting = { language }
   this.greeting.message = language === 'Spanish' ? "Hola Mundo" : "Hello World"
});

When('the Jenkins job is finished', () => {
   this.job = { status: 'success' }
});

Then('the job output should contain the greeting {string}', (actualMessage: string) => {
   expect(actualMessage).to.equal(this.greeting.message)
});

Then('the job finished with {string} status', (actualStatus: string) => {
   expect(actualStatus).to.equal(this.job.status)
});
