import { setDefaultTimeout } from 'cucumber'

setDefaultTimeout(-1)

export async function sleep(seconds: number) {
   return new Promise((resolve, _) => {
      setTimeout(() => { resolve() }, seconds * 1000)
   })
}
