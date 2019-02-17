import * as Jenkins from 'jenkins'
import { Observable, fromEventPattern } from 'rxjs'

class JenkinsClient {
   private _apiClient: Jenkins.JenkinsAPI

   constructor() {
      this._apiClient = Jenkins({ baseUrl: 'http://admin:password@localhost:8080', crumbIssuer: true })
   }

   /**
    * Gets Jenkins server information
    */
   async getServerInfo(): Promise<any> {
      return new Promise((resolve, reject) => {
         this._apiClient.info((err, data) => {
            if (err) reject(err)
            resolve(data)
         })
      })
   }

   getBuildLog(
      jobName: string,
      buildNumber: number
   ): Observable<string> {
      const log = this._apiClient.build.logStream(jobName, buildNumber, { type: 'html' } as any)
      const eventNames = ['data', 'error', 'end']
      return fromEventPattern<string>(
         handler => eventNames.forEach(evType => { log.on(evType, handler) }),
         handler => eventNames.forEach(evType => { log.off(evType, handler) })
      )
   }
}

/**
 * The singleton instance of the Jenkins client
 */
export const jenkinsClient = new JenkinsClient()
