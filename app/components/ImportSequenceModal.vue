<script setup lang="ts">
import type { WorkoutSequence } from '~/types/workout'

interface Props {
  open: boolean
}

interface Emits {
  (e: 'update:open', value: boolean): void
  (e: 'imported', sequence: WorkoutSequence): void
  (e: 'importedMultiple', count: number): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const { t } = useI18n()
const { saveSequence, getSequences } = useWorkoutStorage()

// État local
const selectedFile = ref<File | null>(null)
const errorMessage = ref('')
const isImporting = ref(false)

// Computed pour gérer l'état de la modal
const isOpen = computed({
  get: () => props.open,
  set: (value) => emit('update:open', value)
})

// Référence pour l'input file
const fileInputRef = ref<HTMLInputElement | null>(null)

/**
 * Ouvre le sélecteur de fichier
 */
const selectFile = () => {
  fileInputRef.value?.click()
}

/**
 * Gère la sélection d'un fichier
 */
const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  
  if (!file) return
  
  // Vérifier que c'est un fichier JSON
  if (!file.name.endsWith('.json')) {
    errorMessage.value = t('sequences.invalidFileFormat')
    selectedFile.value = null
    return
  }
  
  selectedFile.value = file
  errorMessage.value = ''
}

/**
 * Génère un nom unique pour une séquence
 */
const generateUniqueName = (baseName: string): string => {
  const sequences = getSequences()
  const existingNames = sequences.map(seq => seq.name)
  
  // Si le nom n'existe pas, on le retourne tel quel
  if (!existingNames.includes(baseName)) {
    return baseName
  }
  
  // Sinon, on ajoute la date courante entre parenthèses
  const now = new Date()
  const dateStr = now.toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
  
  return `${baseName} (${dateStr})`
}

/**
 * Valide les données de la séquence
 */
interface SequenceData {
  name: string
  type?: 'workout' | 'warmup'
  exercises: Array<{
    name: string
    type: 'repetitions' | 'duration'
    repetitions?: number
    duration?: number
  }>
  breakDuration: number
  cycleRepetitions?: number
  cycleBreakDuration?: number
}

const validateSequenceData = (data: unknown): data is SequenceData => {
  if (!data || typeof data !== 'object') return false
  const seq = data as Record<string, unknown>
  
  // Validation des champs requis
  if (typeof seq.name !== 'string' || !seq.name.trim()) {
    console.error('Invalid name:', seq.name)
    return false
  }
  
  if (!Array.isArray(seq.exercises) || seq.exercises.length === 0) {
    console.error('Invalid exercises:', seq.exercises)
    return false
  }
  
  if (typeof seq.breakDuration !== 'number' || seq.breakDuration < 0) {
    console.error('Invalid breakDuration:', seq.breakDuration)
    return false
  }
  
  // Validation des champs optionnels s'ils existent
  if (seq.cycleRepetitions !== undefined) {
    if (typeof seq.cycleRepetitions !== 'number' || seq.cycleRepetitions < 1) {
      console.error('Invalid cycleRepetitions:', seq.cycleRepetitions)
      return false
    }
  }
  
  if (seq.cycleBreakDuration !== undefined) {
    if (typeof seq.cycleBreakDuration !== 'number' || seq.cycleBreakDuration < 0) {
      console.error('Invalid cycleBreakDuration:', seq.cycleBreakDuration)
      return false
    }
  }
  
  // Valider chaque exercice
  const exercisesValid = seq.exercises.every((exercise: unknown) => {
    if (!exercise || typeof exercise !== 'object') {
      console.error('Invalid exercise object:', exercise)
      return false
    }
    
    const ex = exercise as Record<string, unknown>
    
    if (typeof ex.name !== 'string' || !ex.name.trim()) {
      console.error('Invalid exercise name:', ex.name)
      return false
    }
    
    if (ex.type !== 'repetitions' && ex.type !== 'duration') {
      console.error('Invalid exercise type:', ex.type)
      return false
    }
    
    if (ex.type === 'repetitions') {
      if (typeof ex.repetitions !== 'number' || ex.repetitions <= 0) {
        console.error('Invalid repetitions:', ex.repetitions)
        return false
      }
    } else if (ex.type === 'duration') {
      if (typeof ex.duration !== 'number' || ex.duration <= 0) {
        console.error('Invalid duration:', ex.duration)
        return false
      }
    }
    
    return true
  })
  
  return exercisesValid
}

/**
 * Crée une séquence à partir des données importées
 */
