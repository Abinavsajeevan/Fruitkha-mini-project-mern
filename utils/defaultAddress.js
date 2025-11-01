const Address = require("../models/Address");

async function defaultAddress() {
    

       //this was store first doc to default
       const isDefaultAddress = await Address.findOne({isDefault: true})
       if(!isDefaultAddress) {
        const firstAddress = await Address.findOne()
        firstAddress.isDefault = true;
        await firstAddress.save();
       }

    }

module.exports = defaultAddress