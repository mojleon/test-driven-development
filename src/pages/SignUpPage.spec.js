import SignUpPage from './SignUpPage.vue';
import {render, screen, waitFor} from '@testing-library/vue';
import userEvent from "@testing-library/user-event";
import { setupServer } from "msw/node";
import { rest } from "msw";
import i18n from "../locales/i18n";
import gb from "../locales/gb.json";
import nl from "../locales/nl.json";
import LanguageSelector from "../components/LanguageSelector.vue"

let requestBody;
let counter = 0;
let acceptLanguageHeader;
const server = setupServer(
    rest.post("/api/1.0/users", (req, res, ctx) => {
        requestBody = req.body;
        counter += 1;
        acceptLanguageHeader = req.headers.get("Accept-Language");
        return res(ctx.status(200));
    })
);

beforeAll(() => server.listen());

beforeEach(() => { 
    counter = 0
    server.resetHandlers();
});

afterAll(() => server.close());

describe("Sign Up Page", () => {
    describe("Layout", () => {
        const setup = () => {
            render(SignUpPage, {
                global: {
                    plugins: [i18n]
                }
            });
        };

        it('has Sign Up Header', () => {
            setup();
            const header = screen.queryByRole('heading', { name: 'Sign Up'});
            expect(header).toBeInTheDocument();
        });
        it('has username input', () => {
            setup();
            const input = screen.queryByLabelText("Username");
            screen.queryByText
            expect(input).toBeInTheDocument();
        });
        it('has e-mail input', () => {
            setup();
            const input = screen.queryByLabelText('E-mail');
            expect(input).toBeInTheDocument();
        });
        it('has password input', () => {
            setup();
            const input = screen.queryByLabelText('Password');
            expect(input).toBeInTheDocument();
        });
        it('has password type for password input', () => {
            setup();
            const input = screen.queryByLabelText('Password');
            expect(input.type).toBe("password");
        });
        it('has password repeat input', () => {
            setup();
            const input = screen.queryByLabelText('Password repeat');
            expect(input).toBeInTheDocument();
        });
        it('has password type for repeat password input', () => {
            setup();
            const input = screen.queryByLabelText('Password repeat');
            expect(input.type).toBe("password");
        });
        it('has Sign Up button', () => {
            setup();
            const button = screen.queryByRole('button', { name: 'Sign Up'});
            expect(button).toBeInTheDocument();
        });
        it('Disables the button initially', () => {
            setup();
            const button = screen.queryByRole('button', { name: 'Sign Up'});
            expect(button).toBeDisabled();
        });
    });
    describe("Interactions", () => {
        let button, usernameInput, passwordInput, passwordRepeatInput;

        const setup = async () => {
            render(SignUpPage, {
                global: {
                    plugins: [i18n]
                }
            });
            
            usernameInput = screen.queryByLabelText("Username");
            const emailInput = screen.queryByLabelText("E-mail");
            passwordInput = screen.queryByLabelText("Password");
            passwordRepeatInput = screen.queryByLabelText("Password repeat");
            button = screen.queryByRole('button', { name: 'Sign Up'});
            await userEvent.type(usernameInput, "user1");
            await userEvent.type(emailInput, "user1@mail.com");
            await userEvent.type(passwordInput, "P4ssword");
            await userEvent.type(passwordRepeatInput, "P4ssword");
        }

        const generateValidationError = (field, message) => {
            return rest.post("/api/1.0/users", (req, res, ctx) => {
                return res(ctx.status(400), 
                ctx.json({
                    validationErrors: {
                        [field]: message,
                    }
                }));
            })
        }
        it("enables the button when the password and password repeat fields have the same value.", async () => {
            await setup();

            expect(button).toBeEnabled();
        });
        it("sends username, email and password to backend after clicking the button.", async () => {
            await setup();
            const button = screen.queryByRole('button', { name: 'Sign Up'});

            const mockFn = jest.fn(); // Create mock function.
            // axios.post = mockFn; // Replace the axios post function with the mock function.
            // window.fetch = mockFn;

            await userEvent.click(button);
            await screen.findByText('Please check your e-mail to activate your account');

            expect(requestBody).toEqual({
                username: 'user1',
                email: "user1@mail.com",
                password: "P4ssword"
            });
        });
        it("does not allow clicking of the button when there is an ongoing api call.", async () => {
            await setup();

            await userEvent.click(button);

            await userEvent.click(button);

            expect(counter).toBe(1);
        });
        it("displays spinner while the ap request is pending", async () => {
            await setup();
    
            await userEvent.click(button);
            
            const spinner = screen.queryByRole("status");
            expect(spinner).toBeInTheDocument();
        });
        it("does not display spinner when there is no api request", async () => {
            await setup();
            const spinner = screen.queryByRole("status");
            expect(spinner).not.toBeInTheDocument();
        });
        it("displays account activation information after successful sign up request", async () => {
            await setup();
    
            await userEvent.click(button);
            
           const text = await screen.findByText('Please check your e-mail to activate your account');
           expect(text).toBeInTheDocument();
        });
        it("does not display account activation messege before sign up request", async () => {
            server.use(
                rest.post("/api/1.0/users", (req, res, ctx) => {
                    return res(ctx.status(400));
                })
            )

            await setup();
            const text = screen.queryByText('Please check your e-mail to activate your account');

            expect(text).not.toBeInTheDocument();
        });
        it("does not display account activation information after failing sign up request", async () => {
            await setup();
    
            await userEvent.click(button);
            
            const text = screen.queryByText('Please check your e-mail to activate your account');
            expect(text).not.toBeInTheDocument();
        });
        it("hide sign up form after succesfull sign up request", async () => {
            await setup();
    
            const form = screen.queryByTestId("form-sign-up");

            await userEvent.click(button);
            
            await waitFor(() => {
                expect(form).not.toBeInTheDocument();
            })
        });

        it.each `
            field           | message
            ${'username'}   | ${'Username cannot be null'}
            ${'email'}      | ${'E-mail cannot be null'}
            ${'password'}   | ${'Password cannot be null'}
        ` ("displays $message for field $field", async ({field, message}) => {
            server.use(generateValidationError(field, message));

            await setup();

            await userEvent.click(button);

            const text = await screen.findByText(message);

            expect(text).toBeInTheDocument();
        });
        it("hiddes spinner after error response received", async () => {
            server.use(generateValidationError("username", "Username cannot be null"));

            await setup();

            await userEvent.click(button);

            await screen.findByText("Username cannot be null");
            const spinner = screen.queryByRole("status");
            expect(spinner).not.toBeInTheDocument();
        });
        it("enables button after error response received", async () => {
            server.use(generateValidationError("username", "Username cannot be null"));

            await setup();

            await userEvent.click(button);

            await screen.findByText("Username cannot be null");
            const spinner = screen.queryByRole("status");
            expect(button).toBeEnabled();
        });
        it("displays mismatch message for password repeat input", async () => {
            await setup();

            await userEvent.type(passwordInput, "P4ss1");
            await userEvent.type(passwordRepeatInput, "P4ss2");
            const text = await screen.findByText("Password mismatch");
            expect(text).toBeInTheDocument();
        })
        it.each `
            field           | message                               | label
            ${'username'}   | ${'Username cannot be null'}          | ${"Username"}
            ${'email'}      | ${'E-mail cannot be null'}            | ${"E-mail"}
            ${'password'}   | ${'Password cannot be null'}          | ${"Password"}
        `("clears validation error after username field is updated", async ({field, message, label}) => {
            server.use(generateValidationError(field, message));

            await setup();

            await userEvent.click(button);

            const text = await screen.findByText(message);
            const input = screen.queryByLabelText(label);
            await userEvent.type(input, "updated")

            expect(text).not.toBeInTheDocument();
        }); 
    });
    describe("internationalization", () => {
        let dutchLanguage, englishLanguage, username, email, password, passwordRepeat, button;
        const setup = () => {
            const app = {
                components: {
                    SignUpPage,
                    LanguageSelector,
                },
                template: `
                    <SignUpPage />
                    <LanguageSelector/>
                `
            };

            render(app, {
                global: {
                    plugins: [i18n]
                }
            });

            dutchLanguage = screen.queryByTitle("Dutch");
            englishLanguage = screen.queryByTitle("English");
            username = screen.queryByLabelText(gb.username);
            email = screen.queryByLabelText(gb.email);
            password = screen.queryByLabelText(gb.password);
            passwordRepeat = screen.queryByLabelText(gb.passwordRepeat);
            button = screen.queryByRole('button', { name: gb.signUp});
        }

        afterEach(() => {
            i18n.global.locale = "gb";
        })

        it("initially displays all text in English", async () => {
            setup();
            // screen.debug();
            expect(screen.queryByRole("heading", { name: gb.signUp})).toBeInTheDocument();
            expect(screen.queryByRole("button", { name: gb.signUp})).toBeInTheDocument();
            expect(screen.queryByLabelText(gb.username)).toBeInTheDocument();
            expect(screen.queryByLabelText(gb.email)).toBeInTheDocument();
            expect(screen.queryByLabelText(gb.password)).toBeInTheDocument();
            expect(screen.queryByLabelText(gb.passwordRepeat)).toBeInTheDocument();
        })
        it("displays all text in Dutch after selecting that language", async () => {
            setup();

            await userEvent.click(dutchLanguage)

            expect(screen.queryByRole("heading", { name: nl.signUp})).toBeInTheDocument();
            expect(screen.queryByRole("button", { name: nl.signUp})).toBeInTheDocument();
            expect(screen.queryByLabelText(nl.username)).toBeInTheDocument();
            expect(screen.queryByLabelText(nl.email)).toBeInTheDocument();
            expect(screen.queryByLabelText(nl.password)).toBeInTheDocument();
            expect(screen.queryByLabelText(nl.passwordRepeat)).toBeInTheDocument();
        })
        it("displays all text in English after all text is translated to Dutch", async () => {
            setup();

            await userEvent.click(dutchLanguage)

            await userEvent.click(englishLanguage)

            expect(screen.queryByRole("heading", { name: gb.signUp})).toBeInTheDocument();
            expect(screen.queryByRole("button", { name: gb.signUp})).toBeInTheDocument();
            expect(screen.queryByLabelText(gb.username)).toBeInTheDocument();
            expect(screen.queryByLabelText(gb.email)).toBeInTheDocument();
            expect(screen.queryByLabelText(gb.password)).toBeInTheDocument();
            expect(screen.queryByLabelText(gb.passwordRepeat)).toBeInTheDocument();
        })
        it("displays password mismatch validation in Dutch", async () => {
            setup();
            await userEvent.click(dutchLanguage);
            await userEvent.type(password, "P4ssword");
            await userEvent.type(passwordRepeat, "N3wP4ss");
            const validation = screen.queryByText(nl.passwordMismatchValidation);
            expect(validation).toBeInTheDocument();
        })
        it("sends accept-language having gb to backend for sign up request", async () => {
            setup();
            await userEvent.type(username, "user1");
            await userEvent.type(email, "user1@mail.com");
            await userEvent.type(password, "P4ssword");
            await userEvent.type(passwordRepeat, "P4ssword");
            await userEvent.click(button);
            await screen.findByText(gb.accountActivationNotification);
            expect(acceptLanguageHeader).toBe("gb");
        })
        it("displays acount activation infomriation in Dutch after selecting that language", async () => {
            setup();
            await userEvent.click(dutchLanguage)

            await userEvent.type(username, "user1");
            await userEvent.type(email, "user1@mail.com");
            await userEvent.type(password, "P4ssword");
            await userEvent.type(passwordRepeat, "P4ssword");

            await userEvent.click(button);
            const text = await screen.findByText(nl.accountActivationNotification);

            expect(text).toBeInTheDocument();
        })
    });
});