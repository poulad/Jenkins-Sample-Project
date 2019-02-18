import { JSDOM } from 'jsdom'

export class BuildLogs {
   get DomBody(): HTMLElement {
      return this._dom.window.document.body
   }

   get buildResult(): string {
      return this.DomBody.lastChild.textContent
   }

   private _dom: JSDOM

   constructor(htmlLog: string) {
      this._dom = new JSDOM(htmlLog)
   }
}
