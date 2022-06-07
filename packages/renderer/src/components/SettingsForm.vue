<script lang="ts" setup>
  import { reactive } from 'vue'
  import { useMessage } from 'naive-ui'
  import { ipcRenderer } from 'electron'
  import { useSettings } from '../composition'
  import { openChooseDirectoryDialog } from '../helpers'

  const message = useMessage()

  let {
    settings,
    initialValue,
    isLoading,
    updateSettings
  } = useSettings()

  const settingsForm = reactive(initialValue)

  ipcRenderer.on('updateSettings', (event, payload) => {
    settingsForm.exportDirectory = payload.exportDirectory
  })

  function save() {
    updateSettings(settingsForm)
        .then(() => {
          message.success('Настройки обновлены')

          ipcRenderer.send('syncWithTelegram', {
            exportDirectory: settings.value.exportDirectory,
            exportInterval: settings.value.exportInterval,
            telegramBotToken: settings.value.telegramBotToken,
            telegramBroadcastIds: settings.value.telegramBroadcastIds
          })
        })
        .catch(() => {
          message.error('Не удалось сохранить настройки')
        })
  }

  // Sync with storage values
  settingsForm.telegramBotToken = settings.value.telegramBotToken
  settingsForm.telegramBroadcastIds = settings.value.telegramBroadcastIds
  settingsForm.exportDirectory = settings.value.exportDirectory
  settingsForm.exportInterval = settings.value.exportInterval

</script>

<template>
  <n-form :disabled="isLoading">
    <n-form-item label="Введите токен Telegram бота">
      <n-input
          v-model:value="settingsForm.telegramBotToken"
          placeholder="Введите токен"
          :clearable="true"
      />
    </n-form-item>

    <n-form-item label="Введите токен Telegram бота">
      <n-input
          v-model:value="settingsForm.telegramBroadcastIds"
          placeholder="Введите чат айди"
          :clearable="true"
      />
    </n-form-item>

    <n-form-item label="Введите интервал в минутах">
      <n-input-number
          v-model:value="settingsForm.exportInterval"
          placeholder="Укажите интервал"
          :clearable="true"
      />
    </n-form-item>

    <n-form-item label="Укажите директорию">
      <n-input
          v-model:value="settingsForm.exportDirectory"
          :readonly="true"
          placeholder="Директория не выбрана"
      />

      <n-button @click="openChooseDirectoryDialog">Обзор</n-button>
    </n-form-item>

    <n-button
        @click="save"
        type="primary"
        :block="true"
        :disabled="isLoading"
        :loading="isLoading"
    >
      Сохранить
    </n-button>
  </n-form>
</template>