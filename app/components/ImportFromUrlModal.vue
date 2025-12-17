<script setup lang="ts">
import type { WorkoutSequence } from '~/types/workout'

const props = defineProps<{
  base64Data: string
  open: boolean
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
  imported: [count: number]
  close: []
}>()

const { t } = useI18n()
const toast = useToast()
const { saveSequence, getSequences } = useWorkoutStorage()

const isOpen = computed({
  get: () => props.open,
  set: (value: boolean) => emit('update:open', value)
})

const sequenceNames = ref<string[]>([])
const isLoading = ref(false)
const parseError = ref(false)

// Computed pour le titre de la modal
const modalTitle = computed(() => t('sequences.importFromUrlTitle'))

// Décoder et extraire les noms des séquences
const parseSequenceData = () => {
  try {
    // Décodage compatible UTF-8 (méthode moderne avec TextDecoder)
    const binaryString = atob(props.base64Data)
    const uint8Array = Uint8Array.from(binaryString, char => char.charCodeAt(0))
    const decoder = new TextDecoder()
    const decodedData = decoder.decode(uint8Array)
    const parsedData = JSON.parse(decodedData)
    
    if (Array.isArray(parsedData)) {
      sequenceNames.value = parsedData.map(seq => seq.name || 'Sans nom')
    } else if (parsedData && typeof parsedData === 'object') {
      sequenceNames.value = [parsedData.name || 'Sans nom']
    } else {
      parseError.value = true
    }
  } catch (error) {
    console.error('Erreur lors du décodage des données:', error)
    parseError.value = true
  }
}

// Fonction pour générer un nom unique si nécessaire
const generateUniqueName = (baseName: string): string => {
  const existingSequences = getSequences()
  const existingNames = existingSequences.map(seq => seq.name.toLowerCase())
  
  let uniqueName = baseName
  let counter = 1
  
  while (existingNames.includes(uniqueName.toLowerCase())) {
    const date = new Date()
    const dateStr = `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`
    uniqueName = `${baseName} - ${dateStr}`
    
    if (existingNames.includes(uniqueName.toLowerCase())) {
      uniqueName = `${baseName} - ${dateStr} (${counter})`
      counter++
    }
  }
  
  return uniqueName
}

// Fonction pour créer une séquence depuis les données
const createSequenceFromData = (data: Partial<WorkoutSequence>): WorkoutSequence | null => {
  try {
    const uniqueName = generateUniqueName(data.name || 'Sans nom')
    
    return {
      id: crypto.randomUUID(),
      name: uniqueName,
      type: data.type || 'workout',
      exercises: data.exercises?.map((ex) => ({
        id: crypto.randomUUID(),
        name: ex.name || '',
        type: ex.type || 'duration',
        duration: ex.duration || 0,
        repetitions: ex.repetitions || 1
      })) || [],
      breakDuration: data.breakDuration,
      cycleRepetitions: data.cycleRepetitions,
      cycleBreakDuration: data.cycleBreakDuration,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  } catch (error) {
    console.error('Erreur lors de la création de la séquence:', error)
    return null
  }
}

// Fonction d'import
const handleImport = async () => {
  isLoading.value = true
  
  try {
    // Décodage compatible UTF-8 (méthode moderne avec TextDecoder)
    const binaryString = atob(props.base64Data)
    const uint8Array = Uint8Array.from(binaryString, char => char.charCodeAt(0))
    const decoder = new TextDecoder()
    const decodedData = decoder.decode(uint8Array)
    const parsedData = JSON.parse(decodedData)
    
    let importedCount = 0
    
    if (Array.isArray(parsedData)) {
      // Import multiple
      for (const seqData of parsedData) {
        const newSequence = createSequenceFromData(seqData)
        if (newSequence) {
          saveSequence(newSequence)
          importedCount++
        }
      }
    } else if (parsedData && typeof parsedData === 'object') {
      // Import simple
      const newSequence = createSequenceFromData(parsedData)
      if (newSequence) {
        saveSequence(newSequence)
        importedCount++
      }
    }
    
    if (importedCount > 0) {
      toast.add({
        title: t('importMultipleSuccess', { count: importedCount }),
        color: 'success'
      })
      emit('imported', importedCount)
      isOpen.value = false
    } else {
      throw new Error('Aucune séquence n\'a pu être importée')
    }
  } catch (error) {
    console.error('Erreur lors de l\'import:', error)
    toast.add({
      title: t('importError'),
      color: 'error'
    })
  } finally {
    isLoading.value = false
  }
}

// Analyser les données au montage et surveiller les changements
onMounted(() => {
  parseSequenceData()
})

// Surveiller les changements de props.base64Data
watch(
  () => props.base64Data,
  (newValue) => {
    if (newValue) {
      parseSequenceData()
    }
  }
)
</script>

<template>
  <UModal v-model:open="isOpen" :title="modalTitle">
    <template #body>
      <div class="space-y-4">
        <p class="text-sm text-gray-700 dark:text-gray-300">
          {{ sequenceNames.length === 1 ? t('sequences.importFromUrlSingle') : t('sequences.importFromUrlDescription') }}
        </p>

        <div v-if="!parseError && sequenceNames.length > 0" class="space-y-2">
          <p class="text-sm font-medium">
            {{ sequenceNames.length === 1 ? t('sequence') : t('sequences') }}:
          </p>
          <ul class="list-disc list-inside space-y-1">
            <li
              v-for="(name, index) in sequenceNames"
              :key="index"
              class="text-sm text-gray-700 dark:text-gray-300"
            >
              {{ name }}
            </li>
          </ul>
        </div>

        <div v-if="parseError" class="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
          <p class="text-sm text-red-600 dark:text-red-400">
            {{ t('sequences.invalidSequenceData') }}
          </p>
        </div>
      </div>
    </template>

    <template #footer>
      <div class="flex justify-end gap-3">
        <UButton
          color="neutral"
          variant="ghost"
          @click="isOpen = false"
        >
          {{ t('common.cancel') }}
        </UButton>
        <UButton
          :disabled="parseError || isLoading"
          :loading="isLoading"
          @click="handleImport"
        >
          {{ t('sequences.importFromUrl') }}
        </UButton>
      </div>
    </template>
  </UModal>
</template>