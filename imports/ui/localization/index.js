import LocalizedStrings from 'react-localization';
import {
    Meteor
} from "meteor/meteor";

let strings = new LocalizedStrings({
    en: {
        myCards: "My Cards",
        addCards: "Add Card",
        //Already submitted for translation
        loggingOut: "Logging you out",
        Home: "Home",
        Hello: "Hello",
        Register: "Register",
        logout: "Logout",
        Rides: "Rides",
        Ride: "Ride",
        Settings: "Settings",
        paymentStatus: "Payment Status",
        totalDistance: "Total Distance",
        boardingPoint: "Boarding Point",
        droppingPoint: "Dropping Point",
        yourRides: "Your Rides",
        distance: "Distance",
        duration: "Duration",
        editEmail: "Edit E-Mail",
        subscriptions: "Subscriptions",
        subscription: "Subscription",
        price: "Price",
        renewable: "Renewable",
        after: "After",
        days: "days",
        description: "Description",
        callSupport: "Call Support",
        others: "Others",
        driverMode: "Driver Mode",
        userMode: "User Mode",
        at: "at",
        meterShort: "M",
        kilimeterShort: "KM",
        fare: "Fare",
        cash: "Cash",
        Card: "Card",
        book: "Book",
        bookRide: "Book Ride",
        Time: "Time",
        paymentMethod: "Payment Method",
        rideBooked: "Ride Booked",
        rideCompleted: "Ride completed",
        paymentMarked: "Payment Marked",
        onTheWay: "On the way",
        navigateToRider: "Navigate to Rider",
        startRide: "Start Ride",
        finishRide: "Finish Ride",
        bookingID: "Booking ID",
        paymentReceived: "Payment Received",
        rideNotFinished: "Ride is not finished yet!",
        verifyYourEmailAddress: "Visit the following link to verify your email address.",
        confirm: "Confirm",
        on: "on",
        planNotFound: "Plan not found!",
        shouldContainOnlyAlphabets: "Should contain only alphabets",
        shouldContainOnlyNumbers: "Should contain only numbers",
        subscriptionPlansNotAvailable: "No subscription plans available!",
        seeNewRequests: "See new Requests",
        cancelRequest: "Cancel Request",
        subscribe: "Subscribe",
        unableToStartTheRide: "Unable to start the ride!",
        unableToGetSubscriptions: "Unable to get subscriptions!",
        unableToGetPlans: "Unable to get plans!",
        unableToSubscribe: "Unable to subscribe!",
        planSubscribed: "Plan Subscribed!",
        unableToFinishTheRide: "Unable to Finish the ride!",
        unabletoAcceptTheRide: "Unable to accept the ride!",
        unableToGetBooking: "Unable to get booking!",
        rideNotFinishedYet: "Ride not finished yet!",
        waitingForNearbyDriversToAcceptYourRideRequest: "Waiting for nearby drivers to accept your ride request",
        driverAcceptedYourRideRequest: "Driver accepted your ride request",
        unableToFetchDriversNearby: "unable to fetch drivers nearby",
        unableToFetchYourCurrentLocation: "Unable to fetch your current location",
        directionsRequestFailedDueTo: "Directions request failed due to",
        unableToCreateRequest: "Unable to create request!",
        unableToCancelRequest: "unable to cancel request",
        unableToMarkPaymentForTheRide: "Unable to mark payment for the ride!",
        emailVeried: "Congrats...!!! Your email has been verified. You would be automatically redirected to login page in 5 seconds. Else <a href='/login'> Click here </a>",
        linkExpired: "Email id does not match or the link has expired. Kindly try again...",
        waitForValidation: "Hold on... We are validating the email id...",
        emailVerified: "Congrats...!!! Your email has been verified. Redirecting you to login page...",
        someErrorOccured: "Some Error Occured!",
        anErrorOccuredTryAgain: "An error occured.please try again.",
        loginSuccessful: "Login successful!",
        phone: "Phone",
        enterPhoneNumber: "Enter phone number",
        password: "Password",
        login: "Login",
        or: "OR",
        forgotPassword: "Forgot Password",
        signUp: "Sign Up",
        enterLocation: "Enter a location",
        failedSendingCode: "Failed sending code.",
        verificationCodeSent: "Verification code sent!",
        wrongVerificationCode: "Wrong Verification code!",
        emailAlreadyExists: "Email already exists.",
        phoneAlreadyExists: "Phone already exists.",
        accountCreatedSuccessfully: "Account created successfully!",
        createAccount: "Create Account",
        name: "Name",
        verificationCode: "Verification Code",
        unableToFetch: "Unable to fetch!",
        phoneVerificationCode: "Hi, Your phone verification code is",
        changeLanguage: "Switch to ",
        english: "English",
        arabic: "Arabic",
        invalidVerificationLink: "Oooppsss... <br />Seems like the verification link is invalid. <br />",
        redirectionToLogin: "If not redirected in 5 seconds, <Link to='/login'>Click here to login</Link>",
    },
    ar: {
        myCards: "My Cards",
        addCards: "Add Card",
        //Already submitted for translation
        loggingOut: "تسجيل الخروج",
        Home: "الصفحة الرئيسية",
        Hello: "مرحبا",
        Register: "تسجيل",
        logout: "الخروج",
        Rides: "ركوب الخيل",
        Ride: "اركب",
        Settings: "الإعدادات",
        paymentStatus: "حالة السداد",
        totalDistance: "المسافة الكلية",
        boardingPoint: "نقطة الصعود",
        droppingPoint: "نقطة اسقاط",
        yourRides: "ركوب الخيل الخاص بك",
        distance: "مسافه: بعد",
        duration: "المدة الزمنية",
        editEmail: "اديث ايميل",
        subscriptions: "الاشتراكات",
        subscription: "اشتراك",
        price: "السعر",
        renewable: "قابل للتجديد",
        after: "بعد",
        days: "أيام",
        description: "وصف",
        callSupport: "دعم الاتصال",
        others: "الآخرين",
        driverMode: "وضع السائق",
        userMode: "وضع المستخدم",
        at: "في",
        meterShort: "M",
        kilimeterShort: "KM",
        fare: "أجرة",
        cash: "السيولة النقدية",
        Card: "بطاقة",
        book: "كتاب",
        bookRide: "كتاب ركوب",
        Time: "زمن",
        paymentMethod: "طريقة الدفع او السداد",
        rideBooked: "ركوب حجزها",
        rideCompleted: "اكتمل الركوب",
        paymentMarked: "دفع ملحوظ",
        onTheWay: "فى الطريق",
        navigateToRider: "انتقل إلى رايدر",
        startRide: "بدء الركوب",
        finishRide: "الانتهاء من ركوب",
        bookingID: "معرف الحجز",
        paymentReceived: "الدفعة المستلمة",
        rideNotFinished: "لم يتم الانتهاء من ركوب حتى الآن!",
        verifyYourEmailAddress: "قم بزيارة الرابط التالي للتحقق من عنوان بريدك الإلكتروني.",
        confirm: "تؤكد",
        on: "على",
        enterLocation: "أدخل الموقع",
        planNotFound: "الخطة غير موجودة!",
        shouldContainOnlyAlphabets: "يجب أن تحتوي على أحرف أبجدية فقط",
        shouldContainOnlyNumbers: "يجب أن تحتوي على أرقام فقط",
        subscriptionPlansNotAvailable: "لا توجد خطط الاشتراك المتاحة!",
        seeNewRequests: "انظر الطلبات الجديدة",
        cancelRequest: "إلغاء الطلب",
        subscribe: "الاشتراك",
        unableToStartTheRide: "غير قادر على بدء الرحلة!",
        unableToGetSubscriptions: "غير قادر على الحصول على اشتراكات!",
        unableToGetPlans: "غير قادر على الحصول على خطط!",
        unableToSubscribe: "غير قادر على الاشتراك!",
        planSubscribed: "خطة الاشتراك!",
        unableToFinishTheRide: "غير قادر على إنهاء الرحلة!",
        unabletoAcceptTheRide: "غير قادر على قبول الركوب!",
        unableToGetBooking: "غير قادر على الحصول على الحجز!",
        rideNotFinishedYet: "ركوب لم تنته بعد!",
        waitingForNearbyDriversToAcceptYourRideRequest: "انتظار السائقين القريبين لقبول طلب رحلتك",
        driverAcceptedYourRideRequest: "قبل السائق طلب رحلتك",
        unableToFetchDriversNearby: "غير قادر على جلب السائقين في مكان قريب",
        unableToFetchYourCurrentLocation: "غير قادر على جلب موقعك الحالي",
        directionsRequestFailedDueTo: "فشل طلب الاتجاهات بسبب",
        unableToCreateRequest: "غير قادر على إنشاء الطلب!",
        unableToCancelRequest: "غير قادر على إلغاء الطلب",
        unableToMarkPaymentForTheRide: "غير قادر على وضع علامة على الدفع للرحلة!",
        emailVeried: "مبروك...!!! تم التحقق من بريدك الالكتروني. ستتم إعادة توجيهك تلقائيًا إلى صفحة تسجيل الدخول في 5 ثوانٍ. آخر <a href='/login'> انقر هنا </a>",
        linkExpired: "معرف البريد الإلكتروني غير متطابق أو انتهت صلاحية الرابط. يرجى المحاولة مرة أخرى ...",
        waitForValidation: "انتظر ... نحن بصدد التحقق من معرف البريد الإلكتروني ...",
        emailVerified: "مبروك...!!! تم التحقق من بريدك الالكتروني. جارٍ إعادة توجيهك إلى صفحة تسجيل الدخول ...",
        someErrorOccured: "حدث خطأ ما!",
        anErrorOccuredTryAgain: "حدث خطأ. الرجاء المحاولة مرة أخرى.",
        loginSuccessful: "تسجيل الدخول ناجح!",
        phone: "هاتف",
        enterPhoneNumber: "أدخل رقم الهاتف",
        password: "كلمه السر",
        login: "تسجيل الدخول",
        or: "أو",
        forgotPassword: "هل نسيت كلمة المرور",
        signUp: "سجل",
        failedSendingCode: "فشل إرسال الكود.",
        verificationCodeSent: "تم ارسال رمز التأكيد!",
        wrongVerificationCode: "رمز التحقق غير صحيح!",
        emailAlreadyExists: "البريد الالكتروني موجود بالفعل.",
        phoneAlreadyExists: "الهاتف موجود بالفعل.",
        accountCreatedSuccessfully: "الحساب اقيم بنجاح!",
        createAccount: "إنشاء حساب",
        name: "اسم",
        verificationCode: "شيفرة التأكيد",
        unableToFetch: "غير قادر على الجلب!",
        phoneVerificationCode: "مرحبًا ، رمز التحقق عبر الهاتف هو",
        changeLanguage: "التبديل إلى ",
        english: "الإنجليزية",
        arabic: "عربى",
        invalidVerificationLink: "Oooppsss... <br />يبدو أن رابط التحقق غير صالح. <br />",
        redirectionToLogin: "إذا لم تتم إعادة توجيهك خلال 5 ثوان ، <Link to='/login'>انقر هنا لتسجيل الدخول</Link>",
    }
});

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
            console.log("user: ", user);
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
                "updateLangugagePreferance", {
                    language: this.language
                },
                (err, result) => {
                    console.log(result, err)
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
                "updateLangugagePreferance", {
                    language: this.language
                },
                (err, result) => {
                    console.log(result, err)
                }
            );
        } catch (ex) {
            console.log(ex);
        }
    }
}

var localizationManager = new LocalizationManager("ar");

export default localizationManager;