const createSequenceFromData = (data: SequenceData): WorkoutSequence => {
  const uniqueName = generateUniqueName(data.name)
  
  return {
    id: crypto.randomUUID(),
    name: uniqueName,
    type: data.type || 'workout',
    exercises: data.exercises.map(exercise => ({
      ...exercise,
      id: crypto.randomUUID()
    })),
    breakDuration: data.breakDuration,
    cycleRepetitions: data.cycleRepetitions || 1,
    cycleBreakDuration: data.cycleBreakDuration || 0,
    createdAt: new Date(),
    updatedAt: new Date()
  }
}

/**
 * Importe la séquence depuis le fichier sélectionné
 */
const importSequence = async () => {
  if (!selectedFile.value) {
    errorMessage.value = t('sequences.selectFile')
    return
  }
  
  isImporting.value = true
  errorMessage.value = ''
  
  try {
    // Lire le contenu du fichier
    const fileContent = await selectedFile.value.text()
    
    // Parser le JSON
    const data = JSON.parse(fileContent)
    
    // Vérifier si c'est un tableau (import multiple) ou un objet (import simple)
    const isMultiple = Array.isArray(data)
    
    if (isMultiple) {
      // Import multiple
      let importedCount = 0
      
      for (const sequenceData of data) {
        if (!validateSequenceData(sequenceData)) {
          console.warn('Séquence invalide ignorée:', sequenceData)
          continue
        }
        
        const newSequence = createSequenceFromData(sequenceData)
        
        if (saveSequence(newSequence)) {
          importedCount++
        }
      }
      
      if (importedCount === 0) {
        errorMessage.value = t('sequences.invalidSequenceData')
        isImporting.value = false
        return
      }
      
      // Émettre l'événement d'import multiple réussi
      emit('importedMultiple', importedCount)
    } else {
      // Import simple
      if (!validateSequenceData(data)) {
        errorMessage.value = t('sequences.invalidSequenceData')
        isImporting.value = false
        return
      }
      
      const newSequence = createSequenceFromData(data)
      
      // Sauvegarder la séquence
      const success = saveSequence(newSequence)
      
      if (!success) {
        errorMessage.value = t('sequences.importError')
        isImporting.value = false
        return
      }
      
      // Émettre l'événement d'import réussi
      emit('imported', newSequence)
    }
    
    // Fermer la modal
    close()
  } catch (error) {
    console.error('Erreur lors de l\'import:', error)
    if (error instanceof SyntaxError) {
      errorMessage.value = t('sequences.invalidFileFormat')
    } else {
      errorMessage.value = t('sequences.importError')
    }
  } finally {
    isImporting.value = false
  }
}

/**
 * Ferme la modal et réinitialise l'état
 */
const close = () => {
  selectedFile.value = null
  errorMessage.value = ''
  isImporting.value = false
  isOpen.value = false
}

// Réinitialiser l'état quand la modal s'ouvre
watch(() => props.open, (newValue) => {
  if (newValue) {
    selectedFile.value = null
    errorMessage.value = ''
    isImporting.value = false
  }
})
</script>

<template>
  <UModal v-model:open="isOpen" :title="$t('sequences.importModalTitle')">
    <template #body>
      <div class="space-y-4">
        <p class="text-gray-700 dark:text-gray-300">
          {{ $t('sequences.importModalDescription') }}
        </p>

        <!-- Message d'erreur -->
        <div v-if="errorMessage" class="p-3 rounded-lg bg-red-50 border border-red-200 text-red-800 dark:bg-red-900 dark:border-red-700 dark:text-red-100">
          {{ errorMessage }}
        </div>

        <div class="grid gap-3">
          <!-- Sélection de fichier -->
          <input
            ref="fileInputRef"
            type="file"
            accept=".json"
            class="hidden"
            @change="handleFileSelect"
          />
          
          <UButton
            @click="selectFile"
            block
            :icon="selectedFile ? 'i-heroicons-check-circle' : 'i-heroicons-document-plus'"
            variant="outline"
            :color="selectedFile ? 'success' : 'primary'"
          >
            {{ selectedFile ? $t('sequences.fileSelected') : $t('sequences.selectFile') }}
          </UButton>
          
          <!-- Nom du fichier sélectionné -->
          <p v-if="selectedFile" class="text-xs text-gray-600 dark:text-gray-400 text-center">
            {{ selectedFile.name }}
          </p>

          <!-- Bouton d'import -->
          <UButton
            @click="importSequence"
            block
            icon="i-heroicons-arrow-down-tray"
            color="primary"
            :loading="isImporting"
            :disabled="!selectedFile || isImporting"
          >
            {{ $t('sequences.importButton') }}
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
          :disabled="isImporting"
          @click="close"
        />
      </div>
    </template>
  </UModal>
</template>