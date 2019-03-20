import LocalizedStrings from "react-localization";
import { Meteor } from "meteor/meteor";

let strings = new LocalizedStrings({
    en: {
        wallet: "Wallet",
        unableToGetWallet: "Unable to fetch wallet!",
        amount: "Amount",
        history: "History",
        somethingWentWrong: "Something went wrong!",
        amountLessThanFare: "Received less amount than the fare!!",
        amountReceived: "Amount Received",
        walletExists: "Wallet already exists!",
        unableToFindWallet: "Unable to find wallet!",
        amountInsufficient: "Amount not sufficient!",
        invalidExpiry: "Invalid expiry month!",
        invalidCardNumber: "Invalid card number!",
        invalidName: "Invalid name!",
        invalidCVV: "Invalid cvv!",
        cardExists: "Card already exists!",
        cardAddedShort: "Card added",
        cardAddedPushNotification: "Your card has been added",
        invalidArguments: "Invalid arguments",
        thankYouForRiding: "Thank you for riding with Hustle",
        loading: "Loading....",
        Dabbab: "Dabbab",
        Pickup: "Pickup",
        Dyna: "Dyna",
        Taxi: "Taxi",
        cashToBeCollected: "Cash to be collected",
        // old strings
        welcomeMessage:
            "Thank you for subscribing dear partner. Good things come to those who Hustle like you!",
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
        Micro: "Micro",
        Mini: "Mini",
        Sedan: "Prime Sedan",
        SUV: "Prime SUV",
        Exec: "Prime Exec",
        Lux: "Prime Lux",
        unableToLoadCards: "Unable to load cards!",
        canNotChangeLocation:
            "Cant change location while raising booking request.",
        kindlySubscribe: "kindly subscribe to book ride",
        defaultLocation: "Default is current location",
        selectLocation: "Select Location",
        preferredCar: "Preferred Car",
        messageFromDriver: "Message From Partner",
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
        rateDriver: "Rate Partner",
        feedbackPlaceHolder: "Put some feedback of the ride",
        submitReview: "Submit Review",
        skip: "Skip",
        carModel: "Car Model",
        carNumber: "Car Number",
        driverReview: "Partner Review",
        chatWithDriver: "Chat with Partner",
        shareLiveLocation: "Share Live Location",
        sos: "SOS",
        unableToFetchDriverDetails: "unable to fetch Partner details",
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
        unableToFetchDriverLocation: "Unable to fetch Partner Location",
        accepted: "accepted",
        started: "started",
        finished: "finished",
        trackRider: "Track Rider",
        noDataFound: "No data found",
        thankYouRideEnded: "The ride has ended, Thanks for using Hustle.",
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
        editProfile: "Edit Profile",
        subscriptions: "Subscriptions",
        subscription: "Subscription",
        price: "Price",
        renewable: "Renewable",
        after: "After",
        days: "days",
        description: "Description",
        desDetails: "with this subscription partners can accept rides",
        callSupport: "Call Support",
        others: "Others",
        driverMode: "Partner Mode",
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
        verifyYourEmailAddress:
            "Visit the following link to verify your email address.",
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
        waitingForNearbyDriversToAcceptYourRideRequest:
            "Waiting for nearby partner to accept your ride request",
        driverAcceptedYourRideRequest: "Partner accepted your ride request",
        unableToFetchDriversNearby: "unable to fetch partner nearby",
        unableToFetchYourCurrentLocation:
            "Unable to fetch your current location",
        directionsRequestFailedDueTo: "Directions request failed due to",
        unableToCreateRequest: "Unable to create request!",
        unableToCancelRequest: "unable to cancel request",
        unableToMarkPaymentForTheRide: "Unable to mark payment for the ride!",
        emailVeried:
            "Congrats...!!! Your email has been verified. You would be automatically redirected to login page in 5 seconds. Else <a href='/login'> Click here </a>",
        linkExpired:
            "Email id does not match or the link has expired. Kindly try again...",
        waitForValidation: "Hold on... We are validating the email id...",
        emailVerified:
            "Congrats...!!! Your email has been verified. Redirecting you to login page...",
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
        invalidVerificationLink:
            "Oooppsss... <br />Seems like the verification link is invalid. <br />",
        redirectionToLogin:
            "If not redirected in 5 seconds, <Link to='/login'>Click here to login</Link>",
        //for text direction (don`t change)
        textDirection: "ltr",
        dlog: "Delivery Of Goods",
        Home: "Home",
        tAction: "Take action",
        arau: "Avg Ratings as User",
        arad: "Avg Ratings as Driver",
        userType: "User Type",
        edit: "Edit",
        editInfo: "Edit Info",
        update: "Update",
        balance: "Balance",
        profile: "Profile",
        email: "Email",
        becomePartner: "Become Partner",
        contact: "Contact",
        dln: "Driving license number",
        apply: "Apply"
    },
    ar: {
        profile: "الملف الشخصي",
        wallet: "المحفظة",
        balance: "الرصيد",
        unableToGetWallet: "Unable to fetch wallet!",
        amount: "Amount",
        history: "السجل",
        somethingWentWrong: "Something went wrong!",
        amountLessThanFare: "Received less amount than the fare!!",
        amountReceived: "Amount Received",
        walletExists: "Wallet already exists!",
        unableToFindWallet: "Unable to find wallet!",
        amountInsufficient: "Amount not sufficient!",
        invalidExpiry: "Invalid expiry month!",
        invalidCardNumber: "Invalid card number!",
        invalidName: "Invalid name!",
        invalidCVV: "Invalid cvv!",
        cardExists: "Card already exists!",
        cardAddedShort: "Card added",
        cardAddedPushNotification: "Your card has been added",
        invalidArguments: "Invalid arguments",
        thankYouForRiding: "Thank you for riding with Hustle",
        loading: "Loading....",
        Dabbab: "Dabbab",
        Pickup: "Pickup",
        Dyna: "Dyna",
        Taxi: "Taxi",
        cashToBeCollected: "Cash to be collected",
        // old strings
        welcomeMessage: "تسجيل الخروج",
        myCards: "بطاقاتي",
        addCards: "إضافةبطاقة",
        addNewCard: "أضف بطاقة جديدة",
        cardNumber: "رقم البطاقة",
        nameOnTheCard: "الاسم على البطاقة",
        cardExpiry: "تاريخ الانتهاء",
        validThru: "صالح من تاريخ",
        cvv: "CVV",
        submit: "تقديم",
        reset: "إعادة تعيين",
        cardAdded: "تسجيل الخروج",
        failedAddingCard: "تسجيل الخروج",
        Micro: "Micro",
        Mini: "Mini",
        Sedan: "Prime Sedan",
        SUV: "Prime SUV",
        Exec: "Prime Exec",
        Lux: "Prime Lux",
        unableToLoadCards: "تسجيل الخروج",
        canNotChangeLocation: "تسجيل الخروج",
        kindlySubscribe: "تسجيل الخروج",
        defaultLocation: "الموقع الحالي",
        selectLocation: "اختر الوجهة",
        preferredCar: "نوعالسيارة",
        messageFromDriver: "تسجيل الخروج",
        subscriptionCancelled: "تسجيل الخروج",
        unableToCancelSubscription: "تسجيل الخروج",
        unexpectedError: "تسجيل الخروج",
        unabbleToReSubscribe: "تسجيل الخروج",
        reSubscribed: "تسجيل الخروج",
        cancelSubscription: "إلغاءالاشتراك",
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
        carModel: "نوع السيارة",
        carNumber: "رقم اللوح",
        driverReview: "تسجيل الخروج",
        chatWithDriver: "تسجيل الخروج",
        shareLiveLocation: "تسجيل الخروج",
        sos: "تسجيل الخروج",
        unableToFetchDriverDetails: "تسجيل الخروج",
        accept: "تسجيل الخروج",
        rideRequests: "المشاويرالمطلوبة",
        noRequests: "لا يوجد طلبات قريبة",
        unknownError: "تسجيل الخروج",
        ongoingBooking: "تسجيل الخروج",
        from: "تسجيل الخروج",
        to: "تسجيل الخروج",
        chatWithRider: "تسجيل الخروج",
        navigateToDrop: "تسجيل الخروج",
        rateRider: "تسجيل الخروج",
        unableToGetContacts: "تسجيل الخروج",
        noExistingContactFound: "لميتمالعثورعلىجهةاتصا",
        internalError: "تسجيل الخروج",
        contactsUpdated: "تسجيل الخروج",
        emergencyContacts: "جهة اتصال الطوارئ",
        phoneNumber: "رقمالجوا",
        addMoreNumbers: "إضافةالمزيدمنالرقام",
        saveNumbers: "حفظالرقام",
        yourCards: "بطاقاتي",
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
        loggingOut: "يتم تسجيل خروجك",
        Home: "الرئيسي",
        Hello: "مرحبا",
        Register: "التسجيل",
        logout: "تسجيل الخروج",
        Rides: "المشاوير",
        Ride: "المشوار",
        Settings: "الأعدادات",
        Home: "الرئيسية",
        paymentStatus: "وضع الدفع",
        totalDistance: "المسافة الكلية",
        boardingPoint: "نقطة الصعود",
        droppingPoint: "مكان الوصول",
        yourRides: "مشاويرك",
        distance: "المسافة",
        duration: "المدة",
        editProfile: "تعديل الملف الشخصي",
        subscriptions: "بطاقاتي",
        subscription: "الأشتراك",
        price: "السعر",
        renewable: "قابل للتجديد",
        after: "بعد",
        days: "يوم",
        description: "الوصف",
        callSupport: "الاتصال بالدعم",
        others: "اخرى",
        driverMode: "وضع الشريك",
        userMode: "وضع الراكب",
        at: "في",
        meterShort: "متر",
        kilimeterShort: "كم",
        fare: "السعر",
        cash: "نقدا",
        Card: "بطاقة",
        book: "أحجز",
        bookRide: "أحجز مشوارك",
        Time: "الزمن",
        paymentMethod: "طريقة الدفع",
        rideBooked: "تم حجز المشوار",
        rideCompleted: "أكتمل المشوار",
        paymentMarked: "تم الدفع",
        onTheWay: "في الطريق",
        navigateToRider: "متجه للراكب",
        startRide: "ابداء المشوار",
        finishRide: "انهاء المشوار",
        bookingID: "هوية الحجز",
        paymentReceived: "تم أستلام المبلغ",
        rideNotFinished: "لالمشوار لم ينتهي بعد",
        verifyYourEmailAddress: "زر الرابط التالي للتحقق من بريدك الألكتروني",
        confirm: "تأكيد",
        on: "علي",
        enterLocation: "ادخل موقعك",
        planNotFound: "الوجهة غير موجودة",
        shouldContainOnlyAlphabets: "يجب ان تحتوي علي حروف فقط",
        shouldContainOnlyNumbers: "يجب ان تحتوي علي ارقام فقط",
        subscriptionPlansNotAvailable: "لا يوجد اشتراك",
        seeNewRequests: "انظر الطلبات الجديدة",
        cancelRequest: "الغي اطلب",
        subscribe: "أشتراك",
        unableToStartTheRide: "غير قادر علي بداء الرحلة",
        unableToGetSubscriptions: "غير قادر علي الحصول علي اشتراكات",
        unableToGetPlans: "غير قادر علي الحصول علي وجهة",
        unableToSubscribe: "غير قادر علي الاشتراك",
        planSubscribed: "أشترك",
        unableToFinishTheRide: "غير قادر علي انهاء الرحلة",
        unabletoAcceptTheRide: "غير قادر علي قبول الرحلة !",
        unableToGetBooking: "غير قادر علي الحصول علي حجز",
        rideNotFinishedYet: "الرحلة لم تنتهي بعد",
        waitingForNearbyDriversToAcceptYourRideRequest:
            "انتظر اقرب سائق لقبول طلب رحلتك",
        driverAcceptedYourRideRequest: "قبل السائق طلب مشوارك",
        unableToFetchDriversNearby: "غير قادر للصول علي سائق قريب",
        unableToFetchYourCurrentLocation:
            "غير قادر علي الحصول علي موقعك الحالي",
        directionsRequestFailedDueTo: "فشل طلب الاتجاه بسسب",
        unableToCreateRequest: "غير قادر علي الطلب",
        unableToCancelRequest: "غير قادر علي الغاء الطلب",
        unableToMarkPaymentForTheRide: "غير قادر علي دفع قيمة المشوار",
        emailVeried:
            "تهانينا ،تم  التحقق من ايميلك.سوف توجه أليا الي صفحة الدخول خلال 5 ثوان . اخر <a href='/login'>  اضغط هنا  </a>",
        linkExpired:
            "هوية البريد الإلكتروني غير مرتبة او انتهت صلاحية الرابط. من فضلك حاول مجددا...",
        waitForValidation: "انتظر التحقق من صلاحية البريد الالكتروني",
        emailVerified:
            "تم التُحقق من عنوان بريدك الالكتروني. تهانينا تجري عملية تحويلك الي صفحة الدخول...",
        someErrorOccured: "حدث خطأ",
        anErrorOccuredTryAgain: "حدث خطأ رجاء حاول مره اخري",
        loginSuccessful: "تم تسجيل الدخول بنجاح",
        phone: "االجوال",
        enterPhoneNumber: "ادخل رقم الجوال",
        password: "الرقم السري",
        login: "تسجيل الدخول",
        or: "او",
        forgotPassword: "نسيت كلمت المرور",
        signUp: "تسجيل جديد",
        failedSendingCode: "فشل ارسال الرمز",
        verificationCodeSent: "تم ارسال رمز التحقق",
        wrongVerificationCode: "رمز تحقق خاطئ",
        emailAlreadyExists: "الايميل مسجل مسبقاً",
        phoneAlreadyExists: "رقم الجوال موجود مسبقا",
        accountCreatedSuccessfully: "تم تسجيل الحساب بنجاح",
        createAccount: "انشاء حساب",
        name: "الأسم",
        verificationCode: "رمز التحقق",
        unableToFetch: "غير قادر علي الوصول",
        phoneVerificationCode: "مرحبا رمز تحقق تلفونك هو",
        changeLanguage: "تغيير الي",
        english: "الأنجليزي",
        arabic: "العربي",
        invalidVerificationLink: "اووو يبدو أن رابط التحقق غير صالح",
        redirectionToLogin:
            "إن لم يكن إعادة توجيه في 5 ثوان, <Link to='/login'>اضغط هنا للدخولn</Link>",
        //for text direction (don`t change)
        textDirection: "rtl",
        dlog: "توصيل البضائع",
        tAction: "إتخاذ الإجراء",
        arau: "متوسط التتقيم كمستخدم",
        arad: "متوسط التتقيم كسائق",
        userType: "نوع المستخدم",
        edit: "تعديل",
        editInfo: "تعديل المعلومات",
        update: "تحديث",
        desDetails: "معالاشتراكيمكنللشركاءاستقبالالمشاوير",
        email: "Email",
        becomePartner: "كن شريكا",
        contact: "جهة اتصال",
        dln: "رقم رخصة القيادة",
        apply: "تطبيق"
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
