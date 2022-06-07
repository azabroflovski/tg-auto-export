import { Bot } from 'grammy'

export function useBot(token = null) {
   // Create an instance of the `Bot` class and pass your authentication token to it.
   const bot = new Bot(token) // <-- put your authentication token between the ""

   return {
      bot,
   }
}