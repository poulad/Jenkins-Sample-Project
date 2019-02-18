import * as Jenkins from 'jenkins'
import * as url from 'url'
import { Observable } from 'rxjs'
import { BuildLogs } from './build-logs';
import { JenkinsClientSettings } from './jenkins-client-settings';

export class JenkinsClient {
   private _apiClient: Jenkins.JenkinsAPI
   private _apiClient2: Jenkins.JenkinsPromisifiedAPI

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
      })

      this._apiClient2 = Jenkins({
         baseUrl,
         crumbIssuer: true,
         promisify: true,
      })
   }

   /**
    * Gets Jenkins server information
    */
   getServerInfo(): Promise<any> {
      return this._apiClient2.info()
   }

   /**
    * Triggers a build for the specified job.
    * This operation add an item to the queue and returns its number.
    * @param jobName Name of the job e.g. 'my-repo/master'
    * @returns item number in the queue
    */
   async triggerBuild(jobName: string): Promise<number> {
      return new Promise((resolve, reject) => {
         this._apiClient.job.build(jobName, (err, data) => {
            if (err) {
               reject(err)
            } else {
               const dataAsInt = parseInt(data)
               if (isNaN(dataAsInt)) {
                  reject(`Expected the queued build number but got ${data}.`)
               } else {
                  resolve(dataAsInt)
               }
            }
         })
      })
   }

   getBuildLogsStream(
      jobName: string,
      buildNumber: number,
      format: 'text' | 'html' = 'html',
      pollInterval: number = 1000
   ): Observable<string> {
      const log = this._apiClient.build.logStream(jobName, buildNumber, { type: format, delay: pollInterval } as any)
      return new Observable(subscriber => {
         log.on('data', data => { subscriber.next(data) })
         log.on('error', err => { subscriber.error(err) })
         log.on('end', () => { subscriber.complete() })
      })
   }

   async getBuildLogs(jobName: string, buildNumber: number): Promise<BuildLogs> {
      const htmlLog = await this.getBuildLogsStream(jobName, buildNumber).toPromise()
      return new BuildLogs(htmlLog)
   }

   async getBuildResult(jobName: string, buildNumber: number): Promise<any> {
      return new Promise((resolve, reject) => {
         this._apiClient.build.get(jobName, buildNumber, (err, data) => {
            if (err) {
               reject(err)
            } else {
               resolve(data)
            }
         })
      })
   }

   async getItemInQueue(itemNumber: number): Promise<any> {
      return new Promise((resolve, reject) => {
         this._apiClient.queue.item(itemNumber, (err, data) => {
            if (err) {
               reject(err)
            } else {
               resolve(data)
            }
         })
      })
   }
}
