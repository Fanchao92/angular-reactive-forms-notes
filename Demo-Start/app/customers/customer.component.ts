import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { Customer } from './customer';

// NOTE: Any code using Angular reactive forms should import ReactiveFormsModule in the module file.
/* NOTE: To update form from component, we should use setValue() or patchValue().
   https://angular.io/api/forms/FormGroup#setValue
   https://angular.io/api/forms/FormGroup#patchValue
*/


@Component({
    selector: 'my-signup',
    templateUrl: './app/customers/customer.component.html'
})
export class CustomerComponent  {
	customerForm: FormGroup;
    customer: Customer= new Customer();

    ngOnInit(): void {
    	// NOTE: To build a complex form, we can use FormBuilder class
    	this.customerForm = new FormGroup({
    		firstName: new FormControl(),
    		lastName: new FormControl(),
    		email: new FormControl(),
    		sendCatalog: new FormControl(true)
    	});
    }

    save() {
        console.log(this.customerForm);
        console.log('Saved: ' + JSON.stringify(this.customerForm.value));
    }
 }
