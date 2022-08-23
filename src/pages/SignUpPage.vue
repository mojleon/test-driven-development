<template>
    <div class="col-lg-6 offset-lg-3 col-md-8 offset-md-2" data-testid="signup-page">
        <form class="card mt-5" data-testid="form-sign-up" v-if="!signUpSucces">
            <div class="card-header">
                <h1 class="text-center">{{ $t('signUp') }}</h1>
            </div>
            <div class="card-body">
                <InputComponent id="username" :label="$t('username')" :help="errors.username" v-model="username"/>
                <InputComponent id="e-mail" :label="$t('email')" :help="errors.email" v-model="email"/>
                <InputComponent id="password" :label="$t('password')" :help="errors.password" v-model="password" type="password"/>
                <InputComponent id="password-repeat" :label="$t('passwordRepeat')" type="password" v-model="passwordRepeat" :help="hasPasswordMismatch ? $t('passwordMismatchValidation') : ''"/>
                <div class="text-center">
                    <button class="btn btn-primary" :disabled="isDisabled || apiProgress" @click.prevent="submit">
                        <Spinner v-if="apiProgress"/>
                        {{ $t('signUp') }}
                    </button>
                </div>
            </div>
        </form>
        <div v-else class="alert alert-primary mt-3">{{ $t('accountActivationNotification') }}</div>
    </div>
</template>

<script>
import { signUp } from '../api/apiCalls'
import InputComponent from '../components/InputComponent';
import Spinner from "../components/SpinnerComponent.vue"

export default {
    name: "SignUpPage",
    components: {
        InputComponent,
        Spinner
    },
    data() {
        return {
            username: "",
            email: "",
            password: '',
            passwordRepeat: '',
            apiProgress: false,
            signUpSucces: false,
            errors: {},
        }
    },
    methods: {
        async submit() {
            this.apiProgress = true;
            try {
            await signUp({
                username: this.username,
                email: this.email,
                password: this.password,
            }) 
                this.signUpSucces = true;
            } catch(error) {
                if(error.response.status === 400) {
                    this.errors = error.response.data.validationErrors;
                }
                this.apiProgress = false;
            }
            
            
            
            // .then(() => {
            //     this.signUpSucces = true;
            // }).catch((error) => {
            //     if(error.response.status === 400) {
            //         this.errors = error.response.data.validationErrors;
            //     }
            //     this.apiProgress = false;
            // })

            // const requestBody = {
            //     username: this.username,
            //     email: this.email,
            //     password: this.password
            // }
            // fetch("api/1.0/users", {
            //     method: "POST",
            //     body: JSON.stringify(requestBody),
            //     headers: {
            //         "Content-Type": "application/json",
            //     }
            // })
        }
    },
    computed: {
        isDisabled() {
            return (this.password && this.passwordRepeat) ? this.password !== this.passwordRepeat : true
        },
        hasPasswordMismatch() {
            return this.password !== this.passwordRepeat;
        }
    },
    watch: {
        username() {
            delete this.errors.username;
        },
        email() {
            delete this.errors.email;
        },
        password() {
            delete this.errors.password;
        }
    }
}
</script>