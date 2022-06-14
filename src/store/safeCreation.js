import { reactive, toRefs } from 'vue'

const getInitialcreationPhases = () => ({
  creationPhase1: false,
  creationPhase2: false,
  creationPhase3: false,
  creationPhase4: false,
})

export const creationPhases = reactive(getInitialcreationPhases())

export function clearCreationSteps () {
  Object.assign(creationPhases, getInitialcreationPhases())
}

export const isCreating = () => {
  const { creationPhase1, creationPhase4 } = toRefs(creationPhases)
  return creationPhase1.value === true && creationPhase4.value === false
}
export const isCreated = () => {
  const { creationPhase1, creationPhase2, creationPhase3, creationPhase4 } = toRefs(creationPhases)
  return creationPhase1.value && creationPhase2.value && creationPhase3.value && creationPhase4.value
}

