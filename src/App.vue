<template>
<div class="shadow-sm bg-light mb-3">
  <nav class="navbar navbar-expand navbar-light container">
    <div class="container-fluid">
      <router-link class="navbar-brand" to="/" title="Home">
        <img src="./assets/logo.png" height="40" alt="Vue Logo">
        Hoaxify
      </router-link>
      <ul class="navbar-nav ml-auto">
        <router-link class="nav-link" to="/signup">{{$t('signUp')}}</router-link>
        <router-link class="nav-link" to="/login">{{$t('Login')}}</router-link>
      </ul>
    </div>
  </nav>
</div>
  <div class="container">
    <router-view />
    <LanguageSelector/>
  </div>
</template>

<script>
import LanguageSelector from './components/LanguageSelector';

export default {
  name: 'App',
  components: {
    LanguageSelector,
  },
  data() {
    return {
      path: window.location.pathname,
    }
  },

  methods: {
    onClickLink(event) {
      this.path = event.currentTarget.attributes.href.value;
      window.history.pushState({}, "", this.path);
    } 
  }
}
</script>
