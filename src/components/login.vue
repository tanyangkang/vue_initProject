<template>
  <div>
    <span>登陆</span>
  </div>
</template>
<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';

@Component
export default class Login extends Vue {
  @Prop() private msg!: string;
}
</script>
