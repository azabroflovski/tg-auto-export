import { ref } from 'vue'
import { useStorage } from '@vueuse/core'
import { sleep } from '../helpers'

export function useSettings() {
   const initialValue = {
      telegramBotToken: '',
      telegramBroadcastIds: '',
      exportInterval: 5,
      exportDirectory: ''
   }

   const isLoading = ref(false)

   const settings = useStorage('settings', initialValue)

   async function updateSettings(obj: any) {
      isLoading.value = true

      await sleep(1200)

      for (const key in obj) {
         // @ts-ignore
         settings['value'][key] = obj[key]
      }

      isLoading.value = false
   }

   return {
      settings,
      initialValue,
      isLoading,
      updateSettings
   }
}