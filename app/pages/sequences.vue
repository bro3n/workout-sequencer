<template>
  <div class="container mx-auto p-6 max-w-4xl">
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">
        {{ $t('sequences.title') }}
      </h1>
      <p class="text-gray-600 dark:text-gray-300">
        {{ $t('sequences.subtitle') }}
      </p>
    </div>

    <!-- Message de feedback -->
    <div v-if="message" class="mb-6">
      <div
        :class="[
          'p-4 rounded-lg border',
          messageType === 'success'
            ? 'bg-green-50 border-green-200 text-green-800 dark:bg-green-900 dark:border-green-700 dark:text-green-100'
            : 'bg-red-50 border-red-200 text-red-800 dark:bg-red-900 dark:border-red-700 dark:text-red-100'
        ]"
      >
        {{ message }}
      </div>
    </div>

    <!-- Filtres par type -->
    <div class="mb-6">
      <div class="flex gap-3">
        <UButton
          @click="filterType = 'workout'"
          :variant="filterType === 'workout' ? 'solid' : 'outline'"
          :color="filterType === 'workout' ? 'primary' : 'neutral'"
        >
          {{ $t('sequences.filterWorkout') }} ({{ workoutCount }})
        </UButton>
        <UButton
          @click="filterType = 'warmup'"
          :variant="filterType === 'warmup' ? 'solid' : 'outline'"
          :color="filterType === 'warmup' ? 'primary' : 'neutral'"
        >
          {{ $t('sequences.filterWarmup') }} ({{ warmupCount }})
        </UButton>
      </div>
    </div>

    <!-- Actions globales -->
    <div class="flex justify-between items-center mb-6">
      <div class="flex gap-3">
        <UButton @click="refreshSequences" icon="i-heroicons-arrow-path" variant="outline">
          {{ $t('sequences.refresh') }}
        </UButton>
        <UButton @click="exportAll" icon="i-heroicons-arrow-up-tray" variant="outline" :disabled="filteredSequences.length === 0">
          {{ $t('sequences.exportAll') }}
        </UButton>
        <UButton @click="clearAll" color="error" variant="outline" :disabled="filteredSequences.length === 0">
          {{ $t('sequences.deleteAll') }}
        </UButton>
      </div>
      <div class="flex gap-3">
        <UButton @click="openImportModal" icon="i-heroicons-arrow-down-tray" variant="outline">
          {{ $t('sequences.import') }}
        </UButton>
        <UButton to="/create-sequence" icon="i-heroicons-plus">
          {{ $t('sequences.newSequence') }}
        </UButton>
      </div>
    </div>

    <!-- Liste des séquences -->
    <div v-if="filteredSequences.length > 0" class="space-y-4">
      <div
        v-for="sequence in filteredSequences"
        :key="sequence.id"
        class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6"
      >
        <div class="flex justify-between items-start mb-4">
          <div>
            <div class="flex items-center gap-2 mb-2">
              <h3 class="text-xl font-semibold text-gray-900 dark:text-white">
                {{ sequence.name }}
              </h3>
              <span
                v-if="sequence.type === 'warmup'"
                class="px-2 py-1 text-xs font-medium rounded-full bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200"
              >
                {{ $t('sequences.warmupBadge') }}
              </span>
            </div>
            <div class="text-sm text-gray-500 dark:text-gray-400 space-y-1">
              <p>{{ sequence.exercises.length }} {{ $t('sequences.exercises') }}</p>
              <p v-if="sequence.cycleRepetitions && sequence.cycleRepetitions > 1">
                {{ $t('sequences.cycles') }} : {{ sequence.cycleRepetitions }}
              </p>
              <p v-if="sequence.breakDuration && sequence.breakDuration > 0">
                {{ $t('sequences.breakBetween') }} : {{ sequence.breakDuration }}s
              </p>
              <p v-else>{{ $t('sequences.noBreak') }}</p>
              <p>{{ $t('sequences.createdAt') }} {{ formatDate(sequence.createdAt) }}</p>
              <p v-if="sequence.updatedAt.getTime() !== sequence.createdAt.getTime()">
                {{ $t('sequences.updatedAt') }} {{ formatDate(sequence.updatedAt) }}
              </p>
            </div>
          </div>
          <div class="flex gap-2">
            <UButton
              :to="`/workout/${sequence.id}`"
              color="primary"
              variant="solid"
              icon="i-heroicons-play"
              size="sm"
            >
              <span class="hidden sm:inline">{{ $t('sequences.start') }}</span>
            </UButton>
            <UDropdownMenu :items="getSequenceActions(sequence)">
              <UButton
                color="neutral"
                variant="outline"
                icon="i-heroicons-ellipsis-vertical"
                size="sm"
                :aria-label="$t('sequences.actions')"
              />
            </UDropdownMenu>
          </div>
        </div>

        <!-- Liste des exercices -->
        <div class="space-y-2">
          <h4 class="font-medium text-gray-700 dark:text-gray-300 mb-3">{{ $t('sequences.exercisesList') }} :</h4>
          <div class="grid gap-2">
            <div
              v-for="exercise in sequence.exercises"
              :key="exercise.id"
              class="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
            >
              <span class="font-medium text-gray-900 dark:text-white">{{ exercise.name }}</span>
              <span class="text-sm text-gray-600 dark:text-gray-300">
                <template v-if="exercise.type === 'repetitions'">
                  {{ exercise.repetitions }} {{ $t('sequences.reps') }}
                </template>
                <template v-else>
                  {{ exercise.duration }}s
                </template>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- État vide -->
    <div v-else class="text-center py-12">
      <div class="text-gray-400 mb-4">
        <svg class="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      </div>
      <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">
        {{ $t('sequences.noSequences') }}
      </h3>
      <p class="text-gray-500 dark:text-gray-400 mb-6">
        {{ $t('sequences.noSequencesDesc') }}
      </p>
      <UButton to="/create-sequence" icon="i-heroicons-plus">
        {{ $t('sequences.createFirst') }}
      </UButton>
    </div>

    <!-- Modal de confirmation de suppression -->
    <UModal v-model:open="deleteModalOpen" :title="$t('sequences.deleteModalTitle')">
      <template #body>
        <p class="text-gray-700 dark:text-gray-300">
          {{ $t('sequences.deleteConfirm') }}
          <strong class="text-white">{{ sequenceToDelete?.name }}</strong> ?
        </p>
        <p class="text-sm text-gray-500 dark:text-gray-400 mt-2">
          {{ $t('sequences.irreversible') }}
        </p>
      </template>
      <template #footer>
        <div class="flex justify-end gap-3">
          <UButton
            :label="$t('sequences.cancel')"
            color="neutral"
            variant="outline"
            @click="cancelDelete"
          />
          <UButton
            :label="$t('sequences.confirmDelete')"
            color="error"
            @click="confirmDelete"
          />
        </div>
      </template>
    </UModal>

    <!-- Modal d'export -->
    <ExportSequenceModal
      v-model:open="exportModalOpen"
      :sequence="sequenceToExport"
      :sequences="sequencesToExport"
    />

    <!-- Modal d'import -->
    <ImportSequenceModal
      v-model:open="importModalOpen"
      @imported="handleImportSuccess"
      @imported-multiple="handleImportMultipleSuccess"
    />
  </div>
