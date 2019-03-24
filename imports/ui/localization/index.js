import LocalizedStrings from "react-localization";
import { Meteor } from "meteor/meteor";
import LocaleStrings from "./localestrings";
let strings = new LocalizedStrings(LocaleStrings);

class LocalizationManager {
    constructor(lang) {
        this.strings = strings;
        this.user = "";
        this.language = lang;
    }

    getLanguage() {
        return this.language;
    }

    setLanguageByUserPref(user) {
        try {
            this.user = user ? user : "";
            if (this.user && this.user.profile.langPref) {
                this.language = this.user.profile.langPref;
                this.strings.setLanguage(this.user.profile.langPref);
            }
        } catch (ex) {
            console.log(ex);
        }
    }

    setLanguage(lang) {
        try {
            this.strings.setLanguage(lang);
            this.language = lang;
            Meteor.call(
                "updateLangugagePreferance",
                {
                    language: this.language
                },
                (err, result) => {
                    console.log(result, err);
                }
            );
        } catch (ex) {
            console.log(ex);
        }
    }

    toggle() {
        try {
            console.log(this.language == "en" ? "en=>ar" : "ar=>en");
            this.strings.setLanguage(this.language == "en" ? "ar" : "en");
            this.language = this.language == "en" ? "ar" : "en";
            Meteor.call(
                "updateLangugagePreferance",
                {
                    language: this.language
                },
                (err, result) => {
                    console.log(result, err);
                }
            );
        } catch (ex) {
            console.log(ex);
        }
    }
}

var localizationManager = new LocalizationManager("ar");

export default localizationManager;
