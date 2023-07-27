import { LightningElement, wire, api ,track } from 'lwc';
import getAccounts from '@salesforce/apex/AccountController.getAccounts';
import { refreshApex } from '@salesforce/apex';
import { updateRecord } from 'lightning/uiRecordApi';

import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import NAME_FIELD from '@salesforce/schema/Account.Name';
import OWNER_FIELD from '@salesforce/schema/Account.Owner.Name';
import PHONE_FIELD from '@salesforce/schema/Account.Phone';
import WEBSITE_FIELD from '@salesforce/schema/Account.Website';
import ANNUAL_REVENUE_FIELD from '@salesforce/schema/Account.AnnualRevenue';
import ID_FIELD from '@salesforce/schema/Account.Id';

const COLS = [
    {
        label: 'Name',
        fieldName: NAME_FIELD.fieldApiName,
        editable: true,
        sortable: true
    },
    {
        label: 'Owner',
       // fieldName: OWNER_FIELD.fieldApiName,
        fieldName:'Owner.Name',
        editable: false
    },
    {
        label: 'Phone',
        fieldName: PHONE_FIELD.fieldApiName,
        editable: true
    },
    { label: 'Website', fieldName: WEBSITE_FIELD.fieldApiName, editable: true },
    {
        label: 'Website',
        fieldName: WEBSITE_FIELD.fieldApiName,
        type: 'Website',
        editable: true
    },
    {
        label: 'Annual Revenue',
        fieldName: ANNUAL_REVENUE_FIELD.fieldApiName,
        type: 'Currency',
        editable: true
    }
];
export default class AccountListView extends LightningElement {
    @api recordId;
    columns = COLS;
    draftValues = [];
    backupaccounts ;
    @track searchKey  ='';
    data = [];
    @wire(getAccounts, { searchstring:'$searchKey' })
    accounts;
    /*connectedCallback() {
        this.data = [...this.accounts.data];
    }*/
    async handleSave(event) {
        // Convert datatable draft values into record objects
        const records = event.detail.draftValues.slice().map((draftValue) => {
            const fields = Object.assign({}, draftValue);
            return { fields };
        });

        // Clear all datatable draft values
        this.draftValues = [];

        try {
            console.log('test');
            console.log(records);
            // Update all records in parallel thanks to the UI API
            const recordUpdatePromises = records.map((record) =>
                updateRecord(record)
            );
            await Promise.all(recordUpdatePromises);

            // Report success with a toast
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Success',
                    message: 'Accounts updated',
                    variant: 'success'
                })
            );

            // Display fresh data in the datatable
            await refreshApex(this.accounts);
        } catch (error) {
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Error updating or reloading Accounts',
                    message: error.body.message,
                    variant: 'error'
                })
            );
        }
    }

    handleTextChange(event){       
        try {
           
            if(event.target.value.length > 2){
                this.searchKey  = event.target.value;
          //  refreshApex(this.accounts);
            }
            if(event.target.value.length ==0){
                this.searchKey  = '';
            }
        } catch (error) {
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Error updating or reloading Accounts',
                    message: error.body.message,
                    variant: 'error'
                })
            );
        }
    }
}