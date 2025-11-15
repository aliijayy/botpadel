/**
* Central place for selectors. Update these if Padel Connect UI changes.
* Prefer data-testid when available.
*/
export const SEL = {
    login: {
        email: 'input[type="email"], #ContentPlaceHolder1_txtEmail, input[name*="Email"]',
        password: 'input[type="password"], #ContentPlaceHolder1_txtPassword, input[name*="Password"]',
        submit: 'button:has-text("Se connecter"), button:has-text("Login"), input[type="submit"], button:has-text("Accès utilisateur")'
    },
    nav: {
        // On this portal, we land directly on the club grid; no global venue search.
        // Date controls vary: try next/prev day buttons and a calendar input.
        dateInput: 'input[type="date"], input.calendar',
        nextDay: 'button[aria-label*="Suiv"], button:has-text(">")',
        prevDay: 'button[aria-label*="Préc"], button:has-text("<")'
    },
    grid: {
        // Court headers often contain "Piste", "Court" or a number. Try multiple keywords.
        courtColumn: (court) => `xpath=//div[contains(@class,'court') or contains(@class,'pista') or contains(@class,'col')][.//text()[contains(.,"${court}")]]`,
        slotButton: (time) => `xpath=//button[contains(.,"${time}") or contains(@aria-label,"${time}")] | //a[contains(.,"${time}")]`,
        confirm: 'button:has-text("Confirmer"), button:has-text("Confirm"), input[type="submit"]:has-text("Confirm")',
        captcha: 'iframe[src*="captcha"], [data-captcha]'
    },
    account: {
        reservationsLink: 'a:has-text("Mes réservations"), a:has-text("My bookings")',
        bookingRow: (dateISO) => `tr:has-text("${dateISO}")`
    },
    feedback: {
        toast: '[role="status"], .toast, [data-testid="toast"]'
    }
};
