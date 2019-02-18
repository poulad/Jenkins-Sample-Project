import * as Jenkins from 'jenkins'
import * as url from 'url'
import { BuildLogs } from './build-logs'
import { JenkinsClientSettings } from './jenkins-client-settings'

export class JenkinsClient {
   private _apiClient: Jenkins.JenkinsPromisifiedAPI

   constructor(
      private _settings: JenkinsClientSettings
   ) {
      let baseUrl: string
      {
         let parsedUrl: url.Url
         try {
            parsedUrl = url.parse(this._settings.baseUrl, false, false)
         } catch (e) {
            throw new Error(e)
         }
         if (/^https?:$/.test(parsedUrl.protocol)) {
            const user = encodeURIComponent(this._settings.username)
            const pass = encodeURIComponent(this._settings.password)
            baseUrl = `${parsedUrl.protocol}//${user}:${pass}@${parsedUrl.host}${parsedUrl.path}`.replace(/\/+$/, '')
         } else {
            throw new Error(`Invalid protocol: ${parsedUrl.protocol}`)
         }
      }

      this._apiClient = Jenkins({
         baseUrl,
         crumbIssuer: true,
         promisify: true,
      })
   }

   /**
    * Gets Jenkins server information
    */
   getServerInfo(): Promise<any> {
      return this._apiClient.info()
   }

   /**
    * Triggers a build for the specified job.
    * This operation add an item to the queue and returns its number.
    * @param jobName Name of the job e.g. 'my-repo/master'
    * @returns item number in the queue
    */
   triggerBuild(jobName: string): Promise<number> {
      return this._apiClient.job.build(jobName)
         .then(response => {
            if (isNaN(parseInt(response))) {
               throw new Error(`Expected the queued build number but got ${response}.`)
            } else {
               return +response
            }
         })
   }

   getBuildLogs(jobName: string, buildNumber: number): Promise<BuildLogs> {
      return this._apiClient.build.log(jobName, buildNumber, { type: 'html' } as any)
         .then(response => new BuildLogs(response))
   }

   getBuildResult(jobName: string, buildNumber: number): Promise<any> {
      return this._apiClient.build.get(jobName, buildNumber)
   }

   getItemInQueue(itemNumber: number): Promise<any> {
      return this._apiClient.queue.item(itemNumber)
   }
}
