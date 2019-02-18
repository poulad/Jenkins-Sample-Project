import { setDefaultTimeout, BeforeAll } from 'cucumber'
import * as winston from 'winston'
import { getAppSettings } from '../settings'
import { JenkinsClient } from '../jenkins/jenkins-client'

setDefaultTimeout(-1)

BeforeAll(async () => {
   const logger = createLogger()

   const appSettings = getAppSettings()
   {
      const appSettingsToLog = JSON.parse(JSON.stringify(appSettings))
      if (appSettingsToLog.jenkins.password) {
         appSettingsToLog.jenkins.password = ''
      }
      logger.debug(`App settings are {settings}.`, { data: { settings: appSettingsToLog } })
   }

   const jenkinsClient = new JenkinsClient(appSettings.jenkins)
   try {
      await jenkinsClient.getServerInfo()
   } catch (e) {
      logger.error(`Failed to connect to the Jenkins server.`, { data: { error: e } })
      throw new Error(e)
      process.exit(1) // ToDo process won't exit with a good exit code
   }
   logger.debug('Connection to the Jenkins server was successful.')
})

export async function sleep(seconds: number) {
   return new Promise((resolve, _) => {
      setTimeout(() => { resolve() }, seconds * 1000)
   })
}

export function createLogger(defaultMeta?: any): winston.Logger {
   const appSettings = getAppSettings()

   defaultMeta = defaultMeta || {}
   if (
      process.env.CUCUMBER_PARALLEL === 'true' &&
      !isNaN(parseInt(process.env.CUCUMBER_SLAVE_ID))
   ) {
      defaultMeta.slaveProcessId = +process.env.CUCUMBER_SLAVE_ID
   }

   return winston.createLogger({
      defaultMeta,
      level: appSettings.logLevel || 'info',
      transports: [
         new winston.transports.Console({ format: winston.format.json() })
      ]
   })
}
