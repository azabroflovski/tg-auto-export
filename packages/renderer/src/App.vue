<script setup lang="ts">
  import SettingsForm from './components/SettingsForm.vue'
  import LogHistory from './components/LogHistory.vue'
  import { darkTheme } from 'naive-ui'
  import { ipcRenderer } from 'electron'
  import { useSettings } from './composition'
  import { database } from './utils/dexie'

  const { settings } = useSettings()

  ipcRenderer.send('syncWithTelegram', {
    exportDirectory: settings.value.exportDirectory,
    exportInterval: settings.value.exportInterval,
    telegramBotToken: settings.value.telegramBotToken,
    telegramBroadcastIds: settings.value.telegramBroadcastIds
  })

  ipcRenderer.on('fileSend', (event, payload) => {
    // @ts-ignore
    database.history.add({ ...payload })
  })
</script>

<template>
  <n-config-provider :theme="darkTheme">
    <n-message-provider>
      <n-layout
        :embedded="true"
        :native-scrollbar="false"
        position="absolute"
        content-style="padding: 24px;"
      >
        <n-card>
          <n-tabs type="line" :animated="true" size="large">
            <n-tab-pane name="history" tab="История">
              <log-history />
            </n-tab-pane>

            <n-tab-pane name="settings" tab="Настройки">
              <settings-form />
            </n-tab-pane>
          </n-tabs>
        </n-card>
      </n-layout>
    </n-message-provider>
  </n-config-provider>
</template>

<style>

</style>
