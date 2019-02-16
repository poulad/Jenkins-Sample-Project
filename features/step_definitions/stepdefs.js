const assert = require('assert');
const {
    Given,
    When,
    Then
} = require('cucumber');

function isItFriday(today) {
    if (today === "Friday") {
        return "TGIF";
    } else {
        return "Nope";
    }
}

Given('today is {string}', givenDay => {
    this.today = givenDay;
});

When('I ask whether it\'s Friday yet', () => {
    this.actualAnswer = isItFriday(this.today);
});

Then('I should be told {string}', expectedAnswer => {
    assert.equal(this.actualAnswer, expectedAnswer);
});