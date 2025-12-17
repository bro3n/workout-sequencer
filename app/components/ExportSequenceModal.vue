<template>
  <UModal v-model:open="isOpen" :title="modalTitle">
    <template #body>
      <div class="space-y-4">
        <p class="text-gray-700 dark:text-gray-300">
          {{ modalDescription }}
        </p>
        
        <!-- Message de succès -->
        <div v-if="successMessage" class="p-3 rounded-lg bg-green-50 border border-green-200 text-green-800 dark:bg-green-900 dark:border-green-700 dark:text-green-100">
          {{ successMessage }}
        </div>

        <!-- Message d'erreur -->
        <div v-if="errorMessage" class="p-3 rounded-lg bg-red-50 border border-red-200 text-red-800 dark:bg-red-900 dark:border-red-700 dark:text-red-100">
          {{ errorMessage }}
        </div>

        <div class="grid gap-3">
          <!-- Bouton télécharger JSON -->
          <UButton
            @click="downloadAsJson"
            block
            icon="i-heroicons-arrow-down-tray"
            color="primary"
          >
            {{ $t('sequences.exportAsJson') }}
          </UButton>

          <!-- Bouton copier URL -->
          <UButton
            @click="copyAsUrl"
            block
            :icon="urlCopied ? 'i-heroicons-check' : 'i-heroicons-link'"
            variant="outline"
            :color="urlCopied ? 'success' : 'primary'"
          >
            {{ urlCopied ? $t('sequences.urlCopied') : $t('sequences.exportAsUrl') }}
          </UButton>
        </div>
      </div>
    </template>
    <template #footer>
      <div class="flex justify-end">
        <UButton
          :label="$t('common.cancel')"
          color="neutral"
          variant="outline"
          @click="close"
        />
      </div>
    </template>
  </UModal>
</template>

<script setup lang="ts">
import type { WorkoutSequence } from '~/types/workout'

// Props
const props = defineProps<{
  sequence: WorkoutSequence | null
  sequences?: WorkoutSequence[]
  open: boolean
}>()

// Emits
const emit = defineEmits<{
  'update:open': [value: boolean]
}>()

// Computed pour gérer l'ouverture de la modal
const isOpen = computed({
  get: () => props.open,
  set: (value: boolean) => emit('update:open', value)
})

// Composables
const { t } = useI18n()

// État local
const successMessage = ref('')
const errorMessage = ref('')
const urlCopied = ref(false)

// Computed pour le titre et la description de la modal
const isMultipleExport = computed(() => !!props.sequences && props.sequences.length > 0)
const modalTitle = computed(() =>
  isMultipleExport.value
    ? t('sequences.exportAllModalTitle')
    : t('sequences.exportModalTitle')
)
const modalDescription = computed(() =>
  isMultipleExport.value
    ? t('sequences.exportAllModalDescription', { count: props.sequences?.length || 0 })
    : t('sequences.exportModalDescription')
)

// Fonction pour préparer les données d'export (sans IDs et dates)
const prepareExportData = (sequence: WorkoutSequence) => {
  const { id, createdAt, updatedAt, exercises, ...sequenceData } = sequence
  const exportedExercises = exercises.map(({ id: _, ...exercise }) => exercise)
  return {
    ...sequenceData,
    exercises: exportedExercises
  }
}

// Fonction pour télécharger la séquence en JSON
const downloadAsJson = () => {
  try {
    let exportData
    let filename
    
    if (isMultipleExport.value && props.sequences) {
      // Export multiple - tableau de séquences
      exportData = props.sequences.map(prepareExportData)
      filename = 'workout-sequences.json'
    } else if (props.sequence) {
      // Export simple - une seule séquence
      exportData = prepareExportData(props.sequence)
      filename = `workout-${props.sequence.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.json`
    } else {
      errorMessage.value = t('sequences.exportError')
      return
    }

    // Convertir en JSON
    const jsonString = JSON.stringify(exportData, null, 2)
    
    // Créer un blob et télécharger
    const blob = new Blob([jsonString], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)

    // Réinitialiser les messages
    errorMessage.value = ''
    successMessage.value = ''
    
    // Fermer la modal après un court délai
    setTimeout(() => {
      close()
    }, 500)
  } catch (error) {
    console.error('Erreur lors de l\'export JSON:', error)
    errorMessage.value = t('sequences.exportError')
    successMessage.value = ''
  }
}

// Fonction pour copier l'URL avec la séquence en base64
const copyAsUrl = async () => {
  try {
    let exportData
    
    if (isMultipleExport.value && props.sequences) {
      // Export multiple - tableau de séquences
      exportData = props.sequences.map(prepareExportData)
    } else if (props.sequence) {
      // Export simple - une seule séquence
      exportData = prepareExportData(props.sequence)
    } else {
      errorMessage.value = t('sequences.exportError')
      return
    }

    // Convertir en JSON puis en base64 (méthode moderne avec TextEncoder)
    const jsonString = JSON.stringify(exportData)
    const encoder = new TextEncoder()
    const uint8Array = encoder.encode(jsonString)
    const base64 = btoa(String.fromCharCode(...uint8Array))

    // Construire l'URL
    const currentUrl = window.location.origin
    const url = `${currentUrl}?import-sequence=${base64}`

    // Copier dans le presse-papiers
    await navigator.clipboard.writeText(url)

    // Afficher l'indication visuelle sur le bouton
    urlCopied.value = true
    errorMessage.value = ''

    // Réinitialiser après 2 secondes
    setTimeout(() => {
      urlCopied.value = false
    }, 2000)
  } catch (error) {
    console.error('Erreur lors de la copie de l\'URL:', error)
    errorMessage.value = t('sequences.exportError')
    successMessage.value = ''
  }
}

// Fonction pour fermer la modal
const close = () => {
  successMessage.value = ''
  errorMessage.value = ''
  urlCopied.value = false
  isOpen.value = false
}

// Réinitialiser les messages quand la modal s'ouvre
watch(() => props.open, (newValue) => {
  if (newValue) {
    successMessage.value = ''
    errorMessage.value = ''
    urlCopied.value = false
  }
})

// Nom du composant
defineOptions({
  name: 'ExportSequenceModal'
})
</script>