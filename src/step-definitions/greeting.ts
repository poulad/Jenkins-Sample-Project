import { Given, When, Then, setDefaultTimeout } from 'cucumber'
import { expect } from 'chai'

setDefaultTimeout(-1)

Given('the branch on GitHub is {string}', (branchRef: string) => {
   // Write code here that turns the phrase above into concrete actions
   return 'pending';
});

Given('the language for greeting is {string}', (language: string) => {
   // Write code here that turns the phrase above into concrete actions
   return 'pending';
});

When('the Jenkins job is finished', () => {
   // Write code here that turns the phrase above into concrete actions
   return 'pending';
});

Then('the job output should contain the greeting {string}', (actualMessage: string) => {
   // Write code here that turns the phrase above into concrete actions
   return 'pending';
});

Then('the job finished with {string} status', (actualStatus: string) => {
   // Write code here that turns the phrase above into concrete actions
   return 'pending';
});
