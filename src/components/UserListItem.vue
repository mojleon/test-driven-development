<template>
    <img 
        src="/image/profile.png" 
        alt="profile" 
        width="30" 
        class="rounded-circle shadow-sm"
    />
    {{user.username}}
</template>
<script>
export default {
    props: {
        user: Object
    },
}
</script>