</template>

<script setup lang="ts">
import type { WorkoutSequence } from '~/types/workout'

// Nom du composant
defineOptions({
  name: 'SequencesPage'
})

// Composables au niveau du setup
const { t } = useI18n()
const { getSequences, saveSequence, deleteSequence, clearAllSequences } = useWorkoutStorage()

// État réactif
const sequences = ref<WorkoutSequence[]>([])
const filterType = ref<'workout' | 'warmup'>('workout')
const message = ref('')
const messageType = ref<'success' | 'error' | ''>('')
const deleteModalOpen = ref(false)
const sequenceToDelete = ref<WorkoutSequence | null>(null)
const exportModalOpen = ref(false)
const sequenceToExport = ref<WorkoutSequence | null>(null)
const sequencesToExport = ref<WorkoutSequence[]>([])
const importModalOpen = ref(false)

// Charger les séquences au montage
const loadSequences = () => {
  sequences.value = getSequences()
  console.log('Séquences chargées:', sequences.value)
}

// Séquences filtrées par type
const filteredSequences = computed(() => {
  return sequences.value.filter(seq => seq.type === filterType.value)
})

// Comptes par type
const workoutCount = computed(() => {
  return sequences.value.filter(seq => seq.type === 'workout').length
})

const warmupCount = computed(() => {
  return sequences.value.filter(seq => seq.type === 'warmup').length
})

// Créer les actions du menu dropdown pour chaque séquence
const getSequenceActions = (sequence: WorkoutSequence) => {
  return [
    [
      {
        label: t('sequences.edit'),
        icon: 'i-heroicons-pencil',
        onSelect: () => navigateTo(`/edit-sequence/${sequence.id}`)
      },
      {
        label: t('sequences.duplicate'),
        icon: 'i-heroicons-document-duplicate',
        onSelect: () => duplicateSequenceHandler(sequence.id)
      },
      {
        label: t('sequences.export'),
        icon: 'i-heroicons-arrow-up-tray',
        onSelect: () => openExportModal(sequence)
      }
    ],
    [
      {
        label: t('sequences.delete'),
        icon: 'i-heroicons-trash',
        color: 'error',
        onSelect: () => openDeleteModal(sequence)
      }
    ]
  ]
}

