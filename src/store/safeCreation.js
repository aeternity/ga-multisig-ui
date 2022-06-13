import { reactive, toRefs } from 'vue'

const getInitialCreationSteps = () => ({
  creationStep1: false,
  creationStep2: false,
  creationStep3: false,
  creationStep4: false,
})

export const creationSteps = reactive(getInitialCreationSteps())

// todo function
export const clearCreationSteps = () => {
  Object.assign(creationSteps, getInitialCreationSteps())
}

export const hasCreationStarted = () => {
  const { creationStep1, creationStep2, creationStep3, creationStep4 } = toRefs(creationSteps)
  return creationStep1 || creationStep2 || creationStep3 || creationStep4
}

