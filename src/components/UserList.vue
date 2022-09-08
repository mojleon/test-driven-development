<template>
    <div class="card">
        <div class="card-header text-center">
            <h3>Users</h3>
        </div>
        <ul class="list-group list-group-flush">
            <li class="list-group-item list-group-item-action" v-for="user in page.content" :key="user.id">
                {{user.username}}
            </li>
        </ul>
        <div class="card-footer">
            <button class="btn btn-outlinesecondary btn-sm" @click="loadData(page.page - 1)" v-if="page.page !== 0">&lt; previous</button>
            <button class="btn btn-outlinesecondary btn-sm float-end" @click="loadData(page.page + 1)" v-if="page.totalPages > page.page + 1">next &gt;</button>
        </div>
    </div>
</template>

<script>
import { loadUsers } from "../api/apiCalls";
export default {
    data() {
        return {
            page: {
                content: [],
                page: 0,
                size: 0,
                totalPages: 0
            }
        }
    },

    async mounted() {
        this.loadData();
    },
    methods: {
        async loadData(pageIndex) {
            const response = await loadUsers(pageIndex);
            this.page = response.data;
        }
    }
}
</script>