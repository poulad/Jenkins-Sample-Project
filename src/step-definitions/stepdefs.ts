import { Given, When, Then, setDefaultTimeout } from 'cucumber'
import { expect } from 'chai'

function isItFriday(today) {
   if (today === "Friday") {
      return "TGIF";
   } else {
      return "Nope";
   }
}

Given('today is {string}', async (givenDay: string) => {
   this.today = givenDay
})

When('I ask whether it\'s Friday yet', () => {
   this.actualAnswer = isItFriday(this.today);
});

Then('I should be told {string}', expectedAnswer => {
   expect(this.actualAnswer).to.eq(expectedAnswer)
});
