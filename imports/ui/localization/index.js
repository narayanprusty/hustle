import LocalizedStrings from "react-localization";
import {
    Meteor
} from "meteor/meteor";

let strings = new LocalizedStrings({
    en: {
        myCards: "My Cards",
        addCards: "Add Card",
        addNewCard: "Add new card",
        cardNumber: "Card Number",
        nameOnTheCard: "Name on the card",
        cardExpiry: "Card expiry",
        validThru: "Valid Thru",
        cvv: "CVV",
        submit: "Submit",
        reset: "Reset",
        cardAdded: "Card added successfully!",
        failedAddingCard: "Failed adding card.",
        micro: "Micro",
        mini: "Mini",
        primeSedan: "Prime Sedan",
        primeSUV: "Prime SUV",
        primeExec: "Prime Exec",
        primeLux: "Prime Lux",
        unableToLoadCards: "Unable to load cards!",
        canNotChangeLocation: "Cant change location while raising booking request.",
        kindlySubscribe: "kindly subscribe to book ride",
        defaultLocation: "Default is current location",
        selectLocation: "Select Location",
        preferredCar: "Preferred Car",
        messageFromDriver: "Message From Driver",
        subscriptionCancelled: "Subscription cancelled successfully!",
        unableToCancelSubscription: "Unable to cancel subscription!",
        unexpectedError: "Unexpected Error Occured!",
        unabbleToReSubscribe: "Unable to re-subscribe!",
        reSubscribed: "Successfully re-subscribed to the plan!",
        cancelSubscription: "Cancel Subscription",
        reSubscribe: "Re-subscribe",
        newMessage: "You have a new message",
        failedToUpdateReview: "failed to update the review",
        reviewSubmitted: "Review submitted, Thank you.",
        linkCopied: "Link Copied",
        unableToMakeRequest: "Unable to make the request!",
        sosSuccess: "SOS request success!",
        ongoingRide: "Ongoing Ride",
        totalFare: "Total Fare",
        rateDriver: "Rate Driver",
        feedbackPlaceHolder: "Put some feedback of the ride",
        submitReview: "Submit Review",
        skip: "Skip",
        carModel: "Car Model",
        carNumber: "Car Number",
        driverReview: "Driver Review",
        chatWithDriver: "Chat with Driver",
        shareLiveLocation: "Share Live Location",
        sos: "SOS",
        unableToFetchDriverDetails: "unable to fetch driver details",
        accept: "Accept",
        rideRequests: "Ride Requests",
        noRequests: "Currently no requests nearby",
        unknownError: "Unknown error occurred",
        ongoingBooking: "Ongoing Booking",
        from: "From",
        to: "To",
        chatWithRider: "Chat with Rider",
        navigateToDrop: "Navigate to drop",
        rateRider: "Rate Rider",
        unableToGetContacts: "Unable to get contacts!",
        noExistingContactFound: "No existing contact found!",
        internalError: "Internal Error",
        contactsUpdated: "Contacts Updated",
        emergencyContacts: "Emergency Contacts",
        phoneNumber: "Phone Number",
        addMoreNumbers: "Add More Numbers",
        saveNumbers: "Save Numbers",
        yourCards: "Your Cards",
        noCardsAvailable: "No cards available",
        unableToFetchUserDetails: "Unable to fetch user details",
        pending: "pending",
        confirmed: "confirmed",
        noTrackingRecordFound: "No tracking record found",
        unableToFetchDriverLocation: "Unable to fetch driver Location",
        accepted: "accepted",
        started: "started",
        finished: "finished",
        trackRider: "Track Rider",
        noDataFound: "No data found",
        thankYouRideEnded: "The ride has ended, Thanks for using Hustle.",
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
        redirectionToLogin: "If not redirected in 5 seconds, <Link to='/login'>Click here to login</Link>"
    },
    ar: {
        myCards: "تسجيل الخروج",
        addCards: "تسجيل الخروج",
        addNewCard: "تسجيل الخروج",
        cardNumber: "تسجيل الخروج",
        nameOnTheCard: "تسجيل الخروج",
        cardExpiry: "تسجيل الخروج",
        validThru: "تسجيل الخروج",
        cvv: "تسجيل الخروج",
        submit: "تسجيل الخروج",
        reset: "تسجيل الخروج",
        cardAdded: "تسجيل الخروج",
        failedAddingCard: "تسجيل الخروج",
        micro: "تسجيل الخروج",
        mini: "تسجيل الخروج",
        primeSedan: "تسجيل الخروج",
        primeSUV: "تسجيل الخروج",
        primeExec: "تسجيل الخروج",
        primeLux: "تسجيل الخروج",
        unableToLoadCards: "تسجيل الخروج",
        canNotChangeLocation: "تسجيل الخروج",
        kindlySubscribe: "تسجيل الخروج",
        defaultLocation: "تسجيل الخروج",
        selectLocation: "تسجيل الخروج",
        preferredCar: "تسجيل الخروج",
        messageFromDriver: "تسجيل الخروج",
        subscriptionCancelled: "تسجيل الخروج",
        unableToCancelSubscription: "تسجيل الخروج",
        unexpectedError: "تسجيل الخروج",
        unabbleToReSubscribe: "تسجيل الخروج",
        reSubscribed: "تسجيل الخروج",
        cancelSubscription: "تسجيل الخروج",
        reSubscribe: "تسجيل الخروج",
        newMessage: "تسجيل الخروج",
        failedToUpdateReview: "تسجيل الخروج",
        reviewSubmitted: "تسجيل الخروج",
        linkCopied: "تسجيل الخروج",
        unableToMakeRequest: "تسجيل الخروج",
        sosSuccess: "تسجيل الخروج",
        ongoingRide: "تسجيل الخروج",
        totalFare: "تسجيل الخروج",
        rateDriver: "تسجيل الخروج",
        feedbackPlaceHolder: "تسجيل الخروج",
        submitReview: "تسجيل الخروج",
        skip: "تسجيل الخروج",
        carModel: "تسجيل الخروج",
        carNumber: "تسجيل الخروج",
        driverReview: "تسجيل الخروج",
        chatWithDriver: "تسجيل الخروج",
        shareLiveLocation: "تسجيل الخروج",
        sos: "تسجيل الخروج",
        unableToFetchDriverDetails: "تسجيل الخروج",
        accept: "تسجيل الخروج",
        rideRequests: "تسجيل الخروج",
        noRequests: "تسجيل الخروج",
        unknownError: "تسجيل الخروج",
        ongoingBooking: "تسجيل الخروج",
        from: "تسجيل الخروج",
        to: "تسجيل الخروج",
        chatWithRider: "تسجيل الخروج",
        navigateToDrop: "تسجيل الخروج",
        rateRider: "تسجيل الخروج",
        unableToGetContacts: "تسجيل الخروج",
        noExistingContactFound: "تسجيل الخروج",
        internalError: "تسجيل الخروج",
        contactsUpdated: "تسجيل الخروج",
        emergencyContacts: "تسجيل الخروج",
        phoneNumber: "تسجيل الخروج",
        addMoreNumbers: "تسجيل الخروج",
        saveNumbers: "تسجيل الخروج",
        yourCards: "تسجيل الخروج",
        noCardsAvailable: "تسجيل الخروج",
        unableToFetchUserDetails: "تسجيل الخروج",
        pending: "تسجيل الخروج",
        confirmed: "تسجيل الخروج",
        noTrackingRecordFound: "تسجيل الخروج",
        unableToFetchDriverLocation: "تسجيل الخروج",
        accepted: "تسجيل الخروج",
        started: "تسجيل الخروج",
        finished: "تسجيل الخروج",
        trackRider: "تسجيل الخروج",
        noDataFound: "تسجيل الخروج",
        thankYouRideEnded: "تسجيل الخروج",
        //Already submitted for translation
        loggingOut: "تسجيل الخروج",
        Home: "الصفحة الرئيسية",
        Hello: "تسجيل",
        Register: "تسجيل",
        logout: "تسجيل الخروج",
        Rides: "مشاوير",
        Ride: "مشوار",
        Settings: "الإعدادات",
        paymentStatus: "حالة السداد",
        totalDistance: "المسافة الكلية",
        boardingPoint: "نقطة الصعود",
        droppingPoint: "نقطة النزول",
        yourRides: "مشوارك",
        distance: "المسافة",
        duration: " المدة الزمنية",
        editEmail: "تعديل الإيميل",
        subscriptions: "اشتراكات",
        subscription: "اشتراك",
        price: "السعر",
        renewable: "قابل للتجديد",
        after: "بعد",
        days: "أيام",
        description: "وصف",
        callSupport: " الاتصال بالدعم",
        others: "اخرى",
        driverMode: "للكباتن",
        userMode: "نمط الراكب",
        at: "في",
        meterShort: "متر",
        kilimeterShort: "كيلومتر",
        fare: "الأجرة",
        cash: "نقدا",
        Card: "بطاقة",
        book: "أحجز",
        bookRide: "أحجز مشوارك",
        Time: "الوقت",
        paymentMethod: "طريقة الدفع",
        rideBooked: "تم حجز المشوار",
        rideCompleted: "انتهي المشوار",
        paymentMarked: "تم السداد",
        onTheWay: "في الطريق",
        navigateToRider: "ابحث عن مشوارك",
        startRide: "أبداء المشوار",
        finishRide: "نهي المشوار",
        bookingID: "رقم الحجز",
        paymentReceived: "تم استلام المبلغ ",
        rideNotFinished: "مشوارك لم ينتهي بعد",
        verifyYourEmailAddress: "ادخل علي الموقع الاتي لتأكيد البريد الالكتروني",
        confirm: "تأكيد",
        on: "على",
        enterLocation: "ادخل الموقع",
        planNotFound: "لم يتم العثور على الوجهة",
        shouldContainOnlyAlphabets: "يجب ان يحتوي على الحروف الابجدية فقط ",
        shouldContainOnlyNumbers: "يجب ان يحتوي على ارقام فقط ",
        subscriptionPlansNotAvailable: "لا يوجد اشتراك",
        seeNewRequests: "انظر للطلبات الجديدة",
        cancelRequest: "إلغاء الطلب",
        subscribe: "اشترك",
        unableToStartTheRide: "غير قادر على بداء المشوار",
        unableToGetSubscriptions: "غير قادر للحصول على الاشتراكات",
        unableToGetPlans: "غير قادر للحصول على وجهة",
        unableToSubscribe: "غير قادر على الاشتراك",
        planSubscribed: "خطة او طريقة الاشتراك",
        unableToFinishTheRide: "غير قادر على انهاء المشوار",
        unabletoAcceptTheRide: "غير قادر على قبول المشوار",
        unableToGetBooking: "غير قادر الحصول على حجز",
        rideNotFinishedYet: "المشوار لم ينتهي بعد",
        waitingForNearbyDriversToAcceptYourRideRequest: "انتظر اقرب سائق لقبول طلبك",
        driverAcceptedYourRideRequest: "السائق قبل طلبك",
        unableToFetchDriversNearby: "غير قادر على إيجاد السائقين القريبين منك",
        unableToFetchYourCurrentLocation: "لم يستطع إيجاد موقعك الصحيح",
        directionsRequestFailedDueTo: "فشل طلب الوجهات بسبب",
        unableToCreateRequest: "غير قادر على انشاء الطلب",
        unableToCancelRequest: "غير قادر علي الغاء الطلب",
        unableToMarkPaymentForTheRide: "غير قادر على وضع سعر المشوار",
        emailVeried: "مبروك!!! تم تفعيل بريدك الإلكتروني سوف يتم توجيهك تلقائيا لصفحة التسجيل in 5 seconds. Else <a href='/login'> Click here </a> في غصون خمس ثواني -  شي اخر او أخرى او شي ثاني – هنا – دخول – اضغط هنا",
        linkExpired: "البريد الإلكتروني غير مطابق او انتهت صلاحية  الرابط . فضلا حاول مرة أخري ",
        waitForValidation: " انتظر ... نقوم بالتحقق من بريدك الإلكتروني ",
        emailVerified: "لقد تم التحقق من بريدك الالكتروني سيتم إعادة توجيهك او نقلك الى صفحة تسجيل الدخول ...تهانينا ",
        someErrorOccured: "حدث خطأ",
        anErrorOccuredTryAgain: "حدث خطأ الرجاء المحاولة مره أخرى ",
        loginSuccessful: "تم التسجيل بنجاح ",
        phone: "الهاتف",
        enterPhoneNumber: "ادخل رقم الجوال",
        password: "الرقم السري",
        login: "الدخول",
        or: "او",
        forgotPassword: "نسيت الرقم السري ",
        signUp: "تسجيل الدخول",
        failedSendingCode: "فشل في إرسال الرمز",
        verificationCodeSent: "تم ارسال رمز التحقق",
        wrongVerificationCode: "رمز التحقق غير صحيح",
        emailAlreadyExists: "البريد الإلكتروني موجود من قبل ",
        phoneAlreadyExists: "رقم الجوال موجود من قبل",
        accountCreatedSuccessfully: "تم انشاء حسابك بنجاح",
        createAccount: "انشاء حساب ",
        name: "الاسم",
        verificationCode: "رمز التحقق",
        unableToFetch: "غير قادر على الجلب",
        phoneVerificationCode: "مرحبا رمز التحقق بهاتفك هو",
        changeLanguage: "التبديل إلى ",
        english: "الإنجليزية",
        arabic: "عربى",
        invalidVerificationLink: "يبدو أن رابط التحقق غير صالح خطأ ",
        redirectionToLogin: "يبدو ان رابط التحقق غير صالح إذا لم تتم إعادة توجيهك خلال 5 ثوان",
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
                "updateLangugagePreferance", {
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
