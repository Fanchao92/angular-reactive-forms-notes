import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, AbstractControl, ValidatorFn, FormArray } from '@angular/forms';

import 'rxjs/add/operator/debounceTime';

import { Customer } from './customer';

// NOTE: Any code using Angular reactive forms should import ReactiveFormsModule in the module file.
/* NOTE: To update form input values from component, we should use setValue() or patchValue().
   https://angular.io/api/forms/FormGroup#setValue
   https://angular.io/api/forms/FormGroup#patchValue
*/

function emailMatcher(c: AbstractControl): {[key: string]: boolean} | null {
    let emailControl = c.get('email');
    let confirmControl = c.get('confirmEmail');

    if (emailControl.pristine || confirmControl.pristine) {
      return null;
    }

    if (emailControl.value === confirmControl.value) {
        return null;
    }
    return { 'match': true };
 }

/* NOTE:
Custom Validator:
https://alligator.io/angular/reactive-forms-custom-validator/
https://codecraft.tv/courses/angular/advanced-topics/basic-custom-validators/
The validator function takes a FormControl or a FormGroup (More generally, a AbstractControl object).
It returns either an object that contains the failure reason and message.
Or a null value that indicates the validation succeeds.

A validator function only takes an AbstractControl object as input. To take multiple inputs,
we should define a factory function that returns a validator function.
*/
function ratingRange(min: number, max: number): ValidatorFn {
    return  (c: AbstractControl): {[key: string]: boolean} | null => {
        if (c.value !== undefined && (isNaN(c.value) || c.value < min || c.value > max)) {
            return { 'range': true };
        };
        return null;
    };
}

@Component({
    selector: 'my-signup',
    templateUrl: './app/customers/customer.component.html'
})
export class CustomerComponent implements OnInit {
    customerForm: FormGroup;
    customer: Customer = new Customer();
    emailMessage: string;

    get addresses(): FormArray{
        return <FormArray>this.customerForm.get('addresses');
    }

    private validationMessages = {
        required: 'Please enter your email address.',
        pattern: 'Please enter a valid email address.'
    };

    constructor(private fb: FormBuilder) { }

    /* NOTE: 
    To build a complex form, we can use FormBuilder class:
    https://angular.io/api/forms/FormBuilder
    */
    /* NOTE: To set built-in validations: 
    https://www.concretepage.com/angular-2/angular-2-formgroup-example#validation
    https://angular.io/api/forms/Validators
    */
    /* NOTE: we can group several inputs into one logical FormGroup.
    For example, we need users to enter an email address and confirm it. We can define an "emailGroup" 
    FormGroup in our form model that contains an "email" FormControl and a "confirmEmail" FormControl. 
    Then, in the template. We can define a "div" element that has formGroupName equal to emailGroup.
    This div contains 2 inputs: One for the "email" FormControl and the other for "confirmEmail" FormControl.
    */
    ngOnInit(): void {
        this.customerForm = this.fb.group({
            /* NOTE: 
            For a FormControl object, the first value in the array is the initial value of this input,
            and the second value in the array, which is also an array, consists of validators for this input.
            For a FormGroup object created by FormBuilder.group() method, the first parameter is a form model object,
            and the second parameter is a validator object.
            */
            firstName: ['', [Validators.required, Validators.minLength(3)]],
            lastName: ['', [Validators.required, Validators.maxLength(50)]],
            emailGroup: this.fb.group({
                email: ['', [Validators.required, Validators.pattern('[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+')]],
                confirmEmail: ['', Validators.required],
            }, {validator: emailMatcher}),  // NOTE: The emailGroup will be the AbstractControl object to be passed to emailMatcher() validator
            phone: '',
            notification: 'email',
            rating: ['', ratingRange(1, 5)],
            sendCatalog: true,
            addresses: this.fb.array([this.buildAddress()])
        });

        this.customerForm.get('notification').valueChanges
                         .subscribe(value => this.setNotification(value));

        const emailControl = this.customerForm.get('emailGroup.email');
        emailControl.valueChanges.debounceTime(1000).subscribe(value =>
            this.setMessage(emailControl));
    }

    addAddress(): void {
        this.addresses.push(this.buildAddress());
    }

    buildAddress(): FormGroup {
        return this.fb.group({
                addressType: 'home',
                street1: ['', Validators.required],
                street2: '',
                city: '',
                state: '',
                zip: ''
        });
    }

    populateTestData(): void {
        this.customerForm.patchValue({
            firstName: 'Jack',
            lastName: 'Harkness',
            emailGroup: {email: 'jack@torchwood.com', confirmEmail: 'jack@torchwood.com'}
        });
    }

    save(): void {
        console.log('Saved: ' + JSON.stringify(this.customerForm.value));
    }

    setMessage(c: AbstractControl): void {
        this.emailMessage = '';
        if ((c.touched || c.dirty) && c.errors) {
            this.emailMessage = Object.keys(c.errors).map(key =>
                this.validationMessages[key]).join(' ');
        }
    }

    /* NOTE:
    To change validators in code: https://angular.io/api/forms/AbstractControl#setValidators
    After validators are changed, the forms are NOT evaluated against the latest validators.
    In order to re-validate the forms, we need to invoke updateValueAndValidity(): 
    https://angular.io/api/forms/AbstractControl#updateValueAndValidity
    */
    setNotification(notifyVia: string): void {
        const phoneControl = this.customerForm.get('phone');
        if (notifyVia === 'text') {
            phoneControl.setValidators(Validators.required);
        } else { // if (notifyVia === 'email')
            // NOTE: Email Validation is already done by the built-in pattern validator
            phoneControl.clearValidators();
        }
        phoneControl.updateValueAndValidity();
    }
}
