import Payment from 'payment'
import localizationManager from '../../localization/index';

function clearNumber(value = '') {
    return value.replace(/\D+/g, '')
}

export function formatCreditCardNumber(value) {
    if (!value || localizationManager.strings.textDirection == 'rtl') {
        return value
    }

    const issuer = Payment.fns.cardType(value);
    const clearValue = clearNumber(value);
    let nextValue;

    switch (issuer) {
        case 'amex':
            nextValue = `${clearValue.slice(0, 4)} ${clearValue.slice(
        4,
        10
      )} ${clearValue.slice(10, 15)}`
            break
        case 'dinersclub':
            nextValue = `${clearValue.slice(0, 4)} ${clearValue.slice(
        4,
        10
      )} ${clearValue.slice(10, 14)}`
            break
        default:
            nextValue = `${clearValue.slice(0, 4)} ${clearValue.slice(
        4,
        8
      )} ${clearValue.slice(8, 12)} ${clearValue.slice(12, 19)}`
            break
    }

    let val = nextValue.trim().length > 19 ? nextValue.trim().slice(0, 19) : nextValue.trim();
    return val.trim()
}

export function formatCVC(value, prevValue, allValues = {}) {
    const clearValue = clearNumber(value)
    let maxLength = 4

    if (allValues.number) {
        const issuer = Payment.fns.cardType(allValues.number)
        maxLength = issuer === 'amex' ? 4 : 3
    }
    let cvc = clearValue.slice(0, maxLength);
    return cvc;
}

export function formatExpirationDate(value) {
    const clearValue = clearNumber(value)

    if (clearValue.length >= 3) {
        return `${clearValue.slice(0, 2)}/${clearValue.slice(2, 4)}`
    }

    return clearValue
}