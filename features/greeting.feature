Feature: Greeting
   Job in the Jenkinsfile greets people in different languages

   Scenario Outline: Jenkinsfile on the branch prints out a greeting message in the specified languages.
      Given the branch on GitHub is "<branch_ref>"
      And the language for greeting is "<language>"
      When the Jenkins job is finished
      Then the job output should contain the greeting "<message>"
      And the job finished with "<status>" status

      Examples:
         | branch_ref                                   | language | message     | status  |
         | poulad/Jenkins-Sample-Project:specs/pass/foo | English  | Hello World | success |
         | poulad/Jenkins-Sample-Project:specs/pass/bar | Spanish  | Hola Mundo  | success |
