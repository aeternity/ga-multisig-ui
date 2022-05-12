<template>
  <div class="resume"></div>
</template>

<script>
export default {
  name: 'Resume',
  props: {
    propName: {
      type: Boolean,
      required: true,
    },
  },
  data: () => ({
    valName: null,
  }),
}
</script>

<style scoped>
.resume {

}
</style>
