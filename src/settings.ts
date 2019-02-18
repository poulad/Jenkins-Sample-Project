import * as dotenv from 'dotenv';
import { JenkinsClientSettings } from './jenkins/jenkins-client-settings';

export interface Settings {
   jenkins: JenkinsClientSettings,
   logLevel?: string,
}

let appSettings: Settings

export function getAppSettings(): Settings {
   if (appSettings) {
      return appSettings
   } else {
      const configs = dotenv.config()
      if (!configs.error) {
         appSettings = {
            jenkins: {
               baseUrl: configs.parsed.JENKINS_URL,
               username: configs.parsed.JENKINS_USER,
               password: configs.parsed.JENKINS_PASS,
            },
            logLevel: configs.parsed.LOG_LEVEL
         }
         return appSettings
      } else {
         throw configs.error
      }
   }
}
