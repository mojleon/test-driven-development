import { createI18n } from "vue-i18n";
import gb from "./gb.json";
import nl from "./nl.json";

const i18n = createI18n({
    locale: "gb",
    messages: {
        gb,
        nl
    }
})

export default i18n;