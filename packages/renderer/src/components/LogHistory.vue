<script lang="ts" setup>
  import { ref } from 'vue'
  import { formatRelative } from 'date-fns'
  import { ru } from 'date-fns/locale'
  import { database } from '../utils/dexie'

  const historyList = ref<historyItem[]>([])

  interface historyItem {
    id: number
    fileName: string
    filePath: string
    sendTime: number
    isError: boolean
  }

  // @ts-ignore
  database.history.toArray()
      .then((elements: historyItem[]) => {
        historyList.value = elements
      })
</script>

<template>
  <div style="font-size: 16px; margin-bottom: 20px; margin-top: 10px;">Журнал загрузок</div>

  <n-timeline v-if="historyList.length">
    <n-timeline-item
        v-for="item in historyList"
        :key="item.id"
        :title="item.fileName"
        :content="item.filePath"
        :time="formatRelative(item.sendTime, Date.now(), { locale: ru })"
        :type="item.isError ? 'error' : 'success'"
    />
  </n-timeline>

  <n-empty v-else description="Нет данных" />
</template>