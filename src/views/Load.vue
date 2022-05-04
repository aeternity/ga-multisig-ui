<template>
    <div class="about">
        <h1>Contracts where I am signer</h1>

      <input
        type="text"
        v-model="todoName"
        @keyup.enter="addTodo"
        aria-label="Add a new Todo"
        placeholder="Add a new Todo"
      />

      <ul>
        <li
          v-for="todo of todos"
          :class="{ done: todo.done }"
          :key="todo.id"
          @click="doneTodo(todo.id)"
        >
          {{ todo.name }}
        </li>
      </ul>


      <div v-for="contract in myContracts">
        <div>
          {{ contract }}
          <button @click="loadContractInfo(contract)">
            Load info
          </button>
        </div>
      </div>
      <h3>Detail:</h3>
      <div>
        {{ contractDetail }}
<!--        <multisig-detail-list/>-->
<!--        get status and resume action-->
      </div>
    </div>
</template>

<script>

import {  Universal, Node } from '@aeternity/aepp-sdk'

import { loadMyContracts, updateContractInfo } from "../store"
import { COMPILER_URL } from "../utils/aeternity/configs"
import axios from "axios";

const baseURL = "http://localhost:3001/todos";


export default {
  async created () {
    try {
      const res = await axios.get(baseURL);

      this.todos = res.data;
    } catch (e) {
      console.error(e);
    }

  },

  name: 'About',
  data: () => ({
    myContracts: null,
    contractDetail: null,
    todoName: '',
    todos:[]
  }),
  async mounted () {
    this.myContracts = await loadMyContracts()
  },


  methods: {
    async doneTodo (id) {
      try {
        await axios.patch(`${baseURL}/${id}`, {
          done: true
        });

        this.todos = this.todos.map(todo => {
          if (todo.id === id) {
            todo.done = true;
          }

          return todo;
        });
      } catch (e) {
        console.error(e);
      }
    },


    async addTodo () {
      try {
        const res = await axios.post(baseURL, { name: this.todoName });

        this.todos = [...this.todos, res.data];

        this.todoName = "";
      } catch (e) {
        console.error(e);
      }
    },


    async loadContractInfo (contract) {
      const signerSdk = await Universal({
        nodes: [{
          name: 'testnet',
          instance: await Node({ url: 'https://testnet.aeternity.io' }),
        }],
        compilerUrl: COMPILER_URL,
      })

      updateContractInfo(signerSdk, contract)
      // this.contractDetail = await loadContractDetail(contract)
      // console.log('contract', contract)
    },

  },
}
</script>

<style>
.done {
  text-decoration: line-through;
}

</style>
