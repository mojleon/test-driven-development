<template>
    <div class="mb-3">
        <label class="form-label" :for="id">{{label}}</label>
        <input :class="{'is-invalid': help}" class="form-control" :id="id" :value="modelValue" @input="$emit('update:modelValue', $event.target.value)" :type="type"/>
        <span v-if="help" class="invalid-feedback">{{help}}</span>
    </div>    
</template>
<script>
export default {
    emits: ["update:modelValue"],
    props: {
        label: String,
        id: String,
        help: String,
        modelValue: String,
        type: String
    },
}
</script>