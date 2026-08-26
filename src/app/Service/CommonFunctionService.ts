import { differenceInCalendarDays } from 'date-fns';
import * as CryptoJS from 'crypto-js';

export class CommonFunctionService {

  constructor() { }

  // public commonFunction = new CommonFunctionService(); ......declare this in your ts file

  //// Email Pattern
  // [pattern]="commonFunction.emailpattern"
  // emailpattern =
  //   // /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  //   /^(?!.*\.\.)[a-zA-Z0-9](?!.*_$)[a-zA-Z0-9._%+-]*[a-zA-Z0-9]@[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)*\.[a-zA-Z]{2,63}$/;
  emailpattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9]+(?:-[a-zA-Z0-9]+)*\.[a-zA-Z]{2,}$/;
  //// Name Pattern

  // [pattern]="commonFunction.namepatt"
  namepatt = /[a-zA-Z][a-zA-Z ]+/;
  panPattern = /[A-Z]{5}[0-9]{4}[A-Z]{1}/
  //// Mobile Number Pattern
  // [pattern]="commonFunction.mobpattern"
  panpattern = /[A-Z]{5}[0-9]{4}[A-Z]{1}/
  aadharpattern = /^\d{12}$/
  mobpattern = /^[1-9]\d{9}$/;
  passwordPattern = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*?&]{8,15}$/;
  //// Pincode Pattern
  // pinpatt = /^-?(0|[1-9]\d*)?$/;
  // [pattern]="commonFunction.pinpatt"
  pinpatt = /([1-9]{1}[0-9]{5}|[1-9]{1}[0-9]{3}\\s[0-9]{3})/;

  //// Only Number Pattern
  // [pattern]="commonFunction.onlynumber"
  onlynumber = /^[0-9]*$/;

  ////  Date Format 09/12/2023
  // [nzFormat]="commonFunction.dateFormat"
  dateFormat = 'dd/MM/yyyy';

  ////  Date Format 09/DEC/2023
  // [nzFormat]="commonFunction.dateFormatMMM"
  dateFormatMMM = 'dd/MM/yyyy';

  ////  Month Format DEC
  // [nzFormat]="commonFunction.onlyMonthFormatMMM"
  onlyMonthFormatMMM = 'MM';
  ////  Month DEC/2023
  // [nzFormat]="commonFunction.FormatMMMYYYY"
  FormatMMMYYYY = 'MM/yyyy';

  ////  Month Format 12
  // [nzFormat]="commonFunction.onlyMonthFormatMM"
  onlyMonthFormatMM = 'MM';

  ////  Date & Time Format 09/12/2023 06:22:10
  // [nzFormat]="commonFunction.dateMMTimeSecFormat"
  dateMMTimeSecFormat = 'dd/MM/yyyy HH:mm:ss';

  ////  Date & Time Format 09/DEC/2023 06:22:10
  // [nzFormat]="commonFunction.dateMMMTimeSecFormat"
  dateMMMTimeSecFormat = 'dd/MM/yyyy HH:mm:ss';

  ////  Date & Time Format 09/12/2023 06:22
  // [nzFormat]="commonFunction.dateMMTimeFormat"
  dateMMTimeFormat = 'dd/MM/yyyy HH:mm';

  ////  Date & Time Format 09/DEC/2023 06:22
  // [nzFormat]="commonFunction.dateMMMTimeFormat"
  dateMMMTimeFormat = 'dd/MM/yyyy HH:mm';

  ////  Time Format 06:22:10
  timeFormatSec = 'HH:mm:ss';

  ////  Time Format 06:22
  timeFormat = 'HH:mm';

  //// Account Number Pattern
  // [pattern]="commonFunction.Accountpatt"
  Accountpatt = /^\d{9,18}$/;

  //// IFSC Code Pattern
  // [pattern]="commonFunction.IFSCpatt"
  IFSCpatt = /^[A-Z]{4}0[A-Z0-9]{6}$/;

  //// Pincode Pattern
  // [pattern]="commonFunction.PincodePatt"
  PincodePatt = /^[1-9][0-9]{5}$/;

  //// GST Pattern
  // [pattern]="commonFunction.GSTpattern"
  GSTpattern: RegExp =
    /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;

  //// Pan Card Number Pattern
  // [pattern]="commonFunction.PanPattern"
  PanPattern: RegExp = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;


  // Pattern For Vehical Number
  // [pattern]="commonFunction.vehicleNumberPattern"
  vehicleNumberPattern = /^[A-Z]{2}[0-9]{2}[A-Z]{2}[0-9]{4}$/;
  //// Only number
  omit(event: any) {
    const charCode = event.which ? event.which : event.keyCode;
    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
      return false;
    }
    return true;
  }

  allowOnlyaplhaandnum(event: any) {
    event = event ? event : window.event;
    const charCode = event.which ? event.which : event.keyCode;

    // Check if the character is a letter (A-Z, a-z) or a number (0-9)
    if (
      !(charCode >= 65 && charCode <= 90) && // Uppercase letters (A-Z)
      !(charCode >= 97 && charCode <= 122) && // Lowercase letters (a-z)
      !(charCode >= 48 && charCode <= 57) // Numbers (0-9)
    ) {
      return false; // Block the key press
    }
    return true; // Allow the key press
  }
  passPattern = /^(?=.*[A-Z])(?=.*\d)(?=.*[@!#$%^&*])[A-Za-z\d@!#$%^&*]{8,20}$/
  email = /^(?!.*\.\.)[a-zA-Z0-9](?:[a-zA-Z0-9._%+-]*[a-zA-Z0-9])?@[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?(?:\.[a-zA-Z]{2,})+$/;

  forCostFunction(event: KeyboardEvent) {
    const input = event.target as HTMLInputElement;
    const charCode = event.which ? event.which : event.keyCode;
    const char = String.fromCharCode(charCode);

    // Allow numbers (0-9), dot (.), and control keys (e.g., backspace)
    if (
      (charCode >= 48 && charCode <= 57) || // Numbers 0-9
      charCode === 46 || // Dot (.)
      charCode === 8 || // Backspace
      charCode === 37 || // Left arrow
      charCode === 39 // Right arrow
    ) {
      // Prevent leading dots
      if (char === "." && (!input.value || input.value.includes("."))) {
        return false;
      }

      // Allow only two digits after the dot
      const [integerPart, decimalPart] = input.value.split(".");
      if (decimalPart && decimalPart.length >= 2 && input.selectionStart! > input.value.indexOf(".")) {
        return false;
      }

      return true;
    }

    // Block any other character
    return false;
  }

  handlePaste(event: ClipboardEvent): void {
    // Prevent the default paste behavior
    event.preventDefault();

    const clipboardData = event.clipboardData || (window as any).clipboardData;
    let pastedText = clipboardData.getData('text');

    // Remove any character that is not a digit or a dot.
    // This will filter out special characters and letters.
    pastedText = pastedText.replace(/[^0-9.]/g, '');

    // Ensure there is only one dot:
    const firstDotIndex = pastedText.indexOf('.');
    if (firstDotIndex !== -1) {
      // Keep the first dot and remove any additional dots
      pastedText =
        pastedText.substring(0, firstDotIndex + 1) +
        pastedText.substring(firstDotIndex + 1).replace(/\./g, '');
    }

    // Limit decimals to at most 2 digits if a dot exists.
    if (firstDotIndex !== -1) {
      const [integerPart, decimalPart] = pastedText.split('.');
      if (decimalPart && decimalPart.length > 2) {
        pastedText = integerPart + '.' + decimalPart.substring(0, 2);
      }
    }

    // Now, insert the cleaned text into the input field at the cursor position.
    const input = event.target as HTMLInputElement;
    const start = input.selectionStart || 0;
    const end = input.selectionEnd || 0;
    const originalValue = input.value;
    const newValue = originalValue.substring(0, start) + pastedText + originalValue.substring(end);

    input.value = newValue;

    // Dispatch the input event so Angular updates the model
    input.dispatchEvent(new Event('input'));
  }

  ///Allow only characters
  alphaOnly(event: any) {
    event = event ? event : window.event;
    var charCode = event.which ? event.which : event.keyCode;
    if (
      charCode > 32 &&
      (charCode < 65 || charCode > 90) &&
      (charCode < 97 || charCode > 122)
    ) {
      return false;
    }
    return true;
  }

  decimalpattern = /^\d{0,7}(\.\d{0,2})?$/;



  allowOnly1(event: any) {
    event = event ? event : window.event;
    const charCode = event.which ? event.which : event.keyCode;

    // Check if the character is a letter (A-Z, a-z) or allowed special characters
    if (
      !(charCode >= 65 && charCode <= 90) && // Uppercase letters (A-Z)
      !(charCode >= 97 && charCode <= 122) && // Lowercase letters (a-z)
      !['/', '-', '(', ')', '_', '&'].includes(String.fromCharCode(charCode))
    ) {
      return false; // Block the key press
    }
    return true; // Allow the key press
  }

  allowOnly1Numbers(event: any) {
    event = event ? event : window.event;
    const charCode = event.which ? event.which : event.keyCode;

    // Convert charCode to character
    const charStr = String.fromCharCode(charCode);

    // Check if the character is a letter (A-Z, a-z), a number (0-9), or allowed special characters
    if (
      !(charCode >= 65 && charCode <= 90) && // Uppercase letters (A-Z)
      !(charCode >= 97 && charCode <= 122) && // Lowercase letters (a-z)
      !(charCode >= 48 && charCode <= 57) && // Numbers (0-9)
      !['/', '-', '(', ')', '_', '&'].includes(charStr) // Allowed special characters
    ) {
      event.preventDefault(); // Block the key press
      return false;
    }
    return true; // Allow the key press
  }

  allowOnly2(event: any) {
    event = event ? event : window.event;
    const charCode = event.which ? event.which : event.keyCode;

    // Check if the character is a letter (A-Z, a-z) or allowed special characters
    if (
      !(charCode >= 65 && charCode <= 90) && // Uppercase letters (A-Z)
      !(charCode >= 97 && charCode <= 122) && // Lowercase letters (a-z)
      !['/', '(', ')', '_', '&'].includes(String.fromCharCode(charCode))
    ) {
      return false; // Block the key press
    }
    return true; // Allow the key press
  }
  allowOnly(event: any) {
    event = event ? event : window.event;
    const charCode = event.which ? event.which : event.keyCode;

    // Convert the charCode to its corresponding character
    const char = String.fromCharCode(charCode);

    // Check if the character is a letter (A-Z, a-z), a number (0-9), a space, or an allowed special character
    if (
      !(charCode >= 65 && charCode <= 90) && // Uppercase letters (A-Z)
      !(charCode >= 97 && charCode <= 122) && // Lowercase letters (a-z)
      !(charCode >= 48 && charCode <= 57) && // Numbers (0-9)
      charCode !== 32 && // Space
      !['/', '-', '(', ')', '_', '&', '.', ',', '@'].includes(char) // Allowed special characters
    ) {
      return false; // Block the key press
    }
    return true; // Allow the key press
  }

  address1pattern = /^[a-zA-Z0-9/\-(),:. _&]*$/
  address1Chars(event: KeyboardEvent): void {
    const allowedChars = /^[a-zA-Z0-9/\-(),:. _&]*$/;  // Regex to match allowed characters
    const char = String.fromCharCode(event.charCode);

    // If the character is not allowed, prevent the default action (input)
    if (!allowedChars.test(char)) {
      event.preventDefault();
    }
  }
  validateInput(event: KeyboardEvent): void {
    const allowedPattern = /^[a-zA-Z\s\/\(\)_\-]*$/; // Updated pattern
    const char = String.fromCharCode(event.keyCode || event.which);

    if (!allowedPattern.test(char)) {
      event.preventDefault(); // Prevent invalid characters
    }
  }
  allowBusinessNameChars(event: KeyboardEvent): void {
    const allowedChars = /^[A-Za-z0-9\-_. ()&]+$/;  // Regex to match allowed characters
    const char = String.fromCharCode(event.charCode);

    // If the character is not allowed, prevent the default action (input)
    if (!allowedChars.test(char)) {
      event.preventDefault();
    }
  }

  onlyalpha(event: any) {
    event = event ? event : window.event;
    var charCode = event.which ? event.which : event.keyCode;
    if (
      (charCode >= 65 && charCode <= 90) || // A-Z
      (charCode >= 97 && charCode <= 122) || // a-z
      (charCode >= 32 && charCode <= 47) || // Special characters between space and '/'
      (charCode >= 58 && charCode <= 64) || // Special characters between ':' and '@'
      (charCode >= 91 && charCode <= 96) || // Special characters between '[' and '`'
      (charCode >= 123 && charCode <= 126) // Special characters between '{' and '~'
    ) {
      return true;
    } else {
      return false;
    }
  }


  onlyas(event: any) {
    event = event ? event : window.event;
    var charCode = event.which ? event.which : event.keyCode;
    if ((charCode >= 48 && charCode <= 57) || charCode === 45) {
      return true;
    }
    if (charCode === 46) {
      var input = event.target.value || '';
      if (input.indexOf('.') === -1) {
        return true;
      }
    }
    return false; // Disallowing other characters
  }


  ///// Allow only number and character
  numchar(event: any) {
    const charCode = event.which ? event.which : event.keyCode;
    if (charCode == 32) return true;
    if (48 <= charCode && charCode <= 57) return true;
    if (65 <= charCode && charCode <= 90) return true;
    if (97 <= charCode && charCode <= 122) return true;
    return false;
  }

  ///// Allow only number and character
  omit_special_char(event: any) {
    var k;
    k = event.charCode; //         k = event.keyCode;  (Both can be used)
    return (
      (k > 64 && k < 91) ||
      (k > 96 && k < 123) ||
      k == 8 ||
      k == 32 ||
      (k >= 48 && k <= 57)
    );
  }

  ///// Amount function
  onlynumdotAmount(event: any) {
    event = event ? event : window.event;
    var charCode = event.which ? event.which : event.keyCode;
    var input = event.target.value || '';

    // Allowing digits (0-9)
    if (charCode >= 48 && charCode <= 57) {
      // Prevent input starting with "0" unless followed by a dot (e.g., "0.1")
      if (input === '0') return false;

      // Allow digits after conditions are met
      var dotIndex = input.indexOf('.');
      if (dotIndex !== -1 && input.length - dotIndex > 2) {
        return false; // Allow only two digits after a dot
      }
      return true;
    }

    // Allowing only one dot, not as the first character
    if (charCode === 46) {
      if (input === '' || input.indexOf('.') !== -1) {
        return false; // Disallow dot as the first character or multiple dots
      }
      return true;
    }

    return false; // Disallow other characters
  }

  onlynumdot(event: any) {
    event = event ? event : window.event;
    var charCode = event.which ? event.which : event.keyCode;

    // Allowing digits (0-9)
    if (charCode >= 48 && charCode <= 57) {
      return true;
    }

    // Allowing only one dot
    if (charCode === 46) {
      var input = event.target.value || '';
      if (input.indexOf('.') === -1) {
        return true;
      }
    }

    return false; // Disallowing other characters
  }

  onlynum(event: any) {
    event = event ? event : window.event;
    var charCode = event.which ? event.which : event.keyCode;
    // Allowing digits (0-9)
    if (charCode >= 48 && charCode <= 57) {
      return true;
    }
    return false; // Disallowing other characters
  }
  onlynumdott(event: any) {
    event = event ? event : window.event;
    var charCode = event.which ? event.which : event.keyCode;

    // Allowing digits (0-9)
    if ((charCode >= 48 && charCode <= 57) || charCode === 45) {
      return true;
    }

    // Allowing only one dot
    if (charCode === 46) {
      var input = event.target.value || '';
      if (input.indexOf('.') === -1) {
        return true;
      }
    }

    return false; // Disallowing other characters
  }

  //allow number with -
  omitwithminus(event: any) {
    const charCode = event.which ? event.which : event.keyCode;
    if (charCode !== 45 && (charCode < 48 || charCode > 57)) {
      return false;
    }
    return true;
  }

  // Number with decimal format
  numberWithDecimal(event: any) {
    const charCode = event.which ? event.which : event.keyCode;

    if (
      charCode === 46 && // Decimal point character code
      event.target.value.includes('.')
    ) {
      return false;
    } else if (
      charCode !== 46 && // Decimal point character code
      charCode > 31 &&
      (charCode < 48 || charCode > 57)
    ) {
      return false;
    }

    return true;
  }

  //  Number with decimal & Minus (-) format
  numberWithDecimalWithMinus(event: any) {
    const charCode = event.which ? event.which : event.keyCode;
    const inputValue = event.target.value;

    if (
      (charCode === 46 && inputValue.includes('.')) ||
      (charCode === 45 && inputValue.includes('-'))
    ) {
      return false;
    }

    if (
      charCode !== 46 && // Decimal point character code
      charCode !== 45 && // Minus sign character code
      charCode > 31 &&
      (charCode < 48 || charCode > 57)
    ) {
      return false;
    }
    return true;
  }
  // PockIT@321
  secretKey = '';
  decryptdata(encrypteddata: string): string {
    const bytes = CryptoJS.AES.decrypt(encrypteddata, this.secretKey);
    return bytes.toString(CryptoJS.enc.Utf8);
  }

  encryptdata(data: string): string {
    return CryptoJS.AES.encrypt(data, this.secretKey).toString();
  }
  encryptdatacust(data: any): string {
    const stringData = String(data);
    return CryptoJS.AES.encrypt(stringData, this.secretKey).toString();
  }
  // POCKIT@321
  secretKeys = '';
  encryptdatas(data: any): string {
    const stringData = String(data);
    return CryptoJS.AES.encrypt(stringData, this.secretKeys).toString();
  }

  decryptdata1(encrypteddata: string): string {
    const bytes = CryptoJS.AES.decrypt(encrypteddata, this.secretKeys);
    return bytes.toString(CryptoJS.enc.Utf8);
  }

  //////////Disable After Dates
  disabledAfterDate = (current: Date): boolean =>
    differenceInCalendarDays(current, new Date()) > 0;

  //////////Disable Before Dates
  disabledBeforeDate = (current: Date): boolean =>
    differenceInCalendarDays(current, new Date()) > 0;

  disabledBeforeDatebefore = (current: Date): boolean =>
    differenceInCalendarDays(current, new Date()) < 0;


  onlynumForHours(event: any) {
    event = event ? event : window.event;
    var charCode = event.which ? event.which : event.keyCode;
    // Allowing digits (0-9)
    if (charCode >= 48 && charCode <= 57) {
      return true;
    }
    return false; // Disallowing other characters
  }


  countryCodes = [
    { label: '+91 (India)', value: '+91' },
    { label: '+92 (Pakistan)', value: '+92' },
    { label: '+93 (Afghanistan)', value: '+93' },
    { label: '+94 (Sri Lanka)', value: '+94' },
    { label: '+95 (Myanmar)', value: '+95' },
    { label: '+1 (United States)', value: '+1' },
    { label: '+1-242 (Bahamas)', value: '+1-242' },
    { label: '+1-246 (Barbados)', value: '+1-246' },
    { label: '+1-264 (Anguilla)', value: '+1-264' },
    { label: '+1-268 (Antigua and Barbuda)', value: '+1-268' },
    { label: '+1-284 (British Virgin Islands)', value: '+1-284' },
    { label: '+1-340 (U.S. Virgin Islands)', value: '+1-340' },
    { label: '+1-345 (Cayman Islands)', value: '+1-345' },
    { label: '+1-441 (Bermuda)', value: '+1-441' },
    { label: '+1-473 (Grenada)', value: '+1-473' },
    { label: '+1-649 (Turks and Caicos Islands)', value: '+1-649' },
    { label: '+1-664 (Montserrat)', value: '+1-664' },
    { label: '+1-670 (Northern Mariana Islands)', value: '+1-670' },
    { label: '+1-671 (Guam)', value: '+1-671' },
    { label: '+1-684 (American Samoa)', value: '+1-684' },
    { label: '+1-721 (Sint Maarten)', value: '+1-721' },
    { label: '+1-758 (Saint Lucia)', value: '+1-758' },
    { label: '+1-767 (Dominica)', value: '+1-767' },
    { label: '+1-784 (Saint Vincent and the Grenadines)', value: '+1-784' },
    { label: '+1-787 (Puerto Rico)', value: '+1-787' },
    { label: '+1-809 (Dominican Republic)', value: '+1-809' },
    { label: '+1-829 (Dominican Republic)', value: '+1-829' },
    { label: '+1-849 (Dominican Republic)', value: '+1-849' },
    { label: '+1-868 (Trinidad and Tobago)', value: '+1-868' },
    { label: '+1-869 (Saint Kitts and Nevis)', value: '+1-869' },
    { label: '+1-876 (Jamaica)', value: '+1-876' },
    { label: '+1-939 (Puerto Rico)', value: '+1-939' },
    { label: '+20 (Egypt)', value: '+20' },
    { label: '+211 (South Sudan)', value: '+211' },
    { label: '+212 (Morocco)', value: '+212' },
    { label: '+213 (Algeria)', value: '+213' },
    { label: '+216 (Tunisia)', value: '+216' },
    { label: '+218 (Libya)', value: '+218' },
    { label: '+220 (Gambia)', value: '+220' },
    { label: '+221 (Senegal)', value: '+221' },
    { label: '+222 (Mauritania)', value: '+222' },
    { label: '+223 (Mali)', value: '+223' },
    { label: '+224 (Guinea)', value: '+224' },
    { label: '+225 (Ivory Coast)', value: '+225' },
    { label: '+226 (Burkina Faso)', value: '+226' },
    { label: '+227 (Niger)', value: '+227' },
    { label: '+228 (Togo)', value: '+228' },
    { label: '+229 (Benin)', value: '+229' },
    { label: '+230 (Mauritius)', value: '+230' },
    { label: '+231 (Liberia)', value: '+231' },
    { label: '+232 (Sierra Leone)', value: '+232' },
    { label: '+233 (Ghana)', value: '+233' },
    { label: '+234 (Nigeria)', value: '+234' },
    { label: '+235 (Chad)', value: '+235' },
    { label: '+236 (Central African Republic)', value: '+236' },
    { label: '+237 (Cameroon)', value: '+237' },
    { label: '+238 (Cape Verde)', value: '+238' },
    { label: '+239 (Sao Tome and Principe)', value: '+239' },
    { label: '+240 (Equatorial Guinea)', value: '+240' },
    { label: '+241 (Gabon)', value: '+241' },
    { label: '+242 (Republic of the Congo)', value: '+242' },
    { label: '+243 (Democratic Republic of the Congo)', value: '+243' },
    { label: '+244 (Angola)', value: '+244' },
    { label: '+245 (Guinea-Bissau)', value: '+245' },
    { label: '+246 (British Indian Ocean Territory)', value: '+246' },
    { label: '+248 (Seychelles)', value: '+248' },
    { label: '+249 (Sudan)', value: '+249' },
    { label: '+250 (Rwanda)', value: '+250' },
    { label: '+251 (Ethiopia)', value: '+251' },
    { label: '+252 (Somalia)', value: '+252' },
    { label: '+253 (Djibouti)', value: '+253' },
    { label: '+254 (Kenya)', value: '+254' },
    { label: '+255 (Tanzania)', value: '+255' },
    { label: '+256 (Uganda)', value: '+256' },
    { label: '+257 (Burundi)', value: '+257' },
    { label: '+258 (Mozambique)', value: '+258' },
    { label: '+260 (Zambia)', value: '+260' },
    { label: '+261 (Madagascar)', value: '+261' },
    { label: '+262 (Reunion)', value: '+262' },
    { label: '+263 (Zimbabwe)', value: '+263' },
    { label: '+264 (Namibia)', value: '+264' },
    { label: '+265 (Malawi)', value: '+265' },
    { label: '+266 (Lesotho)', value: '+266' },
    { label: '+267 (Botswana)', value: '+267' },
    { label: '+268 (Eswatini)', value: '+268' },
    { label: '+269 (Comoros)', value: '+269' },
    { label: '+27 (South Africa)', value: '+27' },
    { label: '+290 (Saint Helena)', value: '+290' },
    { label: '+291 (Eritrea)', value: '+291' },
    { label: '+297 (Aruba)', value: '+297' },
    { label: '+298 (Faroe Islands)', value: '+298' },
    { label: '+299 (Greenland)', value: '+299' },
    { label: '+30 (Greece)', value: '+30' },
    { label: '+31 (Netherlands)', value: '+31' },
    { label: '+32 (Belgium)', value: '+32' },
    { label: '+33 (France)', value: '+33' },
    { label: '+34 (Spain)', value: '+34' },
    { label: '+350 (Gibraltar)', value: '+350' },
    { label: '+351 (Portugal)', value: '+351' },
    { label: '+352 (Luxembourg)', value: '+352' },
    { label: '+353 (Ireland)', value: '+353' },
    { label: '+354 (Iceland)', value: '+354' },
    { label: '+355 (Albania)', value: '+355' },
    { label: '+356 (Malta)', value: '+356' },
    { label: '+357 (Cyprus)', value: '+357' },
    { label: '+358 (Finland)', value: '+358' },
    { label: '+359 (Bulgaria)', value: '+359' },
    { label: '+36 (Hungary)', value: '+36' },
    { label: '+370 (Lithuania)', value: '+370' },
    { label: '+371 (Latvia)', value: '+371' },
    { label: '+372 (Estonia)', value: '+372' },
    { label: '+373 (Moldova)', value: '+373' },
    { label: '+374 (Armenia)', value: '+374' },
    { label: '+375 (Belarus)', value: '+375' },
    { label: '+376 (Andorra)', value: '+376' },
    { label: '+377 (Monaco)', value: '+377' },
    { label: '+378 (San Marino)', value: '+378' },
    { label: '+379 (Vatican City)', value: '+379' },
    { label: '+380 (Ukraine)', value: '+380' },
    { label: '+381 (Serbia)', value: '+381' },
    { label: '+382 (Montenegro)', value: '+382' },
    { label: '+383 (Kosovo)', value: '+383' },
    { label: '+385 (Croatia)', value: '+385' },
    { label: '+386 (Slovenia)', value: '+386' },
    { label: '+387 (Bosnia and Herzegovina)', value: '+387' },
    { label: '+389 (North Macedonia)', value: '+389' },
    { label: '+39 (Italy)', value: '+39' },
    { label: '+40 (Romania)', value: '+40' },
    { label: '+41 (Switzerland)', value: '+41' },
    { label: '+420 (Czech Republic)', value: '+420' },
    { label: '+421 (Slovakia)', value: '+421' },
    { label: '+423 (Liechtenstein)', value: '+423' },
    { label: '+43 (Austria)', value: '+43' },
    { label: '+44 (United Kingdom)', value: '+44' },
    { label: '+44-1481 (Guernsey)', value: '+44-1481' },
    { label: '+44-1534 (Jersey)', value: '+44-1534' },
    { label: '+44-1624 (Isle of Man)', value: '+44-1624' },
    { label: '+45 (Denmark)', value: '+45' },
    { label: '+46 (Sweden)', value: '+46' },
    { label: '+47 (Norway)', value: '+47' },
    { label: '+48 (Poland)', value: '+48' },
    { label: '+49 (Germany)', value: '+49' },
    { label: '+500 (Falkland Islands)', value: '+500' },
    { label: '+501 (Belize)', value: '+501' },
    { label: '+502 (Guatemala)', value: '+502' },
    { label: '+503 (El Salvador)', value: '+503' },
    { label: '+504 (Honduras)', value: '+504' },
    { label: '+505 (Nicaragua)', value: '+505' },
    { label: '+506 (Costa Rica)', value: '+506' },
    { label: '+507 (Panama)', value: '+507' },
    { label: '+508 (Saint Pierre and Miquelon)', value: '+508' },
    { label: '+509 (Haiti)', value: '+509' },
    { label: '+51 (Peru)', value: '+51' },
    { label: '+52 (Mexico)', value: '+52' },
    { label: '+53 (Cuba)', value: '+53' },
    { label: '+54 (Argentina)', value: '+54' },
    { label: '+55 (Brazil)', value: '+55' },
    { label: '+56 (Chile)', value: '+56' },
    { label: '+57 (Colombia)', value: '+57' },
    { label: '+58 (Venezuela)', value: '+58' },
    { label: '+590 (Guadeloupe)', value: '+590' },
    { label: '+591 (Bolivia)', value: '+591' },
    { label: '+592 (Guyana)', value: '+592' },
    { label: '+593 (Ecuador)', value: '+593' },
    { label: '+594 (French Guiana)', value: '+594' },
    { label: '+595 (Paraguay)', value: '+595' },
    { label: '+596 (Martinique)', value: '+596' },
    { label: '+597 (Suriname)', value: '+597' },
    { label: '+598 (Uruguay)', value: '+598' },
    { label: '+599 (Netherlands Antilles)', value: '+599' },
    { label: '+60 (Malaysia)', value: '+60' },
    { label: '+61 (Australia)', value: '+61' },
    { label: '+62 (Indonesia)', value: '+62' },
    { label: '+63 (Philippines)', value: '+63' },
    { label: '+64 (New Zealand)', value: '+64' },
    { label: '+65 (Singapore)', value: '+65' },
    { label: 'Thailand (+66)', value: '+66' },
    { label: 'Timor-Leste (+670)', value: '+670' },
    { label: 'Australian External Territories (+672)', value: '+672' },
    { label: 'Brunei (+673)', value: '+673' },
    { label: 'Nauru (+674)', value: '+674' },
    { label: 'Papua New Guinea (+675)', value: '+675' },
    { label: 'Tonga (+676)', value: '+676' },
    { label: 'Solomon Islands (+677)', value: '+677' },
    { label: 'Vanuatu (+678)', value: '+678' },
    { label: 'Fiji (+679)', value: '+679' },
    { label: 'Palau (+680)', value: '+680' },
    { label: 'Wallis and Futuna (+681)', value: '+681' },
    { label: 'Cook Islands (+682)', value: '+682' },
    { label: 'Niue (+683)', value: '+683' },
    { label: 'Samoa (+685)', value: '+685' },
    { label: 'Kiribati (+686)', value: '+686' },
    { label: 'New Caledonia (+687)', value: '+687' },
    { label: 'Tuvalu (+688)', value: '+688' },
    { label: 'French Polynesia (+689)', value: '+689' },
    { label: 'Tokelau (+690)', value: '+690' },
    { label: 'Micronesia (+691)', value: '+691' },
    { label: 'Marshall Islands (+692)', value: '+692' },
    { label: 'Russia (+7)', value: '+7' },
    { label: 'Kazakhstan (+7)', value: '+7' },
    { label: 'Japan (+81)', value: '+81' },
    { label: 'South Korea (+82)', value: '+82' },
    { label: 'Vietnam (+84)', value: '+84' },
    { label: 'North Korea (+850)', value: '+850' },
    { label: 'Hong Kong (+852)', value: '+852' },
    { label: 'Macau (+853)', value: '+853' },
    { label: 'Cambodia (+855)', value: '+855' },
    { label: 'Laos (+856)', value: '+856' },
    { label: 'China (+86)', value: '+86' },
    { label: 'Bangladesh (+880)', value: '+880' },
    { label: 'Taiwan (+886)', value: '+886' },
    { label: 'Turkey (+90)', value: '+90' },
    { label: 'Maldives (+960)', value: '+960' },
    { label: 'Lebanon (+961)', value: '+961' },
    { label: 'Jordan (+962)', value: '+962' },
    { label: 'Syria (+963)', value: '+963' },
    { label: 'Iraq (+964)', value: '+964' },
    { label: 'Kuwait (+965)', value: '+965' },
    { label: 'Saudi Arabia (+966)', value: '+966' },
    { label: 'Yemen (+967)', value: '+967' },
    { label: 'Oman (+968)', value: '+968' },
    { label: 'Palestine (+970)', value: '+970' },
    { label: 'United Arab Emirates (+971)', value: '+971' },
    { label: 'Israel (+972)', value: '+972' },
    { label: 'Bahrain (+973)', value: '+973' },
    { label: 'Qatar (+974)', value: '+974' },
    { label: 'Bhutan (+975)', value: '+975' },
    { label: 'Mongolia (+976)', value: '+976' },
    { label: 'Nepal (+977)', value: '+977' },
    { label: 'Iran (+98)', value: '+98' },
    { label: 'Tajikistan (+992)', value: '+992' },
    { label: 'Turkmenistan (+993)', value: '+993' },
    { label: 'Azerbaijan (+994)', value: '+994' },
    { label: 'Georgia (+995)', value: '+995' },
    { label: 'Kyrgyzstan (+996)', value: '+996' },
    { label: 'Uzbekistan (+998)', value: '+998' },
  ];

  //allow numbers with 10 min interval
  onlynumwith10mininterval(event: any) {
    const char = String.fromCharCode(event.which || event.keyCode);
    const inputValue = (event.target as HTMLInputElement).value + char;
    event = event ? event : window.event;
    var charCode = event.which ? event.which : event.keyCode;
    // Allowing digits (0-9)
    if (charCode >= 48 && charCode <= 57)
      if (parseInt(inputValue) > 10) {
        if (parseInt(inputValue) % 10 == 0) {
          return true;
        } else {
          return false;
        }
      } else return true;

    return false;
  }

  validateInput1(event: KeyboardEvent): void {
    const allowedPattern = /^[a-zA-Z\s/_()\-&]$/;
    const char = event.key;

    if (!allowedPattern.test(char)) {
      event.preventDefault();
    }
  }


  trimTextRegex(text: any) {
    return text.replace(/^\s+|\s+$/g, "");
  }

  allowAlphanumericAndSymbols(event: KeyboardEvent): void {
    const allowedRegex = /^[a-zA-Z0-9_-]$/;

    if (!allowedRegex.test(event.key)) {
      event.preventDefault(); // Block the character if it doesn't match the pattern
    }
  }

  sanitizeInput(value: any): any {
    // Allow only letters, numbers, spaces, /, -, _, and ,
    return value.replace(/[^a-zA-Z0-9\s\/\-,_]/g, '');
  }

  convertHtmlToPlainText(html: any): any {
    if (!html) return '';
    const doc = new DOMParser().parseFromString(html, 'text/html');
    var text: any = doc.body.textContent || '';
    // Normalize accented/fancy unicode to plain ASCII
    text = text.normalize('NFKD').replace(/[^\x00-\x7F]/g, '');
    return text.trim();
  }
}