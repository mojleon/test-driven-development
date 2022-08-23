<template>
  <div data-testid="activation-page">
    <div v-if="succes" class="alert alert-success mt-3">
      Account is activated
    </div>
    <div v-if="fail" class="alert alert-danger mt-3">
      Activation failure
    </div>
    <Spinner v-if="apiProgress" size="normal"/>
  </div>
</template>

<script>
import { activate } from "../api/apiCalls"
import Spinner from "../components/SpinnerComponent.vue"
export default {
  components: {
    Spinner,
  },
  data() {
    return {
        succes: false,
        fail: false,
        apiProgress: false,
    }
  },
  async mounted() {
    this.apiProgress = true;
    try {
      await activate(this.$route.params.token)
      this.succes = true; 
    } 
    catch(error) 
      { this.fail = true;}
    
      this.apiProgress = false;
       
 },
}

</script>

