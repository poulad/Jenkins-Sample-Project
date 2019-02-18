import { BuildLogs } from "./build-logs"

export module PipelineLogParser {
   export function findEchoStep(logs: BuildLogs, message: string): Element {
      const spans = logs.DomBody.querySelectorAll(`span[nodeId][enclosingId].pipeline-new-node + span`)

      let matchingSpan: Element
      for (let s of Array.from(spans)) {
         if (s.textContent.includes(message)) {
            matchingSpan = s
            break;
         }
      }

      if (
         matchingSpan &&
         matchingSpan.previousElementSibling &&
         matchingSpan.previousElementSibling.textContent.startsWith('[Pipeline] echo')
      ) {
         return matchingSpan
      }
   }
}
