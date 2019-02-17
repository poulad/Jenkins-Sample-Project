import * as Jenkins from 'jenkins'
import { Observable } from 'rxjs'

export class JenkinsClient {
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
            if (err)
               reject(err)
            else
               resolve(data)
         })
      })
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

   getBuildLogStream(jobName: string, buildNumber: number): Observable<string> {
      const log = this._apiClient.build.logStream(jobName, buildNumber, { type: 'html' } as any)
      return new Observable(subscriber => {
         log.on('data', data => { subscriber.next(data) })
         log.on('error', err => { subscriber.error(err) })
         log.on('end', () => { subscriber.complete() })
      })
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
