<template>
  <div class="signers-form">
    <ul>
      <li v-for="(signer, index) in signersList" class="signers-item">
        <input
          placeholder="Signer address"
          type="text"
          :value="signer"
          @input="update($event, index)"
        />
        <span
          class="signers-close"
          v-if="index > 1"
          @click="removeInput(index)"
        >
          &#9587;
        </span>
      </li>
    </ul>

    <button @click="addInput">+ Add another signer</button>
    <br />
    <br />
    Any transactions requires the confirmation of:
    <br />

    <select
      :value="requiredSignersAmount"
      @input="$emit('update:requiredSignersAmount', $event.target.value)"
    >
      <template v-for="(_, index) in signersList" :>
        <option v-if="index > 0" :value="index + 1">
          {{ index + 1 }}
        </option>
      </template>
    </select>
    <span> out of {{ signersList.length }} users</span>
  </div>
</template>
<script>
export default {
  name: "signers-form",
  props: ["signersList", "requiredSignersAmount"],

  methods: {
    addInput() {
      this.signersList.push("");
      this.$emit("update:requiredSignersAmount", this.signersList.length);
    },
    removeInput(index) {
      this.signersList.splice(index, 1);
      if (this.requiredSignersAmount > this.signersList.length) {
        this.$emit("update:requiredSignersAmount", this.signersList.length);
      }
    },
    update(event, index) {
      const modifiedList = this.signersList;
      modifiedList[index] = event.target.value;
      this.$emit("update:signersList", modifiedList);
    },
  },
};
</script>

<style scoped>
.signers-item {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
  gap: 10px;
}

.signers-close {
  position: relative;
  bottom: 8px;
  cursor: pointer;
}

select {
  width: 50px;
}
</style>