// Actualiser les séquences
const refreshSequences = () => {
  loadSequences()
  const count = filteredSequences.value.length
  const typeLabel = filterType.value === 'workout' ? t('sequences.sequenceType') : t('sequences.warmupType')
  const plural = count > 1 ? 's' : ''
  message.value = t('sequences.refreshed', { count, type: typeLabel, plural })
  messageType.value = 'success'
  
  setTimeout(() => {
    message.value = ''
    messageType.value = ''
  }, 3000)
}

// Dupliquer une séquence
const duplicateSequenceHandler = (id: string) => {
  const sequenceToDuplicate = sequences.value.find(s => s.id === id)
  
  if (!sequenceToDuplicate) {
    message.value = t('sequences.notFound')
    messageType.value = 'error'
    setTimeout(() => {
      message.value = ''
      messageType.value = ''
    }, 3000)
    return
  }
  
  // Créer une copie avec un nouveau nom et de nouveaux IDs
  const duplicatedSequence: WorkoutSequence = {
    ...sequenceToDuplicate,
    id: crypto.randomUUID(),
    name: `${t('sequences.copyOf')} ${sequenceToDuplicate.name}`,
    exercises: sequenceToDuplicate.exercises.map(ex => ({
      ...ex,
      id: crypto.randomUUID()
    })),
    createdAt: new Date(),
    updatedAt: new Date()
  }
  
  if (saveSequence(duplicatedSequence)) {
    loadSequences()
    message.value = t('sequences.duplicated', { name: duplicatedSequence.name })
    messageType.value = 'success'
  } else {
    message.value = t('sequences.duplicateError')
    messageType.value = 'error'
  }
  
  setTimeout(() => {
    message.value = ''
    messageType.value = ''
  }, 3000)
}

// Ouvrir la modal de suppression
const openDeleteModal = (sequence: WorkoutSequence) => {
  sequenceToDelete.value = sequence
  deleteModalOpen.value = true
}

// Annuler la suppression
const cancelDelete = () => {
  deleteModalOpen.value = false
  sequenceToDelete.value = null
}

// Confirmer la suppression
const confirmDelete = () => {
  if (!sequenceToDelete.value) return
  
  const sequenceName = sequenceToDelete.value.name
  
  if (deleteSequence(sequenceToDelete.value.id)) {
    loadSequences()
    message.value = t('sequences.deleted', { name: sequenceName })
    messageType.value = 'success'
  } else {
    message.value = t('sequences.deleteError')
    messageType.value = 'error'
  }
  
  deleteModalOpen.value = false
  sequenceToDelete.value = null
  
  setTimeout(() => {
    message.value = ''
    messageType.value = ''
  }, 3000)
}

// Ouvrir la modal d'export pour une séquence
const openExportModal = (sequence: WorkoutSequence) => {
  sequenceToExport.value = sequence
  sequencesToExport.value = []
  exportModalOpen.value = true
}

// Ouvrir la modal d'export pour toutes les séquences
const exportAll = () => {
  sequenceToExport.value = null
  sequencesToExport.value = filteredSequences.value
  exportModalOpen.value = true
}

// Ouvrir la modal d'import
const openImportModal = () => {
  importModalOpen.value = true
}

// Gérer le succès de l'import d'une séquence
const handleImportSuccess = (sequence: WorkoutSequence) => {
  loadSequences()
  message.value = t('sequences.importSuccess', { name: sequence.name })
  messageType.value = 'success'
  
  setTimeout(() => {
    message.value = ''
    messageType.value = ''
  }, 3000)
}

// Gérer le succès de l'import multiple
const handleImportMultipleSuccess = (count: number) => {
  loadSequences()
  message.value = t('sequences.importMultipleSuccess', { count })
  messageType.value = 'success'
  
  setTimeout(() => {
    message.value = ''
    messageType.value = ''
  }, 3000)
}

// Supprimer toutes les séquences
const clearAll = () => {
  if (clearAllSequences()) {
    loadSequences()
    message.value = t('sequences.clearedAll')
    messageType.value = 'success'
  } else {
    message.value = t('sequences.deleteError')
    messageType.value = 'error'
  }
  
  setTimeout(() => {
    message.value = ''
    messageType.value = ''
  }, 3000)
}

// Formater une date
const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date)
}

// Charger les séquences au montage du composant
onMounted(() => {
  loadSequences()
})
</script>