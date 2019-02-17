Feature: Greeting
   Job in the Jenkinsfile greets people in 2 languages

   Scenario Outline: Jenkinsfile prints out a greeting message in Spanish or English by default.
      Given the branch on GitHub is "<branch_ref>"
      And the language for greeting is "<language>"
      When the Jenkins job is finished
      Then the job output should contain the greeting "<message>"
      And the job finished with "<status>" status

      Examples:
         | branch_ref                                            | language | message     | status  |
         | poulad/Jenkins-Sample-Project:specs/pass/greeting-eng | English  | Hello World | SUCCESS |
         | poulad/Jenkins-Sample-Project:specs/pass/greeting-spa | Spanish  | Hola Mundo  | SUCCESS |
         | poulad/Jenkins-Sample-Project:specs/pass/greeting-fre | French   | Hello World | SUCCESS |
         | poulad/Jenkins-Sample-Project:specs/pass/greeting---- |          | Hello World | SUCCESS |
