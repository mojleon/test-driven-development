<template>
    <img title="Dutch" @click="$i18n.locale = 'nl'" src="https://flagcdn.com/h20/nl.png" alt="Dutch">
    <img title="English" @click="$i18n.locale = 'gb'" src="https://flagcdn.com/h20/gb.png" alt="English">
</template>

<style scoped>
img {
    margin-right: 5px;
    cursor:pointer;
}
</style>