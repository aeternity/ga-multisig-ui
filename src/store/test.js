import { reactive, toRefs } from 'vue'


export const test = reactive({
  mmm: [
    {
      signer: 'ak_2QwV57qAR1rPqWfX4smiTXTn6Gp3aRd2q7boGxJy74wEMn85N7',
      multisigContracts: [
        "ak_YQw2oFWR1iS6ao82fjwPg6JnHuRY9Bg67HVFQ9KmNyw2Cw6e6",
        "ak_2Rb9X6kYEV89hpPP5Lw5K9khYc9CeYghMwBKwqWshcwAa3LNjg",
      ],
    },
    {
      signer: 'ak_2JUjxGNfpVCov7SGTZdPGWW5XUZmuPwqbZsD9LaReEceFusbhU',
      multisigContracts: [
        "ak_2oFR9ZLskmqNuGRhdVcThNR94ESUwgJqkNHEJAvmLM1DEd3bKP",
        "ak_TeHTokAWoQgPukRkY7tQEa86jU6DnYjEb5YfwuLMYBLTFBD39",
      ],
    },
  ],
})

export const getMMM = () => {
  const { mmm } = toRefs(test)
  console.log('1', mmm.value)
 return mmm
}

